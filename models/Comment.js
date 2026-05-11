'use strict';
const {Model} = require('sequelize');

module.exports=(sequelize, DataTypes)=>{
  class Comment extends Model{
    static associate(models){
      Comment.belongsTo(models.User,{foreignKey: 'userId', as: 'author'});
      Comment.belongsTo(models.Post,{foreignKey: 'postId', as: 'post'});
      Comment.hasMany(models.Report,{foreignKey: 'commentId', as: 'reports'});
    }
  }

  Comment.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    postId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{ model: 'Posts', key: 'id'}
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{ model: 'Users', key: 'id'}
    },
    content:{
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true }
    },
    status:{
      type: DataTypes.ENUM('active', 'deleted'),
      defaultValue: 'active'
    }
  },{
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments',
    timestamps: true
  });

  return Comment;
};