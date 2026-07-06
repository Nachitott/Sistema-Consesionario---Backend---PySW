const reservaCtrl = require('../controllers/reserva.controller');
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

// Rutas para la gestión de Reservas
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), reservaCtrl.getReservas);
router.get('/:id', authCtrl.verifyToken, reservaCtrl.getReserva);
router.post('/', authCtrl.verifyToken, reservaCtrl.createReserva);
router.put('/:id/procesar', authCtrl.verifyToken, authCtrl.verifyRole("vendedor", "admin"), reservaCtrl.procesarReserva);

module.exports = router;