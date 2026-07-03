//defino controlador para el manejo de CRUD
const vendedorCtrl = require('./../../src/controllers/cliente.controller');
//creamos el manejador de rutas
const express = require('express');
const router = express.Router();
//definimos las rutas para la gestion de socio
router.get('/', vendedorCtrl.getVendedores);
router.get('/:id', vendedorCtrl.getVendedor);
router.post('/', vendedorCtrl.createVendedor);
router.put('/:id', vendedorCtrl.editVendedor);
router.delete('/:id', vendedorCtrl.deleteVendedor);
router.post('/login', vendedorCtrl.loginVendedor);
router.post('/login-google', vendedorCtrl.loginGoogle);
//exportamos el modulo de rutas
module.exports = router;