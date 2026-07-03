const Vendedor = require('../models/vendedor.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const vendedorCtrl = {};

// Obtener todos los vendedores (GET) 
vendedorCtrl.getVendedores = async (req, res) => {
    try {
        const vendedores = await Vendedor.findAll();
        res.json(vendedores);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener los vendedores.' });
    }
};

// Obtener UN vendedor (GET)
vendedorCtrl.getVendedor = async (req, res) => {
    try {
        // Buscamos por la clave primaria (id numérico)
        const vendedor = await Vendedor.findByPk(req.params.id);
        if (!vendedor) {
            return res.status(404).json({ status: '0', msg: 'Vendedor no encontrado.' });
        }
        res.json(vendedor);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener al vendedor.' });
    }
};

// agrega un vendedor (POST)
vendedorCtrl.createVendedor = async (req, res) => {
    try {
        // Sequelize usa .create() para instanciar y guardar en un solo paso
        const passwordHash = await bcrypt.hash(req.body.password, 10); // Hash de la contraseña
        console.log(req.body);
        await Vendedor.create({ ...req.body, password: passwordHash });
        res.json({ status: '1', msg: 'Vendedor guardado.' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando operacion.' });
    }
};

// actualiza un vendedor (PUT)
vendedorCtrl.editVendedor = async (req, res) => {
    try {
        await Vendedor.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Vendedor actualizado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

// Eliminar un vendedor (DELETE)
vendedorCtrl.deleteVendedor = async (req, res) => {
    try {
        // .destroy() elimina el registro que coincida con el ID enviado por parámetro
        await Vendedor.destroy({
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Vendedor eliminado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

const SECRET_KEY = process.env.JWT_SECRET;

vendedorCtrl.loginVendedor = async (req, res) => {
    //en req.body se espera que vengan las credenciales de login
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ status: 0, msg: "Faltan credenciales" });
    }
    // Criterio de búsqueda estricto: DEBEN coincidir email Y password

    try {
        //el método findOne retorna un objeto que cumpla con los criterios de busqueda
        const vendedor = await Vendedor.findOne({
            where: {
                email: req.body.email,
            }
        });
        if (!vendedor) {
            return res.json({
                status: 0,
                msg: "El email ingresado no corresponde a ningún usuario registrado"
            })
        }

        if(!vendedor.password || vendedor.password === "") {
            return res.json({
                status: 0,
                msg: "El usuario se registro mediante Google"
            })
        }

        const coincide = await bcrypt.compare(
            req.body.password,
            vendedor.password
        );
        if (!coincide) {
            return res.json({
                status: 0,
                msg: "La contraseña ingresada es incorrecta"
            })
        }

        const token = jwt.sign(
            {
                id: vendedor.id,
                email: vendedor.email
            },
            SECRET_KEY,
            {
                expiresIn: '2h'
            });

        res.json({
            status: 1,
            token,
            msg: "success",
            vendedor: {
                id: vendedor.id,
                nombre: vendedor.nombre,
                apellido: vendedor.apellido,
                email: vendedor.email
            } //retorno información útil para el frontend
        })

    } catch (error) {
        res.json({
            status: 0,
            msg: 'error'
        })
    }
}

vendedorCtrl.loginGoogle = async (req, res) => {

    try {

        const ticket = await client.verifyIdToken({

            idToken: req.body.token,

            audience: process.env.GOOGLE_CLIENT_ID

        });

        const payload = ticket.getPayload();

        console.log(payload.email);

        console.log(payload.name);

        let vendedor = await Vendedor.findOne({
            where: {
                email: payload.email
            }
        });

        if (!vendedor) {
            vendedor = await Vendedor.create({
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

module.exports = vendedorCtrl;