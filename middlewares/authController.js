const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.showLogin = (req,res)=>{
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', { title:'Iniciar sesión'});
};
exports.showRegister=(req,res)=>{
  if (req.session.userId) return res.redirect('/');
  res.render('auth/register', { title:'Crear cuenta'});
};
exports.register = async (req, res)=>{
  try{
    const {username,email,password,confirmPassword} = req.body;
    if(!username || !email || !password){
      req.session.flash ={type:'error',message:'Todos los campos son obligatorios.'};
      return res.redirect('/auth/register');
    }
    if(password !== confirmPassword){
      req.session.flash = {type:'error',message:'Las contraseñas no coinciden.'};
      return res.redirect('/auth/register');
    }
    if(password.length < 6){
      req.session.flash ={type:'error',message:'La contraseña debe tener al menos 6 caracteres.'};
      return res.redirect('/auth/register');
    }
    const exists = await User.findOne({where:{email}});
    if(exists){
      req.session.flash ={ type:'error',message:'El email ya está registrado.'};
      return res.redirect('/auth/register');
    }
    const usernameExists = await User.findOne({where:{username}});
    if (usernameExists){
      req.session.flash ={ type:'error',message:'El nombre de usuario ya está en uso.'};
      return res.redirect('/auth/register');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      status: 'active'
    });
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.flash = {type: 'success',message:`¡Bienvenido/a, ${user.username}!`};
    res.redirect('/');
  } catch(error){
    console.error('Error en register:', error);
    req.session.flash = {type: 'error',message: 'Error al registrarse. Intentá de nuevo.'};
    res.redirect('/auth/register');
  }
};

exports.login = async (req, res)=>{
  try{
    const {email,password} = req.body;
    if(!email || !password){
      req.session.flash = { type:'error',message:'Completá todos los campos.'};
      return res.redirect('/auth/login');
    }
    const user = await User.findOne({where:{email}});
    if(!user){
      req.session.flash={type:'error',message:'Credenciales incorrectas.'};
      return res.redirect('/auth/login');
    }
    if(user.status === 'inactive' || user.status === 'banned'){
      req.session.flash={type:'error',message:'Tu cuenta fue desactivada. Contactá al administrador.'};
      return res.redirect('/auth/login');
    }
    const valid = await bcrypt.compare(password, user.password);
    if(!valid){
      req.session.flash = {type:'error',message:'Credenciales incorrectas.'};
      return res.redirect('/auth/login');
    }
    req.session.userId =user.id;
    req.session.userRole =user.role;
    req.session.flash = {type:'success', message:`¡Hola de nuevo, ${user.username}!`};
    res.redirect('/');
  }catch(error){
    console.error('Error en login:',error);
    req.session.flash={ type: 'error', message:'Error al iniciar sesión.' };
    res.redirect('/auth/login');
  }
};
exports.logout=(req,res)=>{
  req.session.destroy(()=>{
    res.redirect('/auth/login');
  });
};