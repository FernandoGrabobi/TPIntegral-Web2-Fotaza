require('dotenv').config();
const { sequelize, User, Post, PostImage, Tag, Comment, Rating, Follow, Collection } = require('./models');
const bcrypt = require('bcrypt');

async function init() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.');

    console.log('🔄 Sincronizando tablas (force: true borra y recrea todo)...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas.');

    // ── Usuarios de prueba ────────────────────────
    const pass = await bcrypt.hash('123456', 10);

    const [admin, validador, user1, user2] = await User.bulkCreate([
      { username: 'admin', email: 'admin@fotaza.com', password: pass, role: 'admin', status: 'active' },
      { username: 'validador', email: 'validador@fotaza.com', password: pass, role: 'validator', status: 'active' },
      { username: 'ana_foto', email: 'ana@fotaza.com', password: pass, role: 'user', status: 'active' },
      { username: 'carlos_lens', email: 'carlos@fotaza.com', password: pass, role: 'user', status: 'active' }
    ]);
    console.log('✅ Usuarios de prueba creados.');

    // ── Tags de ejemplo ───────────────────────────
    const [paisaje, naturaleza, retrato, ciudad, abstracto] = await Tag.bulkCreate([
      { name: 'paisaje' }, { name: 'naturaleza' }, { name: 'retrato' },
      { name: 'ciudad' }, { name: 'abstracto' }
    ]);

    // ── Posts de ejemplo ──────────────────────────
    const post1 = await Post.create({
      title: 'Amanecer en las sierras',
      description: 'Fotografía tomada al amanecer en las sierras de Córdoba.',
      userId: user1.id,
      license_type: 'free',
      status: 'active',
      avg_rating: 4.5,
      ratings_count: 2
    });
    await PostImage.create({ postId: post1.id, filename: 'sample1.jpg', order: 0 });
    await post1.addTags([paisaje, naturaleza]);

    const post2 = await Post.create({
      title: 'Buenos Aires de noche',
      description: 'Vista nocturna del obelisco.',
      userId: user2.id,
      license_type: 'copyright',
      watermark_text: '© Carlos Lens 2026',
      status: 'active',
      avg_rating: 3.8,
      ratings_count: 5
    });
    await PostImage.create({ postId: post2.id, filename: 'sample2.jpg', order: 0 });
    await post2.addTags([ciudad]);

    // ── Comentarios ───────────────────────────────
    await Comment.create({ postId: post1.id, userId: user2.id, content: '¡Hermosa foto! Los colores son increíbles.' });
    await Comment.create({ postId: post2.id, userId: user1.id, content: 'Qué perspectiva tan interesante del obelisco.' });

    // ── Ratings ───────────────────────────────────
    await Rating.create({ postId: post1.id, userId: user2.id, score: 5 });
    await Rating.create({ postId: post2.id, userId: user1.id, score: 4 });

    // ── Follows ───────────────────────────────────
    await Follow.create({ followerId: user1.id, followingId: user2.id });
    await Follow.create({ followerId: user2.id, followingId: user1.id });

    // ── Colecciones ───────────────────────────────
    const col = await Collection.create({ userId: user1.id, name: 'Paisajes favoritos', description: 'Mis fotos preferidas de paisajes' });
    await col.addPost(post1);

    console.log('✅ Datos de prueba cargados correctamente.');
    console.log('\n📋 USUARIOS DE PRUEBA:');
    console.log('  admin@fotaza.com     / 123456  (rol: admin)');
    console.log('  validador@fotaza.com / 123456  (rol: validator)');
    console.log('  ana@fotaza.com       / 123456  (rol: user)');
    console.log('  carlos@fotaza.com    / 123456  (rol: user)');
    console.log('\n🚀 Ejecutá: npm start');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    console.error(error);
    process.exit(1);
  }
}

init();