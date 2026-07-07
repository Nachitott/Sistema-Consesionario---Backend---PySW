const xss = require('xss');

const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        return xss(value);
    } else if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    } else if (value !== null && typeof value === 'object') {
        const sanitizedObj = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                sanitizedObj[key] = sanitizeValue(value[key]);
            }
        }
        return sanitizedObj;
    }
    return value;
};

const sanitizarXSS = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    next();
};

module.exports = { sanitizarXSS };