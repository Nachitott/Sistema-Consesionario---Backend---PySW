const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Venta = sequelize.define('Venta', {
        // Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
        metodoPago: {type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta', 'financiado'), allowNull: false},
        cuotas: {type: DataTypes.INTEGER, allowNull: false},
        precioOriginal: {type: DataTypes.DECIMAL(10,2), allowNull: false},
        descuento: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
        observaciones: {type: DataTypes.TEXT, allowNull: true},
        fechaVenta: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        precioFinal: {type: DataTypes.DECIMAL(10, 2), allowNull: false}
    }, {
        tableName: 'ventas', // Nombre de la tabla en minúsculas y plural
        timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
    });

    return Venta;
};