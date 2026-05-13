const { Follow, User, Notification } = require('../models');

exports.follow = async (req, res)=>{
  try{
    const targetId = parseInt(req.params.id);
    if (targetId === req.session.userId){
      req.session.flash = {type:'error',message:'No podés seguirte a vos mismo/a.'};
      return res.redirect(`/users/${targetId}`);
    }
    const target = await User.findByPk(targetId);
    if(!target) return res.redirect('/');
    const [, created] = await Follow.findOrCreate({
      where: {followerId: req.session.userId, followingId: targetId}
    });
    if(created){
      await Notification.create({
        userId: targetId,
        actorId: req.session.userId,
        type: 'follow'
      });
      req.session.flash ={type:'success', message:`Ahora seguís a ${target.username}.`};
    }else{
      req.session.flash ={type:'info', message:`Ya seguías a ${target.username}.`};
    }
    res.redirect(`/users/${targetId}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};

exports.unfollow = async(req,res)=>{
  try{
    const targetId = parseInt(req.params.id);
    await Follow.destroy({
      where:{followerId:req.session.userId, followingId:targetId}
    });
    req.session.flash ={type:'success',message:'Dejaste de seguir a este usuario.'};
    res.redirect(`/users/${targetId}`);
  }catch(error){
    console.error(error);
    res.redirect('/');
  }
};