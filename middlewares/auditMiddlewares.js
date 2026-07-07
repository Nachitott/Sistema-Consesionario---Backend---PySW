const { Auditoria } = require('../config/database');

const registrarAccion = (descripcionAccion) => {
    return async (req, res, next) => {
        try {
            const usuarioId = req.user ? req.user.id : null;

            await Auditoria.create({
                usuarioId: usuarioId,
                accion: descripcionAccion,
                metodo: req.method,
                ruta: req.originalUrl,
                ip: req.ip || req.connection.remoteAddress
            });
        } catch (err) {
            console.error('Error al guardar el log de la auditoria: ', err);
        }
        next();
    };
};

module.exports = { registrarAccion };