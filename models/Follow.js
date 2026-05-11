'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes)=>{
  class Follow extends Model{
    static associate(models){
      Follow.belongsTo(models.User, {foreignKey:'followerId', as:'follower'});
      Follow.belongsTo(models.User, {foreignKey:'followingId', as:'following'});
    }
  }
  Follow.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    followerId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model: 'Users', key:'id'}
    },
    followingId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model:'Users', key:'id'}
    }
  },{
    sequelize,
    modelName: 'Follow',
    tableName: 'Follows',
    timestamps: true,
    indexes:[
      { unique: true, fields:['followerId','followingId']}
    ]
  });
  return Follow;
};