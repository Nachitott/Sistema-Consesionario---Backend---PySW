const express = require('express');
const router = express.Router();
const reservaCtrl = require('../controllers/reserva.controller');
const authCtrl = require('../../middlewares/authMiddleware');
const { registrarAccion } = require('../../middlewares/auditMiddlewares');
const { validacionCreacionReserva } = require('../../middlewares/validators/reservaValidator');

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: APIs para la gestión de reservas de vehículos por parte de clientes y control de vendedores/admins.
 */

/**
 * @swagger
 * /api/reserva:
 *   get:
 *     summary: Obtener todas las reservas
 *     description: Retorna una lista con todas las reservas registradas en el sistema, incluyendo los datos del cliente y del vehículo asociados.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado obtenido exitosamente.
 *       401:
 *         description: No autorizado (Token inválido o ausente).
 *       403:
 *         description: Permisos insuficientes (requiere rol de vendedor o administrador).
 *       500:
 *         description: Error en el servidor al recuperar las reservas.
 */
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), reservaCtrl.getReservas);

/**
 * @swagger
 * /api/reserva/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     description: Retorna los detalles de una reserva específica identificada por su ID único.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la reserva a buscar.
 *     responses:
 *       200:
 *         description: Detalles de la reserva encontrados.
 *       401:
 *         description: No autorizado (Token inválido o ausente).
 *       404:
 *         description: Reserva no encontrada en el sistema.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', authCtrl.verifyToken, reservaCtrl.getReserva);

/**
 * @swagger
 * /api/reserva:
 *   post:
 *     summary: Crear una nueva reserva
 *     description: Solicita la creación de una nueva reserva sobre un vehículo. Se valida la existencia del cliente, la disponibilidad del vehículo y que no haya reservas vigentes activas sobre la misma unidad.
 *     tags: [Reservas]
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
 *               - vehiculoId
 *               - montoSenia
 *               - fechaVencimiento
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente que solicita la reserva.
 *               vehiculoId:
 *                 type: integer
 *                 description: ID del vehículo a reservar.
 *               montoSenia:
 *                 type: number
 *                 format: float
 *                 description: Monto entregado a cuenta. Debe ser mayor o igual a 0.
 *               fechaVencimiento:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha en que expira la reserva si no se confirma la compra.
 *               observaciones:
 *                 type: string
 *                 description: Notas complementarias sobre la reserva.
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente (queda en estado pendiente).
 *       400:
 *         description: Solicitud incorrecta (faltan campos obligatorios o el auto no está disponible).
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Cliente o vehículo no encontrados.
 *       500:
 *         description: Error del servidor al registrar la reserva.
 */
router.post('/', authCtrl.verifyToken, validacionCreacionReserva, registrarAccion('Crear reserva'), reservaCtrl.createReserva);

/**
 * @swagger
 * /api/reserva/{id}/procesar:
 *   put:
 *     summary: Procesar (Aprobar o Rechazar) una reserva
 *     description: Permite a un vendedor o administrador aprobar o rechazar una reserva pendiente. Aprobarla cambia el estado del vehículo a "reservado" y cancela de forma automática otras reservas pendientes sobre el mismo auto.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a procesar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accion
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [aprobar, rechazar]
 *                 description: Acción a tomar sobre la reserva.
 *     responses:
 *       200:
 *         description: Reserva procesada exitosamente.
 *       400:
 *         description: Acción inválida, o reserva ya finalizada/cancelada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo para vendedores o administradores).
 *       404:
 *         description: Reserva no encontrada.
 *       500:
 *         description: Error interno al procesar la reserva (transacción revertida).
 */
router.put('/:id/procesar', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Procesar reserva'), reservaCtrl.procesarReserva);
router.get('/cliente/:clienteId', authCtrl.verifyToken, reservaCtrl.getReservasPorCliente);
module.exports = router;