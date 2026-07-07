const { Usuario } = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleuser = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const usuarioCtrl = {};

// Obtener todos los usuarios (GET) 
usuarioCtrl.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: {
                exclude: ["password"]
            }
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener los usuarios.' });
    }
};

// Obtener UN usuario (GET)
usuarioCtrl.getUsuario = async (req, res) => {
    try {
        // Buscamos por la clave primaria (id numérico)
        const usuario = await Usuario.findByPk(req.params.id, {
            attributes: {
                exclude: ["password"]
            }
        });
        if (!usuario) {
            return res.status(404).json({ status: '0', msg: 'Usuario no encontrado.' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener al usuario.' });
    }
};

// actualiza un usuario (PUT)
usuarioCtrl.editUsuario = async (req, res) => {
    try {

        if (req.user.rol !== "admin" && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para editar este usuario.' });
        }

        if (req.user.rol !== "admin") {
            // Evitar que se modifique el rol y fechaIngreso
            delete req.body.rol;
            delete req.body.fechaIngreso;
        }

        await Usuario.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Usuario actualizado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

// Eliminar un usuario (DELETE)
usuarioCtrl.deleteUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ status: '0', msg: 'Usuario no encontrado.' });
        }

        if (req.user.rol !== "admin" && req.user.id !== usuario.id) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para eliminar este usuario.' });
        }

        // .destroy() elimina el registro que coincida con el ID enviado por parámetro
        await usuario.destroy();
        res.json({ status: '1', msg: 'Usuario eliminado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

const SECRET_KEY = process.env.JWT_SECRET;

usuarioCtrl.loginUsuario = async (req, res) => {
    //en req.body se espera que vengan las credenciales de login
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ status: 0, msg: "Faltan credenciales" });
    }
    // Criterio de búsqueda estricto: DEBEN coincidir email Y password

    try {
        //el método findOne retorna un objeto que cumpla con los criterios de busqueda
        const usuario = await Usuario.findOne({
            where: {
                email: req.body.email,
            }
        });
        if (!usuario) {
            return res.status(401).json({
                status: 0,
                msg: "Email o contraseña incorrectos."
            });
        }

        if (!usuario.password || usuario.password === "") {
            return res.status(400).json({
                status: 0,
                msg: "Este usuario se registró mediante Google. Inicie sesión con Google."
            });
        }

        const coincide = await bcrypt.compare(
            req.body.password,
            usuario.password
        );
        if (!coincide) {
            return res.status(401).json({
                status: 0,
                msg: "Email o contraseña incorrectos."
            });
        }

        const untoken = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            SECRET_KEY,
            {
                expiresIn: '4h'
            });

        res.json({
            status: 1,
            token: untoken,
            msg: "success",
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol
            } //retorno información útil para el frontend
        });

    } catch (error) {
        res.status(500).json({
            status: 0,
            msg: 'Error interno en el inicio de sesión.'
        });
    }
}

usuarioCtrl.loginGoogle = async (req, res) => {

    try {

        const ticket = await googleuser.verifyIdToken({

            idToken: req.body.token,

            audience: process.env.GOOGLE_CLIENT_ID

        });

        const payload = ticket.getPayload();

        let usuario = await Usuario.findOne({
            where: {
                email: payload.email
            }
        });

        if (!usuario) {
            usuario = await Usuario.create({
                nombre: payload.given_name,
                apellido: payload.family_name,
                email: payload.email,
                password: "",
                rol: "cliente"
            });
        }

        // Se genera el mismo JWT que en el login normal
        const untoken = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            SECRET_KEY,
            {
                expiresIn: "4h"
            }
        );

        res.json({
            status: 1,
            token: untoken,
            msg: "success",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(401).json({
            status: 0,
            msg: "Token inválido"
        });

    }
}

// agrega un usuario (POST)
usuarioCtrl.createUsuario = async (req, res) => {
    try {
        const { username, nombre, apellido, dni, email, telefono, direccion, ciudad, provincia, fechaNacimiento, password } = req.body;

        const usuarioEmail = await Usuario.findOne({
            where: {
                email: email,
            }
        });
        if (usuarioEmail) {
            return res.status(400).json({ status: '0', msg: 'El email ya está registrado.' });
        }

        const usuarioUsername = await Usuario.findOne({
            where: {
                username: username,
            }
        });
        if (usuarioUsername) {
            return res.status(400).json({ status: '0', msg: 'El nombre de usuario ya está registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10); // Hash de la contraseña
        
        await Usuario.create({
            username,
            nombre,
            apellido,
            dni,
            email,
            telefono,
            direccion,
            ciudad,
            provincia,
            fechaNacimiento,
            password: passwordHash,
            rol: 'cliente', // Forzar rol a 'cliente' para evitar escalamiento de privilegios
            fechaIngreso: new Date()
        });

        res.json({ status: '1', msg: 'Usuario guardado.' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: '0', msg: 'Error procesando operacion.' });
    }
};

module.exports = usuarioCtrl;