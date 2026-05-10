'use strict';
const {Model}=require('sequelize');

module.exports=(sequelize, DataTypes)=>{
  class Post extends Model{
    static associate(models){
      Post.belongsTo(models.User,{foreignKey: 'userId', as: 'author'});
      Post.hasMany(models.PostImage,{foreignKey: 'postId', as: 'images'});
      Post.hasMany(models.Comment,{foreignKey: 'postId', as: 'comments'});
      Post.hasMany(models.Rating,{foreignKey: 'postId', as: 'ratings'});
      Post.hasMany(models.Report,{foreignKey: 'postId', as: 'reports'});
      Post.hasMany(models.Interested,{foreignKey: 'postId', as: 'interestedUsers'});
      Post.belongsToMany(models.Tag,{
        through: 'PostTags',
        as: 'tags',
        foreignKey: 'postId',
        otherKey: 'tagId'
      });
      Post.belongsToMany(models.Collection,{
        through:'CollectionPosts',
        as:'collections',
        foreignKey:'postId',
        otherKey:'collectionId'
      });
    }
  }
  Post.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title:{
      type:DataTypes.STRING(200),
      allowNull: false,
      validate: {notEmpty: true}
    },
    description:{
      type: DataTypes.TEXT,
      defaultValue: null
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{model: 'Users', key: 'id'}
    },
    status:{
      type:DataTypes.ENUM('active', 'removed', 'under_review'),
      defaultValue: 'active',
      allowNull: false
    },
    license_type:{
      type: DataTypes.ENUM('copyright', 'free'),
      defaultValue: 'free',
      allowNull: false
    },
    watermark_text:{
      type:DataTypes.STRING(100),
      defaultValue: null
    },
    comments_open:{
      type:DataTypes.BOOLEAN,
      defaultValue: true
    },
    avg_rating:{
      type:DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    ratings_count:{
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reports_count:{
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    sequelize,
    modelName:'Post',
    tableName:'Posts',
    timestamps:true
  });
  return Post;
};