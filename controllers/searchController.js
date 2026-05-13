const { Post, PostImage, User, Tag } = require('../models');
const { Op } = require('sequelize');

exports.search = async (req, res)=>{
  try {
    const { q, tag, author, license, min_rating, sort_by } = req.query;
    const where ={ status: 'active'};
    const include =[
      {model: User,as:'author', attributes: ['id','username','avatar']},
      {model: PostImage,as: 'images',limit: 1},
      {model: Tag,as:'tags'}
    ];

    if(q && q.trim()){
      where[Op.or]=[
        {title: { [Op.like]: `%${q.trim()}%`}},
        {description: { [Op.like]: `%${q.trim()}%`}}
      ];
    }
    if(license && ['copyright', 'free'].includes(license)){
      where.license_type = license;
    }
    if(min_rating && !isNaN(min_rating)){
      where.avg_rating = {[Op.gte]: parseFloat(min_rating)};
    }
    if(tag && tag.trim()){
      include[2]={
        model: Tag, as: 'tags',
        where: {name:{[Op.like]: `%${tag.trim()}%` }},
        required: true
      };
    }
    if(author && author.trim()){
      include[0]={
        model: User, as:'author',
        attributes: ['id','username','avatar'],
        where: {username: {[Op.like]: `%${author.trim()}%`}},
        required: true
      };
    }
    let order = [['createdAt', 'DESC']];
    if (sort_by === 'rating') order = [['avg_rating', 'DESC'], ['ratings_count', 'DESC']];
    if (sort_by === 'oldest') order = [['createdAt', 'ASC']];
    const posts = await Post.findAll({where,include,order,limit: 24});
    res.render('search/results',{
      title:'Búsqueda',
      posts,
      query:{q,tag,author,license, min_rating,sort_by}
    });
  }catch(error){
    console.error('Error en search:', error);
    res.render('search/results',{title:'Búsqueda',posts:[],query: req.query});
  }
};