const ventaCtrl = require('../controllers/venta.controller');
const authCtrl = require('../controllers/auth.controller');

const express = require('express');
const router = express.Router();


router.get('/', authCtrl.verifyToken,authCtrl.verifyRole("vendedor","admin"), ventaCtrl.getVentas);
router.post('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor","admin"), ventaCtrl.createVenta);
router.get('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor","admin"), ventaCtrl.getVenta);
router.put('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor","admin"), ventaCtrl.editVenta);
router.delete('/:id', authCtrl.verifyToken, authCtrl.verifyRole("admin"), ventaCtrl.deleteVenta);
router.get('/cliente/:clienteId', authCtrl.verifyToken, authCtrl.verifyRole("cliente", "admin"), ventaCtrl.getVentasPorCliente);
router.get('/vendedor/:vendedorId', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), ventaCtrl.getVentasPorVendedor);
router.get('/:id/comprobante', authCtrl.verifyToken, ventaCtrl.getComprobanteVenta);

module.exports = router;