const express = require('express');
const router = express.Router();
const vehiculoCtrl = require('../controllers/vehiculo.controller');
const authCtrl = require('../../middlewares/authMiddleware');
const { registrarAccion } = require('../../middlewares/auditMiddlewares');
const { validacionCreacionVehiculo } = require('../../middlewares/validators/vehiculoValidator');

/**
 * @swagger
 * tags:
 *   name: Vehículos
 *   description: APIs para la administración de vehículos en el catálogo del concesionario y consulta de cotizaciones de divisas.
 */

/**
 * @swagger
 * /api/vehiculo:
 *   get:
 *     summary: Obtener todos los vehículos
 *     description: Retorna la lista de todos los vehículos registrados en el catálogo. Requiere token de autenticación.
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catálogo de vehículos obtenido correctamente.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error al obtener los vehículos.
 */
router.get('/', authCtrl.verifyToken, vehiculoCtrl.getVehiculos);

/**
 * @swagger
 * /api/vehiculo:
 *   post:
 *     summary: Registrar un nuevo vehículo
 *     description: Registra un vehículo en el catálogo. Valida todos los parámetros técnicos antes de insertar. Disponible solo para vendedores.
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marca
 *               - modelo
 *               - anio
 *               - version
 *               - kilometraje
 *               - combustible
 *               - transmision
 *               - color
 *               - precio
 *               - descripcion
 *               - estado
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               anio:
 *                 type: integer
 *               version:
 *                 type: string
 *               kilometraje:
 *                 type: integer
 *               combustible:
 *                 type: string
 *               transmision:
 *                 type: string
 *               color:
 *                 type: string
 *               precio:
 *                 type: number
 *               descuento:
 *                 type: number
 *                 description: Porcentaje de descuento (opcional).
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 description: Estado del vehículo (ej. disponible, vendido).
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Arreglo de URLs de imágenes del auto.
 *               visible:
 *                 type: boolean
 *                 description: Indica si se muestra en el catálogo (por defecto true).
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente.
 *       400:
 *         description: Error de validación en los parámetros enviados.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo admins).
 *       500:
 *         description: Error en el servidor al registrar el vehículo.
 */
router.post('/', authCtrl.verifyToken, authCtrl.verifyRole("admin"), validacionCreacionVehiculo, registrarAccion('Crear vehículo'), vehiculoCtrl.createVehiculo);

/**
 * @swagger
 * /api/vehiculo/cotizaciones:
 *   get:
 *     summary: Obtener cotizaciones de divisas
 *     description: Consulta las cotizaciones actuales de divisas internacionales (franco, euro, real, etc.) y las cotizaciones locales en Argentina (Dólar Oficial y Dólar Blue). Tiene una caché de 1 hora para optimizar peticiones externas.
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cotizaciones obtenidas exitosamente (desde caché o API externa).
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error al consultar cotizaciones.
 */
router.get('/cotizaciones', authCtrl.verifyToken, vehiculoCtrl.getCotizaciones);

/**
 * @swagger
 * /api/vehiculo/{id}:
 *   get:
 *     summary: Obtener un vehículo por ID
 *     description: Retorna los detalles completos de un vehículo específico por su ID.
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del vehículo.
 *     responses:
 *       200:
 *         description: Detalles del vehículo obtenidos correctamente.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Vehículo no encontrado en el sistema.
 *       500:
 *         description: Error al obtener el vehículo.
 */
router.get('/:id', authCtrl.verifyToken, vehiculoCtrl.getVehiculoById);

/**
 * @swagger
 * /api/vehiculo/{id}:
 *   put:
 *     summary: Actualizar datos de un vehículo
 *     description: Modifica los campos de un vehículo específico. Solo accesible por vendedores.
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo a modificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               precio:
 *                 type: number
 *               descuento:
 *                 type: number
 *               estado:
 *                 type: string
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *               visible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo vendedores y vendedores).
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error al actualizar el vehículo.
 */
router.put('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Modificar vehículo'), vehiculoCtrl.updateVehiculo);

/**
 * @swagger
 * /api/vehiculo/{id}:
 *   delete:
 *     summary: Eliminar un vehículo
 *     description: Remueve un vehículo del catálogo por su ID. Solo accesible por vendedores.
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo a eliminar.
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error interno al intentar eliminar el vehículo.
 */
router.delete('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Eliminar vehículo'), vehiculoCtrl.deleteVehiculo);

module.exports = router;