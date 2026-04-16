'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Post.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    media_url: DataTypes.STRING,
    type: DataTypes.STRING,
    license_type: DataTypes.STRING,
    watermark_text: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};