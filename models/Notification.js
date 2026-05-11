'use strict';
const {Model} = require('sequelize');

module.exports=(sequelize, DataTypes)=>{
  class Notification extends Model{
    static associate(models){
      Notification.belongsTo(models.User,{foreignKey:'userId',as:'owner'});
      Notification.belongsTo(models.User,{foreignKey:'actorId', s:'actor'});
      Notification.belongsTo(models.Post,{foreignKey:'postId',as:'post'});
    }
  }
  Notification.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model:'Users',key:'id'}
    },
    actorId:{
      type:DataTypes.INTEGER,
      allowNull: false,
      references: {model: 'Users',key:'id'}
    },
    postId:{
      type: DataTypes.INTEGER,
      defaultValue: null,
      references: {model:'Posts',key:'id'}
    },
    type:{
      type: DataTypes.ENUM('comment', 'rating', 'interested', 'follow'),
      allowNull: false
    },
    read:{
      type:DataTypes.BOOLEAN,
      defaultValue: false
    }
  },{
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    timestamps: true
  });
  return Notification;
};