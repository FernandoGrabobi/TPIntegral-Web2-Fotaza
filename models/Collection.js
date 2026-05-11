'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes)=>{
  class Collection extends Model{
    static associate(models){
      Collection.belongsTo(models.User, {foreignKey:'userId',as:'owner'});
      Collection.belongsToMany(models.Post, {
        through: 'CollectionPosts',
        as: 'posts',
        foreignKey: 'collectionId',
        otherKey: 'postId'
      });
    }
  }
  Collection.init({
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
    name:{
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {notEmpty:true}
    },
    description:{
      type: DataTypes.TEXT,
      defaultValue: null
    }
  },{
    sequelize,
    modelName: 'Collection',
    tableName: 'Collections',
    timestamps: true
  });
  return Collection;
};