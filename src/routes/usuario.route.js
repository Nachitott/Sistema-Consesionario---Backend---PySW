//defino controlador para el manejo de CRUD
const usuarioCtrl = require('./../../src/controllers/usuario.controller');
const authCtrl = require('../../middlewares/authMiddleware');
const { registrarAccion } = require('../../middlewares/auditMiddlewares');

//creamos el manejador de rutas
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: APIs para la autenticación de usuarios (JWT / Google), registro y operaciones de administración.
 */

/**
 * @swagger
 * /api/usuario:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna un listado de todos los usuarios registrados, excluyendo las contraseñas.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de usuarios obtenido correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (solo administradores).
 *       500:
 *         description: Error del servidor.
 */
router.get('/', authCtrl.verifyToken, authCtrl.verifyRole("admin"), usuarioCtrl.getUsuarios);

/**
 * @swagger
 * /api/usuario/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Retorna los datos de un usuario específico según su ID, excluyendo su contraseña.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del usuario.
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/:id', authCtrl.verifyToken, usuarioCtrl.getUsuario);

/**
 * @swagger
 * /api/usuario:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea un nuevo usuario en la base de datos con contraseña cifrada (hash). El rol se asigna automáticamente como 'cliente' por motivos de seguridad.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - nombre
 *               - apellido
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *               nombre:
 *                 type: string
 *                 description: Nombre real.
 *               apellido:
 *                 type: string
 *                 description: Apellido.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único.
 *               dni:
 *                 type: string
 *                 description: Documento Nacional de Identidad (opcional).
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto (opcional).
 *               direccion:
 *                 type: string
 *                 description: Dirección postal (opcional).
 *               ciudad:
 *                 type: string
 *                 description: Ciudad (opcional).
 *               provincia:
 *                 type: string
 *                 description: Provincia (opcional).
 *               fechaNacimiento:
 *                 type: string
 *                 description: Fecha de nacimiento (opcional).
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: El email o nombre de usuario ya está registrado, o faltan campos obligatorios.
 */
router.post('/', registrarAccion('Crear usuario'), usuarioCtrl.createUsuario);

/**
 * @swagger
 * /api/usuario/{id}:
 *   put:
 *     summary: Modificar datos de un usuario
 *     description: Permite modificar el perfil de un usuario. Un cliente solo puede modificarse a sí mismo, mientras que un administrador puede modificar a cualquiera y es el único autorizado a cambiar roles.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a modificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               provincia:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [cliente, vendedor, admin]
 *                 description: Solo modificable por rol 'admin'.
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 *       400:
 *         description: Error en el cuerpo o procesamiento.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (intentar editar a otro usuario sin ser admin).
 */
router.put('/:id', authCtrl.verifyToken, authCtrl.verifyRole("cliente", "admin"), registrarAccion('Modificar usuario'), usuarioCtrl.editUsuario);

/**
 * @swagger
 * /api/usuario/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Elimina la cuenta de un usuario de forma permanente. Un cliente solo puede eliminarse a sí mismo, mientras que el admin puede eliminar a cualquiera.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (permisos insuficientes).
 *       404:
 *         description: Usuario no encontrado.
 */
router.delete('/:id', authCtrl.verifyToken, authCtrl.verifyRole("cliente", "admin"), registrarAccion('Eliminar usuario'), usuarioCtrl.deleteUsuario);

/**
 * @swagger
 * /api/usuario/login:
 *   post:
 *     summary: Iniciar sesión de usuario (Standard)
 *     description: Valida el correo y la contraseña para iniciar sesión y retorna un token JWT válido por 4 horas.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Retorna el JWT y datos básicos del usuario.
 *       400:
 *         description: Faltan credenciales, o el usuario está registrado con Google.
 *       401:
 *         description: Credenciales incorrectas (email o contraseña incorrectos).
 *       500:
 *         description: Error en el servidor durante el login.
 */
router.post('/login', registrarAccion('Inicio de sesión'), usuarioCtrl.loginUsuario);

/**
 * @swagger
 * /api/usuario/login-google:
 *   post:
 *     summary: Iniciar sesión con Google (Federado)
 *     description: Valida el token de identidad provisto por la API de Google, autentica al usuario y crea un registro de tipo 'cliente' de forma automática si es la primera vez que ingresa. Retorna un JWT válido por 4 horas.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Credencial/token ID enviado por el flujo de Google Identity.
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Retorna el JWT y datos básicos.
 *       401:
 *         description: Token de Google inválido o expirado.
 */
router.post('/login-google', registrarAccion('Inicio de sesión con Google'), usuarioCtrl.loginGoogle);

//exportamos el modulo de rutas
module.exports = router;