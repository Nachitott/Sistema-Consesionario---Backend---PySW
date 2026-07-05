const vehiculoCtrl = require('../controllers/vehiculo.controller');
const authCtrl = require('../controllers/auth.controller');

const express = require('express');
const router = express.Router();


router.get('/', authCtrl.verifyToken, vehiculoCtrl.getVehiculos);
router.post('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor"), vehiculoCtrl.createVehiculo);
router.get('/cotizaciones', authCtrl.verifyToken, vehiculoCtrl.getCotizaciones);
router.get('/:id', authCtrl.verifyToken, vehiculoCtrl.getVehiculoById);
router.put('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor"), vehiculoCtrl.updateVehiculo);
router.delete('/:id', authCtrl.verifyToken, authCtrl.verifyRole("vendedor"), vehiculoCtrl.deleteVehiculo);

module.exports = router;