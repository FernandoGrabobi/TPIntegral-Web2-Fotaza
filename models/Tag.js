'use strict';
const {Model} = require('sequelize');

module.exports=(sequelize, DataTypes)=>{
  class Tag extends Model{
    static associate(models){
      Tag.belongsToMany(models.Post,{
        through: 'PostTags',
        as: 'posts',
        foreignKey: 'tagId',
        otherKey: 'postId'
      });
    }
  }
  Tag.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name:{
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {notEmpty: true}
    }
  },{
    sequelize,
    modelName: 'Tag',
    tableName: 'Tags',
    timestamps: false
  });
  return Tag;
};