const vehiculoCtrl = require('../controllers/vehiculo.controller');

const express = require('express');
const router = express.Router();


router.get('/', vehiculoCtrl.getVehiculos);
router.post('/', vehiculoCtrl.createVehiculo);
router.get('/cotizaciones', vehiculoCtrl.getCotizaciones);
router.get('/:id', vehiculoCtrl.getVehiculoById);
router.put('/:id', vehiculoCtrl.updateVehiculo);
router.delete('/:id', vehiculoCtrl.deleteVehiculo);

module.exports = router;