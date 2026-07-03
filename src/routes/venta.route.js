const ventaCtrl = require('../controllers/venta.controller');

const express = require('express');
const router = express.Router();


router.get('/', ventaCtrl.getVentas);
router.post('/', ventaCtrl.createVenta);
router.get('/:id', ventaCtrl.getVenta);
router.put('/:id', ventaCtrl.editVenta);
router.delete('/:id', ventaCtrl.deleteVenta);

module.exports = router;