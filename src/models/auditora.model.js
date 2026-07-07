const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Auditoria = sequelize.define('Auditoria', {
        usuarioId: { type: DataTypes.INTEGER, allowNull: true }, // Allow null for anonymous actions
        accion: { type: DataTypes.STRING, allowNull: false },
        metodo: { type: DataTypes.STRING, allowNull: false },
        ruta: { type: DataTypes.STRING, allowNull: false },
        ip: { type: DataTypes.STRING }
    }, {
        tableName: 'auditorias',
        timestamps: true
    });
    return Auditoria;
};