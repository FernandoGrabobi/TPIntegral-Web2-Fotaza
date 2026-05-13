const {Report, Post, Comment, User} = require('../models');
const {Op} = require('sequelize');

exports.reportPost = async (req,res)=>{
  try{
    const post = await Post.findByPk(req.params.id);
    if(!post)return res.redirect('/');
    const{reason, description} = req.body;
    if(!reason || !description){
      req.session.flash ={type:'error', message:'Completá todos los campos.'};
      return res.redirect(`/posts/${post.id}`);
    }

    const existing = await Report.findOne({where:{postId: post.id, userId: req.session.userId}});
    if(existing){
      req.session.flash ={type:'error', message:'Ya denunciaste esta publicación.'};
      return res.redirect(`/posts/${post.id}`);
    }
    await Report.create({
      postId: post.id,
      userId: req.session.userId,
      reason,
      description
    });
    const reportsCount = post.reports_count + 1;
    const updates = {reports_count: reportsCount};
    if(reportsCount >= 3){
      updates.status = 'under_review';
    }
    await post.update(updates);
    req.session.flash = {type:'success', message:'Denuncia enviada. Será revisada por un moderador.'};
    res.redirect(`/posts/${post.id}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};

exports.reportComment = async (req,res)=>{
  try{
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.redirect('/');
    const {reason, description} = req.body;
    const existing = await Report.findOne({where:{commentId: comment.id, userId:req.session.userId}});
    if(existing){
      req.session.flash = {type:'error', message:'Ya denunciaste este comentario.'};
      return res.redirect(`/posts/${comment.postId}`);
    }
    await Report.create({
      commentId: comment.id,
      userId: req.session.userId,
      reason,
      description
    });
    req.session.flash = {type:'success',message:'Denuncia de comentario enviada.'};
    res.redirect(`/posts/${comment.postId}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};

exports.validatorPanel = async (req,res)=>{
  try{
    const postsUnderReview = await Post.findAll({ where:{status: 'under_review'}, include:[ { model: User, as:'author',attributes:['id', 'username']},
        {
          model: Report, as:'reports',
          where:{status: 'pending'},
          required: false,
          include:[{model: User, mas:'reporter',attributes:['id','username']}]
        }
      ],
      order:[['updatedAt','DESC']]
    });
    res.render('validator/panel',{title:'Panel de Moderación',posts:postsUnderReview});
  }catch(error){
    console.error(error);
    res.render('validator/panel',{title:'Panel de Moderación',posts:[]});
  }
};
exports.removePost = async (req,res)=>{
  try {
    const post = await Post.findByPk(req.params.id,{include:[{model:User, as:'author'}]});
    if(!post)return res.redirect('/validator');
    await post.update({status:'removed'});
    await Report.update({status:'accepted'},{where:{postId: post.id}});
    const author =post.author;
    const removedCount =author.removed_posts_count + 1;
    const authorUpdates ={removed_posts_count: removedCount};

    // Si llega a 3 publicaciones bajadas -> inactivar cuenta
    if(removedCount >= 3){
      authorUpdates.status = 'inactive';
    }
    await author.update(authorUpdates);
    req.session.flash = {type:'success',message:'Publicación dada de baja.'};
    res.redirect('/validator');
  } catch(error){
    console.error(error);
    res.redirect('/validator');
  }
};

exports.dismissReports = async (req,res)=>{
  try{
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.redirect('/validator');
    await Report.update({status:'dismissed'},{where:{postId: post.id }});
    await post.update({status:'active',reports_count: 0});
    req.session.flash = {type:'success',message:'Denuncias desestimadas.'};
    res.redirect('/validator');
  }catch(error){
    console.error(error);
    res.redirect('/validator');
  }
};