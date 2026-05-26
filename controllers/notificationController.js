const {Notification, User, Post} = require('../models');

exports.index = async(req,res)=>{
  try{
    const notifications = await Notification.findAll({
      where:{userId: req.session.userId},
      include:[
        {model: User, as:'actor', attributes:['id','username','avatar']},
        {model: Post, as:'post', attributes:['id','title'], required:false}
      ],
      order:[['createdAt', 'DESC']],
      limit: 50
    });
    res.render('notifications/index', {title:'Notificaciones', notifications});
  }catch(error){
    console.error(error);
    res.render('notifications/index', {title:'Notificaciones', notifications:[]});
  }
};
exports.markRead = async (req,res)=>{
  try{
    await Notification.update(
      {read: true},
      {where: {id:req.params.id, userId:req.session.userId}}
    );
    res.redirect('/notifications');
  }catch(error){
    console.error(error);
    res.redirect('/notifications');
  }
};
exports.markAllRead = async(req,res)=>{
  try{
    await Notification.update(
      {read:true},
      {where:{userId: req.session.userId, read:false}}
    );
    res.redirect('/notifications');
  }catch(error){
    console.error(error);
    res.redirect('/notifications');
  }
};