const { body, validationResult } = require('express-validator');

const validacionEmail = [
    body('email')
        .exists().withMessage('El email es requerido')
        .notEmpty().withMessage('El email no puede estar vacío')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),

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

module.exports = { validacionEmail };
