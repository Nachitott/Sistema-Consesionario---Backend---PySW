const reporteCtrl = require('../controllers/reporte.controller');
const authCtrl = require('../controllers/auth.controller');

const express = require('express');
const router = express.Router();


router.get('/reporte-general', authCtrl.verifyToken, authCtrl.verifyRole("admin"), reporteCtrl.getreportegeneral);
//exportamos el modulo de rutas
module.exports = router;