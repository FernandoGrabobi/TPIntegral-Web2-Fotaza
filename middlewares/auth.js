/**
 * Middlewares de autenticación y autorización.
 */
exports.requireLogin = (req,res,next)=>{
  if (!req.session.userId){
    req.session.flash = { type: 'error', message: 'Debés iniciar sesión para acceder.' };
    return res.redirect('/auth/login');
  }
  next();
};
exports.requireValidator =(req,res,next)=>{
  if (!req.session.userId){
    return res.redirect('/auth/login');
  }
  if (!['validator', 'admin'].includes(req.session.userRole)){
    return res.status(403).render('error', {message: 'Acceso denegado. Necesitás ser validador.'});
  }
  next();
};
exports.requireAdmin =(req,res,next) =>{
  if (!req.session.userId || req.session.userRole !== 'admin'){
    return res.status(403).render('error',{ message:'Acceso denegado.'});
  }
  next();
};
exports.setCurrentUser =async (req,res,next)=>{
  res.locals.currentUser =null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  if(req.session.userId){
    try {
      const {User, Notification} = require('../models');
      const user = await User.findByPk(req.session.userId,{
        attributes: ['id','username','email','role','status','avatar']
      });
      if(user){
        res.locals.currentUser = user;
        const unread = await Notification.count({
          where: { userId: user.id, read: false }
        });
        res.locals.unreadNotifications = unread;
      }
    } catch(err){
      console.error('Error en setCurrentUser:', err);
    }
  }
  next();
};