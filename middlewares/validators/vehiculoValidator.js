const { body, validationResult } = require('express-validator');

const validacionCreacionVehiculo = [
    body('marca')
        .exists().withMessage('La marca es requerida')
        .notEmpty().withMessage('La marca no puede estar vacía'),
    body('modelo')
        .exists().withMessage('El modelo es requerido')
        .notEmpty().withMessage('El modelo no puede estar vacío'),
    body('anio')
        .exists().withMessage('El año es requerido')
        .notEmpty().withMessage('El año no puede estar vacío')
        .isInt({ min: 1900, max: new Date().getFullYear() + 2 }).withMessage('El año debe ser un número de 4 dígitos válido'),
    body('precio')
        .exists().withMessage('El precio es requerido')
        .notEmpty().withMessage('El precio no puede estar vacío')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
    body('color')
        .exists().withMessage('El color es requerido')
        .notEmpty().withMessage('El color no puede estar vacío'),
    body('estado')
        .exists().withMessage('El estado es requerido')
        .notEmpty().withMessage('El estado no puede estar vacío'),
    body('version')
        .exists().withMessage('La versión es requerida')
        .notEmpty().withMessage('La versión no puede estar vacía'),
    body('kilometraje')
        .exists().withMessage('El kilometraje es requerido')
        .notEmpty().withMessage('El kilometraje no puede estar vacío')
        .isInt({ min: 0 }).withMessage('El kilometraje debe ser un número mayor o igual a 0'),
    body('combustible')
        .exists().withMessage('El combustible es requerido')
        .notEmpty().withMessage('El combustible no puede estar vacío'),
    body('transmision')
        .exists().withMessage('La transmisión es requerida')
        .notEmpty().withMessage('La transmisión no puede estar vacía'),
    body('descuento')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('El descuento debe ser un porcentaje entre 0 y 100'),
    body('descripcion')
        .exists().withMessage('La descripción es requerida')
        .notEmpty().withMessage('La descripción no puede estar vacía'),
    body('imagenes')
        .optional()
        .isArray().withMessage('Imágenes debe ser un arreglo de URLs'),
    body('imagenes.*')
        .optional()
        .isString().withMessage('Cada imagen debe ser un texto o URL válido'),

    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errores: errores.array().map(err => ({ campo: err.path, mensaje: err.msg }))
            });
        }

        next();
    }
];

module.exports = { validacionCreacionVehiculo };