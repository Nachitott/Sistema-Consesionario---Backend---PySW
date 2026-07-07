const express = require('express');
const router = express.Router();
const emailCtrl = require('../controllers/email.controller');
const authCtrl = require('../../middlewares/authMiddleware');
const { registrarAccion } = require('../../middlewares/auditMiddlewares');
const { validacionEmail } = require('../../middlewares/validators/emailValidator');

/**
 * @swagger
 * tags:
 *   name: Emails
 *   description: APIs para gestionar suscripciones de boletines informativos y correos de novedades.
 */

/**
 * @swagger
 * /api/email:
 *   post:
 *     summary: Suscribir un correo electrónico
 *     description: Registra un correo electrónico para recibir novedades de la concesionaria y envía un mail de confirmación mediante Resend.
 *     tags: [Emails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo a suscribir.
 *     responses:
 *       201:
 *         description: Suscripción creada/reactivada exitosamente.
 *       400:
 *         description: Solicitud incorrecta (mail no válido o ya se encuentra suscrito).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', validacionEmail, emailCtrl.agregarEmail);

/**
 * @swagger
 * /api/email:
 *   get:
 *     summary: Obtener todas las suscripciones de correo
 *     description: Retorna un listado de todos los correos registrados y su estado actual (activo o inactivo).
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de emails recuperado con éxito.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Permisos insuficientes (vendedor o admin requeridos).
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), emailCtrl.getEmails);

/**
 * @swagger
 * /api/email/{id}/desactivar:
 *   put:
 *     summary: Desactivar una suscripción por ID
 *     description: Cambia el estado de una suscripción a inactivo, cancelando el envío de futuras comunicaciones.
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la suscripción a desactivar.
 *     responses:
 *       200:
 *         description: Suscripción desactivada con éxito.
 *       400:
 *         description: La suscripción ya se encontraba inactiva.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Permisos insuficientes.
 *       404:
 *         description: Suscripción no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id/desactivar', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Desactivar suscripción email'), emailCtrl.desactivarEmail);

module.exports = router;
