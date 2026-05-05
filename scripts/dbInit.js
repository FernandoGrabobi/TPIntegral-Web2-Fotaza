require('dotenv').config();
const { sequelize, User } = require('./models'); // Ajusta la ruta si el script está en una subcarpeta
const bcrypt = require('bcrypt');

async function init() {
  try {
    // 1. Sincroniza la base de datos (borra y crea todo de nuevo)
    console.log('Conectando y sincronizando tablas...');
    await sequelize.sync({ force: true }); 
    console.log('Tablas creadas con éxito.');

    // 2. Crea los usuarios de prueba obligatorios para que el profesor pueda testear
    const hashedPass = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@fotaza.com',
        password: hashedPass,
        role: 'admin',
        status: 'active'
      },
      {
        username: 'validador',
        email: 'validador@fotaza.com',
        password: hashedPass,
        role: 'validator', // Rol para el validador de contenidos
        status: 'active'
      },
      {
        username: 'usuario1',
        email: 'user@fotaza.com',
        password: hashedPass,
        role: 'user',
        status: 'active'
      }
    ]);

    console.log('Usuarios de prueba creados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

init();