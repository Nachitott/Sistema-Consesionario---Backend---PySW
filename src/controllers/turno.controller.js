const { Turno, Vehiculo, Usuario } = require('../../config/database');

const turnoCtrl = {};

// Obtener todos los turnos con clientes y vehículos asociados
turnoCtrl.getTurnos = async (req, res) => {
    try {
        const turnos = await Turno.findAll({
            include: [
                { model: Usuario, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'] },
                { model: Vehiculo, as: 'vehiculo', attributes: ['id', 'marca', 'modelo', 'anio', 'precio', 'estado'] }
            ],
            order: [['fechaHora', 'ASC']]
        });
        res.json(turnos);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener los turnos.', error: error.message });
    }
};

// Obtener un turno por ID
turnoCtrl.getTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const turno = await Turno.findByPk(id, {
            include: [
                { model: Usuario, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'] },
                { model: Vehiculo, as: 'vehiculo', attributes: ['id', 'marca', 'modelo', 'anio', 'precio', 'estado'] }
            ]
        });
        if (!turno) {
            return res.status(404).json({ status: '0', msg: 'Turno no encontrado.' });
        }
        res.json(turno);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener el turno.', error: error.message });
    }
};

// Obtener el historial de turnos de un cliente específico
turnoCtrl.getTurnosByCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;

        // Verificar que el cliente existe
        const cliente = await Usuario.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ status: '0', msg: 'Cliente no encontrado.' });
        }

        const turnos = await Turno.findAll({
            where: { clienteId },
            include: [
                { model: Vehiculo, as: 'vehiculo', attributes: ['id', 'marca', 'modelo', 'anio', 'precio', 'estado'] }
            ],
            order: [['fechaHora', 'DESC']]
        });

        res.json(turnos);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener el historial de turnos del cliente.', error: error.message });
    }
};

// Solicitar un nuevo turno
turnoCtrl.createTurno = async (req, res) => {
    try {
        const { clienteId, vehiculoId, fechaHora, motivo, observaciones } = req.body;

        // Validar campos obligatorios
        if (!clienteId || !fechaHora || !motivo) {
            return res.status(400).json({ status: '0', msg: 'Faltan campos obligatorios (clienteId, fechaHora, motivo).' });
        }

        // Verificar que el cliente existe
        const cliente = await Usuario.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ status: '0', msg: 'Cliente no encontrado.' });
        }

        // Verificar que el vehículo existe si es provisto
        if (vehiculoId) {
            const vehiculo = await Vehiculo.findByPk(vehiculoId);
            if (!vehiculo) {
                return res.status(404).json({ status: '0', msg: 'Vehículo no encontrado.' });
            }
        }

        // Crear el turno en estado pendiente
        const nuevoTurno = await Turno.create({
            clienteId,
            vehiculoId: vehiculoId || null,
            fechaHora,
            motivo,
            estado: 'pendiente', // Comienza pendiente de la aprobación del vendedor/admin
            observaciones
        });

        // NOTA: No se modifica el estado del vehículo en la base de datos.

        res.status(201).json({
            status: '1',
            msg: 'Turno solicitado exitosamente. Queda pendiente de aprobación.',
            turno: nuevoTurno
        });
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al solicitar el turno.', error: error.message });
    }
};

// Aprobar un turno
turnoCtrl.aprobarTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const turno = await Turno.findByPk(id);

        if (!turno) {
            return res.status(404).json({ status: '0', msg: 'Turno no encontrado.' });
        }

        if (turno.estado === 'cancelado') {
            return res.status(400).json({ status: '0', msg: 'No se puede aprobar un turno que ha sido cancelado.' });
        }

        // Cambiar estado a aprobado
        turno.estado = 'aprobado';
        await turno.save();

        // NOTA: No se modifica el estado del vehículo.

        res.json({
            status: '1',
            msg: 'Turno aprobado correctamente.',
            turno
        });
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al aprobar el turno.', error: error.message });
    }
};

// Cancelar un turno
turnoCtrl.cancelarTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const { observaciones } = req.body;
        const turno = await Turno.findByPk(id);

        if (!turno) {
            return res.status(404).json({ status: '0', msg: 'Turno no encontrado.' });
        }

        turno.estado = 'cancelado';
        if (observaciones) {
            turno.observaciones = observaciones;
        }
        await turno.save();

        // NOTA: No se modifica el estado del vehículo.

        res.json({
            status: '1',
            msg: 'Turno cancelado correctamente.',
            turno
        });
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al cancelar el turno.', error: error.message });
    }
};

// Reprogramar un turno
turnoCtrl.reprogramarTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaHora, observaciones } = req.body;

        if (!fechaHora) {
            return res.status(400).json({ status: '0', msg: 'Falta la nueva fecha y hora para reprogramar el turno.' });
        }

        const turno = await Turno.findByPk(id);

        if (!turno) {
            return res.status(404).json({ status: '0', msg: 'Turno no encontrado.' });
        }

        if (turno.estado === 'cancelado') {
            return res.status(400).json({ status: '0', msg: 'No se puede reprogramar un turno que ha sido cancelado.' });
        }

        // Actualizar fecha y estado a reprogramado
        turno.fechaHora = fechaHora;
        turno.estado = 'reprogramado';
        if (observaciones) {
            turno.observaciones = observaciones;
        }
        await turno.save();

        // NOTA: No se modifica el estado del vehículo.

        res.json({
            status: '1',
            msg: 'Turno reprogramado correctamente.',
            turno
        });
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al reprogramar el turno.', error: error.message });
    }
};

module.exports = turnoCtrl;