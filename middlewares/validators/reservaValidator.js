const { body, validationResult } = require('express-validator');

const validacionCreacionReserva = [
    body('clienteId')
        .exists().withMessage('El ID de cliente es requerido')
        .isInt().withMessage('El ID de cliente debe ser un número entero'),

    body('vehiculoId')
        .exists().withMessage('El vehículo es requerido')
        .notEmpty().withMessage('El vehículo no puede estar vacío')
        .isInt().withMessage('El ID del vehículo debe ser un número entero'),

    body('montoSenia')
        .exists().withMessage('El monto de la seña es requerido')
        .isFloat({ min: 0 }).withMessage('El monto de la seña debe ser un número mayor o igual a 0'),

    body('fechaVencimiento')
        .exists().withMessage('La fecha de vencimiento es requerida')
        .isISO8601().withMessage('La fecha de vencimiento debe ser una fecha válida (ISO8601)'),

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

module.exports = { validacionCreacionReserva };