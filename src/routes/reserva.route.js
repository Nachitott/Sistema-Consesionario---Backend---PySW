const reservaCtrl = require('../controllers/reserva.controller');
const express = require('express');
const router = express.Router();

// Rutas para la gestión de Reservas
router.get('/', reservaCtrl.getReservas);
router.get('/:id', reservaCtrl.getReserva);
router.post('/', reservaCtrl.createReserva);
router.put('/:id/procesar', reservaCtrl.procesarReserva);

module.exports = router;
