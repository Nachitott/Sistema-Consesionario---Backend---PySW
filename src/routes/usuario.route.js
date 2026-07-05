//defino controlador para el manejo de CRUD
const usuarioCtrl = require('./../../src/controllers/usuario.controller');
const authCtrl = require('./../../src/controllers/auth.controller');

//creamos el manejador de rutas
const express = require('express');
const router = express.Router();
//definimos las rutas para la gestion de socio
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("admin"), usuarioCtrl.getUsuarios);
router.get('/:id', authCtrl.verifyToken, usuarioCtrl.getUsuario);
router.post('/', usuarioCtrl.createUsuario);
router.put('/:id', authCtrl.verifyToken, authCtrl.verifyRole("cliente", "admin"), usuarioCtrl.editUsuario);
router.delete('/:id', authCtrl.verifyToken, authCtrl.verifyRole("cliente", "admin"), usuarioCtrl.deleteUsuario);
router.post('/login', usuarioCtrl.loginUsuario);
router.post('/login-google', usuarioCtrl.loginGoogle);
//exportamos el modulo de rutas
module.exports = router;