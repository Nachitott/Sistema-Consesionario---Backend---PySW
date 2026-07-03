const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reserva = sequelize.define('Reserva', {
        // Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
        fechaReserva: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        fechaVencimiento: { type: DataTypes.DATE, allowNull: false },
        montoSenia: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0 } },
        estado: { type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'finalizada'), allowNull: false, defaultValue: 'pendiente' },
        observaciones: { type: DataTypes.TEXT, allowNull: true }
    }, {
        tableName: 'reservas', // Nombre de la tabla en minúsculas y plural
        timestamps: true // Crea automáticamente los campos createdAt y updatedAt
    });

    return Reserva;
};
