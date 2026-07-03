//defino controlador para el manejo de CRUD
const clienteCtrl = require('./../../src/controllers/cliente.controller');
//creamos el manejador de rutas
const express = require('express');
const router = express.Router();
//definimos las rutas para la gestion de socio
router.get('/', clienteCtrl.getClientes);
router.get('/:id', clienteCtrl.getCliente);
router.post('/', clienteCtrl.createCliente);
router.put('/:id', clienteCtrl.editCliente);
router.delete('/:id', clienteCtrl.deleteCliente);
router.post('/login', clienteCtrl.loginCliente);
router.post('/login-google', clienteCtrl.loginGoogle);
//exportamos el modulo de rutas
module.exports = router;