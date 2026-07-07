const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Turno = sequelize.define('Turno', {
        fechaHora: { type: DataTypes.DATE, allowNull: false },
        motivo: { type: DataTypes.STRING, allowNull: false },
        estado: { type: DataTypes.ENUM('pendiente', 'aprobado', 'cancelado', 'reprogramado'), allowNull: false, defaultValue: 'pendiente' },
        observaciones: { type: DataTypes.TEXT, allowNull: true }
    }, {
        tableName: 'turnos',
        timestamps: true
    });
    return Turno;
};
