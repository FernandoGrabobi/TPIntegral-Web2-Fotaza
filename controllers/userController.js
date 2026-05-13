const { User, Post, PostImage, Follow, Tag, Message, Interested } = require('../models');
const { Op } = require('sequelize');

exports.show = async (req, res)=>{
  try{
    const user = await User.findByPk(req.params.id,{
      attributes: ['id','username','email','avatar','bio','role','createdAt']
    });
    if (!user) return res.status(404).render('error',{message:'Usuario no encontrado.'});
    const posts = await Post.findAll({
      where: {userId:user.id,status:'active'},
      include: [{model:PostImage,as:'images',limit: 1}],
      order: [['createdAt','DESC']]
    });

    const followersCount = await Follow.count({where:{followingId: user.id}});
    const followingCount = await Follow.count({where:{followerId: user.id}});
    let isFollowing = false;
    if(req.session.userId){
      const follow = await Follow.findOne({where: {followerId: req.session.userId, followingId: user.id}});
      isFollowing = !!follow;
    }
    res.render('users/show',{
      title: `Perfil de ${user.username}`,
      profileUser: user,
      posts,
      followersCount,
      followingCount,
      isFollowing
    });
  }catch(error){
    console.error(error);
    res.status(500).render('error',{message:'Error al cargar el perfil.'});
  }
};

exports.inbox = async(req,res)=>{
  try{
    const received = await Message.findAll({
      where:{ receiverId: req.session.userId},
      include:[
        {model: User,as:'sender',attributes:['id', 'username', 'avatar']},
        {model: Post,as:'post',attributes:['id', 'title'],required: false}
      ],
      order: [['createdAt', 'DESC']]
    });
    const sent = await Message.findAll({
      where:{senderId: req.session.userId},
      include:[
        { model: User, as:'receiver', attributes:['id', 'username', 'avatar']}
      ],
      order:[['createdAt', 'DESC']]
    });

    res.render('messages/inbox',{title:'Mensajes',received,sent});
  }catch(error){
    console.error(error);
    res.render('messages/inbox',{title:'Mensajes',received: [],sent: []});
  }
};

exports.conversation = async (req, res)=>{
  try{
    const otherId = parseInt(req.params.userId);
    const other = await User.findByPk(otherId, { attributes: ['id', 'username', 'avatar'] });
    if (!other) return res.redirect('/messages');

    const messages = await Message.findAll({
      where:{
        [Op.or]:[
          {senderId: req.session.userId,receiverId: otherId},
          {senderId: otherId, receiverId:req.session.userId}
        ]
      },
      include:[
        {model:User,as:'sender',attributes:['id', 'username', 'avatar']}
      ],
      order:[['createdAt', 'ASC']]
    });
    await Message.update(
      {read: true},
      {where:{ senderId: otherId, receiverId: req.session.userId, read: false }}
    );
    res.render('messages/conversation',{title: `Chat con ${other.username}`, other, messages});
  }catch(error){
    console.error(error);
    res.redirect('/messages');
  }
};

exports.sendMessage = async (req,res)=>{
  try{
    const receiverId = parseInt(req.params.userId);
    const {content,postId} = req.body;

    if(!content || content.trim() === ''){
      req.session.flash = {type:'error',message:'El mensaje no puede estar vacío.'};
      return res.redirect(`/messages/${receiverId}`);
    }
    await Message.create({
      senderId: req.session.userId,
      receiverId,
      content: content.trim(),
      postId: postId || null
    });
    res.redirect(`/messages/${receiverId}`);
  }catch(error){
    console.error(error);
    res.redirect('/messages');
  }
};
exports.interestedList = async (req, res)=>{
  try{
    const interests = await Interested.findAll({
      include:[
        {model: User, as: 'user', attributes:['id', 'username', 'avatar', 'email']},
        {
          model: Post, as: 'post',
          where: { userId: req.session.userId },
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.render('users/interestedList', {title: 'Interesados en mis publicaciones',interests});
  }catch(error){
    console.error(error);
    res.render('users/interestedList',{title:'Interesados',interests:[]});
  }
};