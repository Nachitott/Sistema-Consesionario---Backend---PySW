const Venta = require('../models/venta.model');
const ventaCtrl = {};

// Obtener todos los ventas (GET) 
ventaCtrl.getVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener los ventas.' });
    }
};

// Obtener UN venta (GET)
ventaCtrl.getVenta = async (req, res) => {
    try {
        // Buscamos por la clave primaria (id numérico)
        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({ status: '0', msg: 'Venta no encontrada.' });
        }
        res.json(venta);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener la venta.' });
    }
};

// agrega una venta (POST)
ventaCtrl.createVenta = async (req, res) => {
    try {
        // Sequelize usa .create() para instanciar y guardar en un solo paso
        const passwordHash = await bcrypt.hash(req.body.password, 10); // Hash de la contraseña
        console.log(req.body);
        await Venta.create({ ...req.body, password: passwordHash });
        res.json({ status: '1', msg: 'Venta guardada.' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando operacion.' });
    }
};

// actualiza una venta (PUT)
ventaCtrl.editVenta = async (req, res) => {
    try {
        await Venta.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Venta actualizada' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

// Eliminar una venta (DELETE)
ventaCtrl.deleteVenta = async (req, res) => {
    try {
        // .destroy() elimina el registro que coincida con el ID enviado por parámetro
        await Venta.destroy({
            where: { id: req.params.id }
        });
        res.json({ status: '1', msg: 'Venta eliminada' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

module.exports = ventaCtrl;