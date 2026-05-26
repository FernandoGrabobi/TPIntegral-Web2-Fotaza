'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes)=>{
  class Interested extends Model{
    static associate(models){
      Interested.belongsTo(models.User,{ foreignKey:'userId',as:'user'});
      Interested.belongsTo(models.Post,{ foreignKey:'postId',as:'post'});
    }
  }
  Interested.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    postId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model:'Posts',key:'id'}
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model:'Users',key: 'id'}
    }
  },{
    sequelize,
    modelName: 'Interested',
    tableName: 'Interesteds',
    timestamps: true,
    indexes:[
      {unique: true,fields:['postId','userId']}
    ]
  });
  return Interested;
};