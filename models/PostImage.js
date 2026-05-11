'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes)=>{
  class PostImage extends Model{
    static associate(models) {
      PostImage.belongsTo(models.Post,{ foreignKey: 'postId', as: 'post' });
    }
  }

  PostImage.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    postId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{model: 'Posts', key: 'id'}
    },
    filename:{
      type: DataTypes.STRING(255),
      allowNull: false
    },
    watermarked_filename: {
      type:DataTypes.STRING(255),
      defaultValue: null
    },
    order:{
      type:DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    sequelize,
    modelName:'PostImage',
    tableName:'PostImages',
    timestamps: true
  });
  return PostImage;
};