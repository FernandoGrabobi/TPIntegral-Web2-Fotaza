const { Comment, Post, Notification } = require('../models');

exports.create = async (req, res)=>{
  try{
    const post = await Post.findByPk(req.params.id);
    if(!post || !post.comments_open){
      req.session.flash = {type:'error',message:'Los comentarios están cerrados.'};
      return res.redirect(`/posts/${req.params.id}`);
    }
    const {content} = req.body;
    if(!content || content.trim() === ''){
      req.session.flash = {type: 'error',message:'El comentario no puede estar vacío.'};
      return res.redirect(`/posts/${req.params.id}`);
    }
    await Comment.create({
      postId: post.id,
      userId: req.session.userId,
      content: content.trim()
    });
    if(post.userId !== req.session.userId){
      await Notification.create({
        userId: post.userId,
        actorId: req.session.userId,
        type:'comment',
        postId: post.id
      });
    }
    req.session.flash = {type:'success',message:'Comentario agregado.'};
    res.redirect(`/posts/${req.params.id}`);
  }catch(error){
    console.error('Error en create comment:', error);
    res.redirect(`/posts/${req.params.id}`);
  }
};

exports.delete = async (req, res) => {
  try{
    const comment = await Comment.findByPk(req.params.id,{
      include: [{ association: 'post' }]
    });
    if (!comment) return res.redirect('/');

    const isPostAuthor = comment.post.userId === req.session.userId;
    const isCommentAuthor = comment.userId === req.session.userId;

    if(!isPostAuthor && !isCommentAuthor){
      req.session.flash = {type:'error',message:'No tenés permiso.'};
      return res.redirect(`/posts/${comment.postId}`);
    }
    await comment.update({status: 'deleted'});
    req.session.flash ={type: 'success',message:'Comentario eliminado.'};
    res.redirect(`/posts/${comment.postId}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};