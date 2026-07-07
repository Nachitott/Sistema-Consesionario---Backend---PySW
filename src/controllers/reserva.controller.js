const { Reserva, Vehiculo, Usuario, sequelize } = require('../../config/database');
const { Op } = require('sequelize');

const reservaCtrl = {};

// Obtener todas las reservas con sus clientes y vehículos asociados
reservaCtrl.getReservas = async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            include: [
                { model: Usuario, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email'] },
                { model: Vehiculo, as: 'vehiculo', attributes: ['id', 'marca', 'modelo', 'anio', 'precio', 'estado'] }
            ]
        });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener las reservas.', error: error.message });
    }
};

// Obtener una reserva por ID
reservaCtrl.getReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findByPk(id, {
            include: [
                { model: Usuario, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email'] },
                { model: Vehiculo, as: 'vehiculo', attributes: ['id', 'marca', 'modelo', 'anio', 'precio', 'estado'] }
            ]
        });
        if (!reserva) {
            return res.status(404).json({ status: '0', msg: 'Reserva no encontrada.' });
        }
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener la reserva.', error: error.message });
    }
};

// Crear una nueva reserva con validaciones de negocio
reservaCtrl.createReserva = async (req, res) => {
    try {
        const { clienteId, vehiculoId, montoSenia, fechaVencimiento, observaciones } = req.body;

        // Validar campos obligatorios
        if (!clienteId || !vehiculoId || montoSenia === undefined || !fechaVencimiento) {
            return res.status(400).json({ status: '0', msg: 'Faltan campos obligatorios.' });
        }

        // Verificar que el cliente existe
        const cliente = await Usuario.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ status: '0', msg: 'Cliente no encontrado.' });
        }

        // Verificar que el vehículo existe
        const vehiculo = await Vehiculo.findByPk(vehiculoId);
        if (!vehiculo) {
            return res.status(404).json({ status: '0', msg: 'Vehículo no encontrado.' });
        }

        // Validar si el auto ya está vendido
        if (vehiculo.estado === 'vendido') {
            return res.status(400).json({ status: '0', msg: 'El vehículo ya ha sido vendido.' });
        }

        // Validar que el vehículo esté disponible
        if (vehiculo.estado !== 'disponible') {
            return res.status(400).json({ status: '0', msg: 'El vehículo no está disponible para reserva (puede estar reservado o inactivo).' });
        }

        // Asegurar que solo exista una reserva activa al vehículo a la vez
        // Se considera activa si está 'pendiente' o 'confirmada' y no ha vencido
        const reservaActiva = await Reserva.findOne({
            where: {
                vehiculoId,
                estado: { [Op.in]: ['pendiente', 'confirmada'] },
                fechaVencimiento: { [Op.gt]: new Date() }
            }
        });

        if (reservaActiva) {
            return res.status(400).json({
                status: '0',
                msg: 'El vehículo ya posee una reserva activa en curso (pendiente o confirmada).'
            });
        }

        // Crear la reserva en estado pendiente
        const nuevaReserva = await Reserva.create({
            clienteId,
            vehiculoId,
            montoSenia,
            fechaVencimiento,
            estado: 'pendiente', // Comienza pendiente de la aprobación del vendedor
            observaciones
        });

        res.status(201).json({
            status: '1',
            msg: 'Reserva creada exitosamente. Queda pendiente de aprobación.',
            reserva: nuevaReserva
        });
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al crear la reserva.', error: error.message });
    }
};

reservaCtrl.getReservasPorCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const reservas = await Reserva.findAll({
            where: { clienteId },
            include: [
                { model: Vehiculo, as: 'vehiculo', attributes: ['id', 'marca', 'modelo', 'anio', 'precio', 'estado'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener las reservas del cliente.', error: error.message });
    }
};

// Endpoint para que los vendedores aprueben o rechacen la reserva
reservaCtrl.procesarReserva = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { accion } = req.body; // Puede ser 'aprobar' o 'rechazar'

        if (!accion || !['aprobar', 'rechazar'].includes(accion)) {
            await t.rollback();
            return res.status(400).json({ status: '0', msg: 'Acción no válida. Debe ser "aprobar" o "rechazar".' });
        }

        const reserva = await Reserva.findByPk(id, {
            include: [{ model: Vehiculo, as: 'vehiculo' }],
            transaction: t
        });

        if (!reserva) {
            await t.rollback();
            return res.status(404).json({ status: '0', msg: 'Reserva no encontrada.' });
        }

        // Impedir procesar reservas canceladas o finalizadas
        if (reserva.estado === 'finalizada' || reserva.estado === 'cancelada') {
            await t.rollback();
            return res.status(400).json({ status: '0', msg: `No se puede modificar una reserva que ya está "${reserva.estado}".` });
        }

        if (accion === 'aprobar') {
            // Verificar de nuevo si el auto no se vendió entretanto
            if (reserva.vehiculo.estado === 'vendido') {
                await t.rollback();
                return res.status(400).json({ status: '0', msg: 'No se puede aprobar la reserva porque el vehículo ya está vendido.' });
            }

            // Cambiar estado de la reserva a confirmada
            reserva.estado = 'confirmada';
            await reserva.save({ transaction: t });

            // Cambiar el estado del auto a "reservado"
            const vehiculo = reserva.vehiculo;
            vehiculo.estado = 'reservado';
            await vehiculo.save({ transaction: t });

            // Cancelar automáticamente cualquier otra reserva pendiente de este vehículo
            await Reserva.update(
                { estado: 'cancelada', observaciones: 'Cancelada automáticamente debido a la confirmación de otra reserva sobre este vehículo.' },
                {
                    where: {
                        vehiculoId: vehiculo.id,
                        id: { [Op.ne]: reserva.id },
                        estado: 'pendiente'
                    },
                    transaction: t
                }
            );

            await t.commit();

            return res.json({
                status: '1',
                msg: 'Reserva aprobada correctamente. El vehículo ha cambiado su estado a "reservado".',
                reserva
            });

        } else if (accion === 'rechazar') {
            const estadoAnterior = reserva.estado;
            reserva.estado = 'cancelada';
            await reserva.save({ transaction: t });

            // Si estaba confirmada y el vehículo figuraba reservado por esta reserva, vuelve a estar disponible
            const vehiculo = reserva.vehiculo;
            if (estadoAnterior === 'confirmada' && vehiculo.estado === 'reservado') {
                vehiculo.estado = 'disponible';
                await vehiculo.save({ transaction: t });
            }

            await t.commit();

            return res.json({
                status: '1',
                msg: 'Reserva rechazada y cancelada correctamente.',
                reserva
            });
        }
    } catch (error) {
        await t.rollback();
        res.status(500).json({ status: '0', msg: 'Error al procesar la reserva.', error: error.message });
    }
};

module.exports = reservaCtrl;