const {Collection, Post, PostImage} = require('../models');

exports.index = async (req, res) => {
  try{
    const collections = await Collection.findAll({
      where:{ userId:req.session.userId},
      include:[{
        model: Post,as:'posts',
        include:[{ model:PostImage,as:'images',limit: 1}],
        through:{ attributes: [] }
      }],
      order:[['createdAt', 'DESC']]
    });
    res.render('collections/index',{title:'Mis Colecciones',collections});
  }catch(error){
    console.error(error);
    res.render('collections/index',{title:'Mis Colecciones',collections:[]});
  }
};
exports.create = async (req,res)=>{
  try{
    const {name,description} =req.body;
    if(!name){
      req.session.flash = {type:'error',message:'El nombre es obligatorio.'};
      return res.redirect('/collections');
    }
    await Collection.create({userId:req.session.userId,name,description});
    req.session.flash ={type:'success',message:'Colección creada.'};
    res.redirect('/collections');
  }catch(error){
    console.error(error);
    res.redirect('/collections');
  }
};
exports.addPost = async (req,res)=>{
  try {
    const collection = await Collection.findOne({
      where:{id:req.params.id, userId:req.session.userId}
    });
    if(!collection){
      req.session.flash = {type:'error', message:'Colección no encontrada.'};
      return res.redirect('/collections');
    }
    const post = await Post.findByPk(req.params.postId);
    if (!post)return res.redirect('/');
    const posts = await collection.getPosts({where:{id:post.id}});
    if(posts.length > 0){
      req.session.flash = {type:'error',message:'Esta publicación ya está en la colección.'};
      return res.redirect(`/posts/${post.id}`);
    }
    await collection.addPost(post);
    req.session.flash = {type:'success',message:`Publicación guardada en "${collection.name}".`};
    res.redirect(`/posts/${post.id}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};
exports.removePost = async (req,res)=>{
  try{
    const collection = await Collection.findOne({
      where: {id:req.params.id,userId:req.session.userId}
    });
    if (!collection) return res.redirect('/collections');
    const post = await Post.findByPk(req.params.postId);
    if (post) await collection.removePost(post);
    req.session.flash = {type:'success',message:'Publicación removida de la colección.'};
    res.redirect('/collections');
  }catch(error){
    console.error(error);
    res.redirect('/collections');
  }
};
exports.delete = async (req,res)=>{
  try{
    const collection = await Collection.findOne({
      where:{id: req.params.id, userId: req.session.userId}
    });
    if(collection) await collection.destroy();
    req.session.flash = {type:'success',message:'Colección eliminada.'};
    res.redirect('/collections');
  }catch(error){
    console.error(error);
    res.redirect('/collections');
  }
};