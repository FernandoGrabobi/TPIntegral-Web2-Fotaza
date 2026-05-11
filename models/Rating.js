'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes)=>{
  class Rating extends Model{
    static associate(models){
      Rating.belongsTo(models.User, {foreignKey:'userId', as:'user'});
      Rating.belongsTo(models.Post, {foreignKey:'postId', as:'post'});
    }
  }
  Rating.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    postId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{model:'Posts',key:'id'}
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{ model:'Users',key:'id'}
    },
    score:{
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {min: 1, max: 5}
    }
  },{
    sequelize,
    modelName: 'Rating',
    tableName: 'Ratings',
    timestamps: true,
    indexes:[
      {unique: true, fields: ['postId', 'userId']}
    ]
  });
  return Rating;
};