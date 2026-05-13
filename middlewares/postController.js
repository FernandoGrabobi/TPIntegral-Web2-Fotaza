const {Post, PostImage, User, Tag, Comment, Rating, Report, Interested, Collection, Notification } = require('../models');
const {Op} = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename:(req, file, cb)=>{
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});

const fileFilter = (req, file, cb)=>{
  const allowed = ['.jpg','.jpeg','.png','.gif','.webp','.mp4','.mov'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'), false);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits:{fileSize: 20 * 1024 * 1024}
});
async function createNotification(userId, actorId, type, postId = null){
  if(userId === actorId) return;
  await Notification.create({userId,actorId,type,postId});
}
exports.home = async(req,res)=>{
  try{
    const topPosts = await Post.findAll({
      where:{status: 'active'},
      include:[
        {model:User,as: 'author',attributes:['id','username','avatar']},
        {model:PostImage,as: 'images',limit: 1},
        {model:Tag,as: 'tags'}
      ],
      order:[
        ['avg_rating', 'DESC'],
        ['ratings_count', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: 12
    });
    res.render('index', {title: 'Fotaza 2 - Inicio',posts:topPosts});
  } catch(error){
    console.error('Error en home:',error);
    res.render('index',{title:'Fotaza 2',posts: []});
  }
};
exports.showCreate=(req, res)=>{
  res.render('posts/create',{title:'Nueva publicación'});
};

exports.create = async(req,res)=>{
  try{
    const {title,description,license_type,watermark_text,tags} = req.body;
    const files = req.files;

    if(!title){
      req.session.flash = {type: 'error',message:'El título es obligatorio.'};
      return res.redirect('/posts/create');
    }
    if(!files || files.length === 0){
      req.session.flash = {type:'error',message:'Debés subir al menos una imagen.'};
      return res.redirect('/posts/create');
    }
    const post = await Post.create({
      title,
      description: description || null,
      userId: req.session.userId,
      license_type: license_type || 'free',
      watermark_text: license_type === 'copyright' ? watermark_text : null,
      status: 'active'
    });
    for(let i = 0; i < files.length; i++){
      await PostImage.create({
        postId: post.id,
        filename: files[i].filename,
        order: i
      });
    }
    if(tags){
      const tagNames = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
      for(const tagName of tagNames){
        const [tag] = await Tag.findOrCreate({where:{name: tagName }});
        await post.addTag(tag);
      }
    }
    req.session.flash = {type:'success',message:'Publicación creada exitosamente.'};
    res.redirect(`/posts/${post.id}`);
  } catch(error){
    console.error('Error en create post:',error);
    req.session.flash = { type:'error',message:'Error al crear la publicación.'};
    res.redirect('/posts/create');
  }
};

exports.show = async (req,res)=>{
  try{
    const post = await Post.findOne({
      where:{id:req.params.id, status:['active','under_review']},
      include:[
        {model: User, as: 'author', attributes:['id', 'username', 'avatar', 'bio']},
        {model: PostImage,as:'images',order:[['order', 'ASC']]},
        {model: Tag, as: 'tags'},
        {
          model:Comment,as:'comments',
          where:{status: 'active'},
          required:false,
          include:[{ model: User,as:'author',attributes: ['id', 'username', 'avatar']}],
          order:[['createdAt', 'ASC']]
        }
      ]
    });
    if(!post){
      return res.status(404).render('error',{message:'Publicación no encontrada.'});
    }

    let userRating = null;
    let userInterested = null;
    let userFollows = false;

    if(req.session.userId){
      userRating = await Rating.findOne({
        where: {postId: post.id, userId: req.session.userId}
      });
      userInterested = await Interested.findOne({
        where: {postId: post.id,userId:req.session.userId}
      });
      const {Follow} = require('../models');
      const follow = await Follow.findOne({
        where: {followerId: req.session.userId,followingId:post.userId}
      });
      userFollows = !!follow;
    }
    res.render('posts/show',{
      title: post.title,
      post,
      userRating,
      userInterested,
      userFollows
    });
  } catch(error){
    console.error('Error en show post:',error);
    res.status(500).render('error',{message:'Error al cargar la publicación.'});
  }
};

exports.showEdit = async (req, res)=>{
  try{
    const post = await Post.findOne({
      where: {id: req.params.id, userId: req.session.userId},
      include: [{model: Tag, as: 'tags'},{model: PostImage, as: 'images' }]
    });
    if(!post){
      req.session.flash = {type: 'error', message: 'No tenés permiso para editar esta publicación.'};
      return res.redirect('/');
    }
    if(post.reports_count > 0){
      req.session.flash = {type: 'error',message:'No podés editar una publicación con denuncias.'};
      return res.redirect(`/posts/${post.id}`);
    }
    res.render('posts/edit',{title:'Editar publicación',post});
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};

exports.update = async(req, res)=>{
  try{
    const post = await Post.findOne({
      where: {id: req.params.id, userId: req.session.userId}
    });
    if(!post || post.reports_count > 0){
      req.session.flash = {type: 'error', message: 'No podés modificar esta publicación.'};
      return res.redirect('/');
    }
    const {title, description, license_type, watermark_text, tags} = req.body;
    await post.update({title, description, license_type, watermark_text});

    if (tags){
      await post.setTags([]);
      const tagNames = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      for(const tagName of tagNames){
        const [tag] = await Tag.findOrCreate({where:{name: tagName}});
        await post.addTag(tag);
      }
    }
    req.session.flash = {type: 'success', message: 'Publicación actualizada.'};
    res.redirect(`/posts/${post.id}`);
  } catch(error){
    console.error(error);
    req.session.flash = {type: 'error', message: 'Error al actualizar.'};
    res.redirect('/');
  }
};

exports.delete = async (req, res)=>{
  try{
    const post = await Post.findOne({
      where: {id: req.params.id, userId: req.session.userId}
    });
    if (!post){
      req.session.flash = {type:'error', message:'No tenés permiso.'};
      return res.redirect('/');
    }
    await post.update({ status: 'removed' });
    req.session.flash = { type: 'success', message:'Publicación eliminada.'};
    res.redirect('/');
  }catch (error){
    console.error(error);
    res.redirect('/');
  }
};

exports.toggleComments = async (req,res)=>{
  try{
    const post = await Post.findOne({
      where: {id: req.params.id, userId: req.session.userId}
    });
    if(!post) return res.redirect('/');
    await post.update({ comments_open: !post.comments_open});
    res.redirect(`/posts/${post.id}`);
  }catch (error){
    console.error(error);
    res.redirect('/');
  }
};

exports.rate = async (req, res)=>{
  try{
    const post = await Post.findByPk(req.params.id);
    if(!post) return res.redirect('/');

    if(post.userId === req.session.userId){
      req.session.flash = {type: 'error', message: 'No podés valorar tu propia publicación.'};
      return res.redirect(`/posts/${post.id}`);
    }
    const score = parseInt(req.body.score);
    if(score < 1 || score > 5){
      req.session.flash = {type: 'error', message: 'Puntaje inválido.'};
      return res.redirect(`/posts/${post.id}`);
    }
    const[rating, created] = await Rating.findOrCreate({
      where: {postId: post.id, userId: req.session.userId},
      defaults: {score}
    });
    if(!created){
      req.session.flash = {type:'error',message:'Ya valoraste esta publicación.'};
      return res.redirect(`/posts/${post.id}`);
    }
    const allRatings = await Rating.findAll({where:{postId: post.id }});
    const avg = allRatings.reduce((acc, r) => acc + r.score, 0) / allRatings.length;
    await post.update({avg_rating: avg.toFixed(2), ratings_count: allRatings.length});
    await createNotification(post.userId, req.session.userId, 'rating', post.id);
    req.session.flash={type: 'success', message: `Valoraste con ${score} estrellas.`};
    res.redirect(`/posts/${post.id}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};

exports.markInterested = async(req,res)=>{
  try{
    const post = await Post.findByPk(req.params.id,{
      include: [{model: User, as: 'author', attributes: ['id']}]
    });
    if(!post) return res.redirect('/');
    if(post.userId === req.session.userId){
      req.session.flash = {type:'error',message:'No podés marcarte a vos mismo/a.'};
      return res.redirect(`/posts/${post.id}`);
    }
    const [, created] = await Interested.findOrCreate({
      where:{postId: post.id, userId: req.session.userId}
    });
    if(created){
      await createNotification(post.userId,req.session.userId,'interested', post.id);
      req.session.flash={type:'success',message:'Notificamos al autor tu interés.'};
    }else{
      req.session.flash={type: 'info',message:'Ya habías marcado interés en esta publicación.'};
    }
    res.redirect(`/posts/${post.id}`);
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
};

exports.myPosts = async(req, res)=>{
  try{
    const posts = await Post.findAll({
      where:{userId: req.session.userId,status:{[Op.ne]:'removed'}},
      include:[{model:PostImage,as:'images',limit: 1 },{model:Tag,as:'tags'}],
      order:[['createdAt', 'DESC']]
    });
    res.render('posts/myPosts',{title:'Mis publicaciones',posts});
  }catch(error){
    console.error(error);
    res.render('posts/myPosts', {title:'Mis publicaciones',posts:[]});
  }
};

exports.feed = async (req,res)=>{
  try{
    const {Follow} = require('../models');
    const follows = await Follow.findAll({where:{followerId: req.session.userId}});
    const followingIds = follows.map(f => f.followingId);
    const posts = followingIds.length > 0 ? await Post.findAll({
      where:{userId:{[Op.in]: followingIds},status:'active'},
      include:[
        {model:User,as:'author',attributes:['id','username','avatar']},
        {model:PostImage,as:'images',limit: 1},
        {model:Tag,as:'tags' }
      ],
      order:[['createdAt','DESC']],
      limit: 20
    }) : [];
    res.render('posts/feed',{title:'Publicaciones que sigo',posts});
  }catch(error){
    console.error(error);
    res.render('posts/feed',{title:'Feed',posts:[]});
  }
};