const express = require('express');
const router = express.Router();
const turnoCtrl = require('../controllers/turno.controller');
const authCtrl = require('../../middlewares/authMiddleware');
const { registrarAccion } = require('../../middlewares/auditMiddlewares');

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: APIs para la gestión de turnos o citas (solicitar, aprobar, cancelar, reprogramar) en el concesionario.
 */

/**
 * @swagger
 * /api/turno:
 *   get:
 *     summary: Obtener todos los turnos
 *     description: Retorna un listado de todos los turnos registrados, con los detalles del cliente y el vehículo asociados.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de turnos obtenido correctamente.
 *       401:
 *         description: No autorizado (Token inválido o ausente).
 *       403:
 *         description: Prohibido (solo vendedores y administradores pueden listar todos los turnos).
 *       500:
 *         description: Error interno al obtener los turnos.
 */
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), turnoCtrl.getTurnos);

/**
 * @swagger
 * /api/turno/cliente/{clienteId}:
 *   get:
 *     summary: Obtener historial de turnos de un cliente
 *     description: Retorna la lista histórica de todos los turnos de un cliente en específico, ordenados del más reciente al más antiguo.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del cliente.
 *     responses:
 *       200:
 *         description: Historial de turnos obtenido correctamente.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Cliente no encontrado.
 *       500:
 *         description: Error del servidor al obtener el historial.
 */
router.get('/cliente/:clienteId', authCtrl.verifyToken, turnoCtrl.getTurnosByCliente);

/**
 * @swagger
 * /api/turno/{id}:
 *   get:
 *     summary: Obtener un turno por ID
 *     description: Retorna los detalles de un turno específico identificado por su ID.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno.
 *     responses:
 *       200:
 *         description: Turno obtenido correctamente.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Turno no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', authCtrl.verifyToken, turnoCtrl.getTurno);

/**
 * @swagger
 * /api/turno:
 *   post:
 *     summary: Solicitar un nuevo turno
 *     description: Registra una nueva cita para un cliente, opcionalmente vinculada a un vehículo. El turno se registra en estado 'pendiente' y no modifica el estado del vehículo en la base de datos.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - fechaHora
 *               - motivo
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente.
 *               vehiculoId:
 *                 type: integer
 *                 description: ID del vehículo asociado (opcional).
 *               fechaHora:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora para la cita.
 *               motivo:
 *                 type: string
 *                 description: Razón del turno (ej. Prueba de manejo, Mantenimiento).
 *               observaciones:
 *                 type: string
 *                 description: Comentarios adicionales.
 *     responses:
 *       201:
 *         description: Turno solicitado exitosamente (pendiente de aprobación).
 *       400:
 *         description: Faltan campos requeridos.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Cliente o vehículo no encontrados.
 *       500:
 *         description: Error interno al solicitar el turno.
 */
router.post('/', authCtrl.verifyToken, registrarAccion('Solicitar turno'), turnoCtrl.createTurno);

/**
 * @swagger
 * /api/turno/{id}/aprobar:
 *   put:
 *     summary: Aprobar un turno pendiente
 *     description: Aprueba la solicitud de un turno pendiente cambiando su estado a 'aprobado'. No altera el estado del vehículo.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a aprobar.
 *     responses:
 *       200:
 *         description: Turno aprobado correctamente.
 *       400:
 *         description: No se puede aprobar un turno cancelado.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo para vendedores y administradores).
 *       404:
 *         description: Turno no encontrado.
 *       500:
 *         description: Error interno al aprobar el turno.
 */
router.put('/:id/aprobar', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Aprobar turno'), turnoCtrl.aprobarTurno);

/**
 * @swagger
 * /api/turno/{id}/cancelar:
 *   put:
 *     summary: Cancelar un turno
 *     description: Cambia el estado del turno a 'cancelado'. No altera el estado del vehículo.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a cancelar.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *                 description: Motivo de la cancelación.
 *     responses:
 *       200:
 *         description: Turno cancelado correctamente.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Turno no encontrado.
 *       500:
 *         description: Error interno al cancelar el turno.
 */
router.put('/:id/cancelar', authCtrl.verifyToken, registrarAccion('Cancelar turno'), turnoCtrl.cancelarTurno);

/**
 * @swagger
 * /api/turno/{id}/reprogramar:
 *   put:
 *     summary: Reprogramar un turno
 *     description: Cambia la fecha y hora de la cita y actualiza su estado a 'reprogramado'. No altera el estado del vehículo.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a reprogramar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fechaHora
 *             properties:
 *               fechaHora:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora del turno.
 *               observaciones:
 *                 type: string
 *                 description: Comentarios adicionales acerca de la reprogramación.
 *     responses:
 *       200:
 *         description: Turno reprogramado correctamente.
 *       400:
 *         description: Falta nueva fechaHora, o el turno ya está cancelado.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Turno no encontrado.
 *       500:
 *         description: Error interno al reprogramar el turno.
 */
router.put('/:id/reprogramar', authCtrl.verifyToken, registrarAccion('Reprogramar turno'), turnoCtrl.reprogramarTurno);

module.exports = router;