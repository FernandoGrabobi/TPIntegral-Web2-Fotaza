const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body); 
        
        const { username, email, password } = req.body;
        
        if (!password) {
            return res.send("Error: No se recibió contraseña");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            status: 'active'
        });
        
        res.send('<h1>¡Registro exitoso!</h1>');
    } catch (error) {
        console.log("--------- ERROR DETECTADO ---------");
        console.error(error); 
        res.status(500).send(`El servidor falló pero no se apagó. Error: ${error.message}`);
    }
};