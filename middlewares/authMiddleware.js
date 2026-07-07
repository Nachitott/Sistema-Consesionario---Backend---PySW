const jwt = require('jsonwebtoken');

const authCtrl = {};

const SECRET_KEY = process.env.JWT_SECRET;
authCtrl.verifyToken = (req, res, next) => {
    // 1. Validar si el header existe antes de hacer split
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
        return res.status(401).json({
            message: 'Unauthorized request: No token provided.'
        });
    }
    // 2. Extraer el token separando por el espacio
    const token = authHeader.split(' ')[1];
    // 3. Validar que el token no sea undefined o esté vacío
    if (!token || token === 'null') {
        return res.status(401).json({
            message: 'Unauthorized request: Invalid token format.'
        });
    }
    try {
        // 4. Capturar errores de verificación (token expirado, firma inválida, etc.)
        const payload = jwt.verify(token, SECRET_KEY);
        req.user = payload;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: 'Unauthorized request: Invalid or expired token.'
        });
    }
}

authCtrl.verifyRole = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: 'Usuario no autenticado.'
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                message: 'No tiene permisos para realizar esta acción.'
            });
        }

        next();
    };
}

module.exports = authCtrl;