'use strict';
const {Model} = require('sequelize');

module.exports=(sequelize, DataTypes)=>{
  class Report extends Model{
    static associate(models){
      Report.belongsTo(models.User,{foreignKey:'userId',as:'reporter'});
      Report.belongsTo(models.Post,{foreignKey:'postId',as:'post'});
      Report.belongsTo(models.Comment,{foreignKey:'commentId',as:'comment'});
    }
  }
  Report.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{model:'Users',key:'id'}
    },
    postId:{
      type: DataTypes.INTEGER,
      defaultValue: null,
      references: { model:'Posts', key:'id'}
    },
    commentId:{
      type: DataTypes.INTEGER,
      defaultValue: null,
      references:{model:'Comments', key:'id'}
    },
    reason:{
      type: DataTypes.ENUM('spam', 'violence', 'adult_content', 'copyright', 'harassment', 'other'),
      allowNull: false
    },
    description:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    status:{
      type: DataTypes.ENUM('pending', 'dismissed', 'accepted'),
      defaultValue:'pending'
    }
  },{
    sequelize,
    modelName: 'Report',
    tableName: 'Reports',
    timestamps: true
  });
  return Report;
};