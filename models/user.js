'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) =>{
  class User extends Model{
    static associate(models){
      User.hasMany(models.Post,{foreignKey:'userId', as:'posts'});
      User.hasMany(models.Comment,{ oreignKey:'userId', as:'comments'});
      User.hasMany(models.Rating,{foreignKey:'userId', as:'ratings'});
      User.hasMany(models.Report,{foreignKey:'userId', as:'reports'});
      User.hasMany(models.Notification,{foreignKey:'userId', as:'notifications'});
      User.hasMany(models.Collection,{foreignKey:'userId', as:'collections'});
      User.hasMany(models.Message,{foreignKey:'senderId', as:'sentMessages'});
      User.hasMany(models.Message,{foreignKey:'receiverId', as:'receivedMessages'});
      // Follows: un usuario sigue a otros
      User.belongsToMany(models.User,{
        through: models.Follow,
        as: 'following',
        foreignKey: 'followerId',
        otherKey: 'followingId'
      });
      User.belongsToMany(models.User,{
        through: models.Follow,
        as: 'followers',
        foreignKey: 'followingId',
        otherKey: 'followerId'
      });
    }
  }
  User.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username:{
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, len: [3, 50] }
    },
    email:{
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true }
    },
    password:{
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // Roles: 'user', 'validator', 'admin'
    role:{
      type: DataTypes.ENUM('user', 'validator', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    // Status: 'active', 'inactive', 'banned'
    status:{
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      defaultValue: 'active',
      allowNull: false
    },
    avatar:{
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    bio:{
      type: DataTypes.TEXT,
      defaultValue: null
    },
    // Contador de publicaciones bajadas por el validador (al llegar a 3 se inactiva la cuenta)
    removed_posts_count:{
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  });
  return User;
};