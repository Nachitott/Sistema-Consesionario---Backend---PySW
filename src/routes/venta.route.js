const express = require('express');
const router = express.Router();
const ventaCtrl = require('../controllers/venta.controller');
const authCtrl = require('../../middlewares/authMiddleware');
const { registrarAccion } = require('../../middlewares/auditMiddlewares');

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: APIs para la gestión de transacciones comerciales, reportes de compras y generación de comprobantes.
 */

/**
 * @swagger
 * /api/venta:
 *   get:
 *     summary: Obtener todas las ventas
 *     description: Retorna un listado de todas las ventas concretadas en el concesionario. Incluye información detallada del cliente, vendedor y vehículo.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de ventas obtenido con éxito.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo para vendedores y administradores).
 *       500:
 *         description: Error en el servidor al obtener las ventas.
 */
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), ventaCtrl.getVentas);

/**
 * @swagger
 * /api/venta:
 *   post:
 *     summary: Registrar una nueva venta
 *     description: Registra la venta de un vehículo a un cliente. Verifica la existencia del cliente y el vendedor, y la disponibilidad del vehículo. Al concretarse, el vehículo se marca automáticamente como "vendido" y pasa a ser invisible en el catálogo. Todo el proceso corre dentro de una transacción.
 *     tags: [Ventas]
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
 *               - vendedorId
 *               - vehiculoId
 *               - metodoPago
 *               - cuotas
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente (con rol 'cliente').
 *               vendedorId:
 *                 type: integer
 *                 description: ID del vendedor (con rol 'vendedor').
 *               vehiculoId:
 *                 type: integer
 *                 description: ID del vehículo vendido (debe estar en estado 'disponible').
 *               metodoPago:
 *                 type: string
 *                 enum: [efectivo, transferencia, tarjeta, financiado]
 *               cuotas:
 *                 type: integer
 *                 description: Cantidad de cuotas acordadas.
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venta registrada con éxito y vehículo actualizado a 'vendido'.
 *       400:
 *         description: Error de solicitud (vendedor/cliente inválido, o vehículo no disponible/vendido).
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (un vendedor no admin solo puede vender a su propio nombre).
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error interno al procesar la venta (transacción revertida).
 */
router.post('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Registrar venta'), ventaCtrl.createVenta);

/**
 * @swagger
 * /api/venta/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     description: Retorna los detalles específicos de una transacción de venta por su ID. Un vendedor o cliente solo puede ver la venta si forma parte de ella, mientras que el administrador tiene acceso irrestricto.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta.
 *     responses:
 *       200:
 *         description: Transacción de venta encontrada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (intento de visualizar una venta ajena).
 *       404:
 *         description: Venta no encontrada.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), ventaCtrl.getVenta);

/**
 * @swagger
 * /api/venta/{id}:
 *   put:
 *     summary: Modificar observaciones de una venta
 *     description: Permite actualizar únicamente el campo de observaciones de una venta existente.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venta actualizada con éxito.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo administradores o el vendedor que realizó la transacción).
 *       404:
 *         description: Venta no encontrada.
 *       500:
 *         description: Error al actualizar.
 */
router.put('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), registrarAccion('Modificar venta'), ventaCtrl.editVenta);

/**
 * @swagger
 * /api/venta/{id}:
 *   delete:
 *     summary: Eliminar una venta
 *     description: Elimina un registro de venta. Operación muy restringida disponible únicamente para el administrador.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta a eliminar.
 *     responses:
 *       200:
 *         description: Venta eliminada de forma lógica o física.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo rol admin).
 *       404:
 *         description: Venta no encontrada.
 *       500:
 *         description: Error en el servidor.
 */
router.delete('/:id', authCtrl.verifyToken, authCtrl.verifyRole("admin"), registrarAccion('Eliminar venta'), ventaCtrl.deleteVenta);

/**
 * @swagger
 * /api/venta/cliente/{clienteId}:
 *   get:
 *     summary: Obtener compras por cliente
 *     description: Lista todas las ventas/compras asociadas a un cliente en específico. Un cliente solo puede consultar su propio historial, los administradores y vendedores pueden consultar cualquiera.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente.
 *     responses:
 *       200:
 *         description: Compras del cliente obtenidas correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (acceso a compras de otro cliente).
 *       500:
 *         description: Error en el servidor.
 */
router.get('/cliente/:clienteId', authCtrl.verifyToken, authCtrl.verifyRole("cliente", "admin"), ventaCtrl.getVentasPorCliente);

/**
 * @swagger
 * /api/venta/vendedor/{vendedorId}:
 *   get:
 *     summary: Obtener ventas por vendedor
 *     description: Lista todas las ventas realizadas por un vendedor específico. Un vendedor solo puede consultar su propia lista, los administradores pueden consultar cualquiera.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendedorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vendedor.
 *     responses:
 *       200:
 *         description: Ventas del vendedor obtenidas correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/vendedor/:vendedorId', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), ventaCtrl.getVentasPorVendedor);

/**
 * @swagger
 * /api/venta/{id}/comprobante:
 *   get:
 *     summary: Obtener el comprobante simplificado de venta
 *     description: Retorna un JSON estructurado listo para la generación e impresión de facturas o comprobantes de venta, con datos filtrados del cliente, vendedor, vehículo, precios originales y descuentos aplicados.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta.
 *     responses:
 *       200:
 *         description: Comprobante generado y entregado correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo accesible para el vendedor involucrado, el cliente comprador o admin).
 *       404:
 *         description: Venta no encontrada.
 *       500:
 *         description: Error del servidor al estructurar el comprobante.
 */
router.get('/:id/comprobante', authCtrl.verifyToken, ventaCtrl.getComprobanteVenta);

module.exports = router;