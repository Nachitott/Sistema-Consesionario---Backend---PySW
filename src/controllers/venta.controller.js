const { Venta } = require('../../config/database');
const { Usuario } = require('../../config/database');
const { Vehiculo } = require('../../config/database');
const ventaCtrl = {};

// Obtener todos los ventas (GET) 
ventaCtrl.getVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [{
                model: Usuario,
                as: 'cliente',
                attributes: { exclude: ['password', "direccion", "fechaNacimiento", "rol", "createdAt", "updatedAt"] }
            },
            {
                model: Usuario,
                as: 'vendedor',
                attributes: { exclude: ['password', "direccion", "fechaNacimiento", "rol", "createdAt", "updatedAt"] }
            },
            {
                model: Vehiculo,
                as: 'vehiculo',
                attributes: { exclude: ["createdAt", "updatedAt"] }
            }]
        });
        res.json(ventas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: '0', msg: 'Error al obtener los ventas.' });
    }
};

// Obtener UN venta (GET)
ventaCtrl.getVenta = async (req, res) => {
    try {

        // Buscamos por la clave primaria (id numérico)
        const venta = await Venta.findByPk(req.params.id, {
            include: [{
                model: Usuario,
                as: 'cliente',
                attributes: { exclude: ['password', "fechaNacimiento", "rol", "createdAt", "updatedAt"] }

            },
            {
                model: Usuario,
                as: 'vendedor',
                attributes: { exclude: ['password', "fechaNacimiento", "rol", "createdAt", "updatedAt"] }

            },
            {
                model: Vehiculo,
                as: 'vehiculo',
                attributes: { exclude: ["createdAt", "updatedAt"] }
            }]
        });
        if (!venta) {
            return res.status(404).json({ status: '0', msg: 'Venta no encontrada.' });
        }

        if (req.user.rol !== "admin" && (req.user.id !== venta.vendedorId && req.user.id !== venta.clienteId)) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para ver esta venta.' });
        }

        res.json(venta);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener la venta.' });
    }
};

// agrega una venta (POST)
ventaCtrl.createVenta = async (req, res) => {
    try {

        const vehiculo = await Vehiculo.findByPk(req.body.vehiculoId);
        if (!vehiculo || !vehiculo.visible) {
            return res.status(404).json({
                status: '0', msg: 'Vehículo no encontrado.'
            });
        }

        const cliente = await Usuario.findByPk(req.body.clienteId);
        if (!cliente || cliente.rol !== "cliente") {
            return res.status(400).json({
                status: '0', msg: "El cliente no existe."
            });
        }

        const vendedor = await Usuario.findByPk(req.body.vendedorId);
        if (!vendedor || vendedor.rol !== "vendedor") {
            return res.status(400).json({
                status: '0', msg: "El vendedor no existe."
            });
        }

        if (req.user.rol !== "admin" && req.user.id !== vendedor.id) {
            return res.status(403).json({ status: '0', msg: 'No se pudo realizar la operacion.' });
        }

        const precioOriginal = vehiculo.precio;
        const descuento = vehiculo.descuento;
        const precioFinal = Number((precioOriginal * (1 - descuento / 100)).toFixed(2));

        // Sequelize usa .create() para instanciar y guardar en un solo paso
        await Venta.create({
            clienteId: cliente.id,
            vendedorId: vendedor.id,
            vehiculoId: vehiculo.id,

            metodoPago: req.body.metodoPago,
            cuotas: req.body.cuotas,
            observaciones: req.body.observaciones,

            precioOriginal,
            descuento,
            precioFinal
        });
        await vehiculo.update({
            visible: false
        });
        res.json({ status: '1', msg: 'Venta guardada.' });
    } catch (error) {
        console.log("error");
        console.log(error);
        res.status(400).json({ status: '0', msg: 'Error procesando operacion.' });
    }
};

// actualiza una venta (PUT)
ventaCtrl.editVenta = async (req, res) => {
    try {

        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({
                status: '0',
                msg: 'Venta no encontrada.'
            });
        }

        if (req.user.rol !== "admin" && req.user.id !== Number(venta.vendedorId)) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para realizar esta accion.' });
        }

        const observaciones = req.body.observaciones || venta.observaciones;
        await venta.update({
            observaciones
        });

        res.json({ status: '1', msg: 'Venta actualizada' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

// Eliminar una venta (DELETE)
ventaCtrl.deleteVenta = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({
                status: "0",
                msg: "Venta no encontrada."
            });
        }
        // .destroy() elimina el registro que coincida con el ID enviado por parámetro
        await venta.destroy();
        res.json({ status: '1', msg: 'Venta eliminada' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
};

// Obtener ventas por cliente (GET)
ventaCtrl.getVentasPorCliente = async (req, res) => {
    try {
        if (req.user.rol !== "admin" && req.user.id !== Number(req.params.clienteId)) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para realizar esta accion.' });
        }

        const ventas = await Venta.findAll({
            where: {
                clienteId: req.params.clienteId
            },
            include: [{
                model: Usuario,
                as: 'vendedor',
                attributes: { exclude: ['password', "direccion", "fechaNacimiento", "rol", "createdAt", "updatedAt"] }

            }, {
                model: Vehiculo,
                as: 'vehiculo',
                attributes: { exclude: ["createdAt", "updatedAt"] }
            }]
        });

        res.json(ventas);

    } catch (error) {
        res.status(500).json({
            status: '0',
            msg: 'Error al obtener las compras del cliente.'
        });
    }
};

//Obtener ventas por vendedor (GET)
ventaCtrl.getVentasPorVendedor = async (req, res) => {
    try {

        if (req.user.rol !== "admin" && req.user.id !== Number(req.params.vendedorId)) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para realizar esta accion.' });
        }

        const ventas = await Venta.findAll({
            where: {
                vendedorId: req.params.vendedorId
            },
            include: [{
                model: Usuario,
                as: 'cliente',
                attributes: { exclude: ['password', "direccion", "fechaNacimiento", "rol", "createdAt", "updatedAt"] }
            },
            {
                model: Vehiculo,
                as: 'vehiculo',
                attributes: { exclude: ["createdAt", "updatedAt"] }
            }]
        });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({
            status: '0',
            msg: 'Error al obtener las ventas del vendedor.'
        });
    }
}

ventaCtrl.getComprobanteVenta = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [{
                model: Usuario,
                as: 'cliente',
                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'rol'] }
            }, {
                model: Usuario,
                as: 'vendedor',
                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'rol'] }
            }, {
                model: Vehiculo,
                as: 'vehiculo',
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }]
        });

        if (!venta) {
            return res.status(404).json({
                status: "0",
                msg: "Venta no encontrada."
            });
        }

        if (req.user.rol !== "admin" && req.user.id !== Number(venta.vendedorId) && req.user.id !== Number(venta.clienteId)) {
            return res.status(403).json({ status: '0', msg: 'No tiene permisos para ver esta venta.' });
        }

        res.json({
            numeroVenta: venta.id,
            fechaVenta: venta.fechaVenta,
            cliente: {
                nombre: venta.cliente.nombre,
                apellido: venta.cliente.apellido,
                dni: venta.cliente.dni
            },
            vendedor: {
                nombre: venta.vendedor.nombre,
                apellido: venta.vendedor.apellido,
                dni: venta.vendedor.dni
            },
            metodoPago: venta.metodoPago,
            precioOriginal: venta.precioOriginal,
            descuento: venta.descuento,
            precioFinal: venta.precioFinal,
        });
    } catch (error) {
        res.status(500).json({
            status: '0',
            msg: 'Error al obtener el comprobante de venta.'
        });
    }
}

module.exports = ventaCtrl;