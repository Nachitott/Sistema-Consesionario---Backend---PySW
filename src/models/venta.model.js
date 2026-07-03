const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Venta = sequelize.define('Venta', {
        // Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
        metodoPago: {type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta', 'financiado'), allowNull: false},
        cuotas: {type: DataTypes.INTEGER, allowNull: true},
        descuento: {type: DataTypes.FLOAT, allowNull: true},
        observaciones: {type: DataTypes.TEXT, allowNull: true},
        fechaVenta: {type: DataTypes.DATE, allowNull: true},
        precioFinal: {type: DataTypes.FLOAT, allowNull: true}
    }, {
        tableName: 'ventas', // Nombre de la tabla en minúsculas y plural
        timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
    });

    return Venta;
};