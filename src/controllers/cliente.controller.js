const Cliente = require('../models/cliente.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const clienteCtrl = {};

// Obtener todos los clientes (GET) 
clienteCtrl.getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener los clientes.' });
    }
};

// Obtener UN cliente (GET)
clienteCtrl.getCliente = async (req, res) => {
    try {
        // Buscamos por la clave primaria (id numérico)
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ status: '0', msg: 'Cliente no encontrado.' });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener al cliente.' });
    }
};

// agrega un cliente (POST)
clienteCtrl.createCliente = async (req, res) => {
    try {
        // Sequelize usa .create() para instanciar y guardar en un solo paso
        const passwordHash = await bcrypt.hash(req.body.password, 10); // Hash de la contraseña
        console.log(req.body);
        await Cliente.create({ ...req.body, password: passwordHash });
        res.json({ status: '1', msg: 'Cliente guardado.' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando operacion.' });
    }
};

// actualiza un cliente (PUT)
clienteCtrl.editCliente = async (req, res) => {
    try {
        await Cliente.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Cliente actualizado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

// Eliminar una cliente (DELETE)
clienteCtrl.deleteCliente = async (req, res) => {
    try {
        // .destroy() elimina el registro que coincida con el ID enviado por parámetro
        await Cliente.destroy({
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Cliente eliminado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

const SECRET_KEY = process.env.JWT_SECRET;

clienteCtrl.loginCliente = async (req, res) => {
    //en req.body se espera que vengan las credenciales de login
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ status: 0, msg: "Faltan credenciales" });
    }
    // Criterio de búsqueda estricto: DEBEN coincidir email Y password

    try {
        //el método findOne retorna un objeto que cumpla con los criterios de busqueda
        const cliente = await Cliente.findOne({
            where: {
                email: req.body.email,
            }
        });
        if (!cliente) {
            return res.json({
                status: 0,
                msg: "El email ingresado no corresponde a ningún usuario registrado"
            })
        }

        if(!cliente.password || cliente.password === "") {
            return res.json({
                status: 0,
                msg: "El usuario se registro mediante Google"
            })
        }

        const coincide = await bcrypt.compare(
            req.body.password,
            cliente.password
        );
        if (!coincide) {
            return res.json({
                status: 0,
                msg: "La contraseña ingresada es incorrecta"
            })
        }

        const token = jwt.sign(
            {
                id: cliente.id,
                email: cliente.email
            },
            SECRET_KEY,
            {
                expiresIn: '2h'
            });

        res.json({
            status: 1,
            token,
            msg: "success",
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                email: cliente.email
            } //retorno información útil para el frontend
        })

    } catch (error) {
        res.json({
            status: 0,
            msg: 'error'
        })
    }
}

clienteCtrl.loginGoogle = async (req, res) => {

    try {

        const ticket = await client.verifyIdToken({

            idToken: req.body.token,

            audience: process.env.GOOGLE_CLIENT_ID

        });

        const payload = ticket.getPayload();

        console.log(payload.email);

        console.log(payload.name);

        let cliente = await Cliente.findOne({
            where: {
                email: payload.email
            }
        });

        if (!cliente) {
            cliente = await Cliente.create({
                nombre: payload.given_name,
                apellido: payload.family_name,
                email: payload.email,
                password: ""
            });
        }
    }

    catch (error) {
        res.status(401).json({
            msg: "Token inválido"
        });

    }
}

module.exports = clienteCtrl;