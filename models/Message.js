'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes)=>{
  class Message extends Model{
    static associate(models){
      Message.belongsTo(models.User,{foreignKey:'senderId',as:'sender'});
      Message.belongsTo(models.User,{foreignKey:'receiverId',as:'receiver'});
      Message.belongsTo(models.Post,{foreignKey:'postId',as:'post'});
    }
  }
  Message.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    senderId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{ model:'Users',key:'id'}
    },
    receiverId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{model:'Users',key:'id'}
    },
    postId:{
      type: DataTypes.INTEGER,
      defaultValue: null,
      references: {model:'Posts',key:'id'}
    },
    content:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    read:{
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },{
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
    timestamps: true
  });
  return Message;
};