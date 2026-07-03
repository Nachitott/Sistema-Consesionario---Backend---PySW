const { DataTypes } = require('sequelize');
const sequelize = require('./../../config/database'); // Asegúrate de que la ruta apunte a tu archivo
const Cliente = require('./cliente.model'); // Asegúrate de que la ruta apunte a tu archivo
const Vendedor = require('./vendedor.model'); // Asegúrate de que la ruta apunte a tu archivo
const Vehiculo = require('./vehiculo.model'); // Asegúrate de que la ruta apunte a tu archivo

const Venta = sequelize.define('Venta', {
// Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
    metodoPago: {type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta', 'financiado'), allowNull: false},
    cuotas: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1},
    descuento: {type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
    observaciones: {type: DataTypes.TEXT, allowNull: true},
    fechaVenta: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    precioOriginal: {type: DataTypes.FLOAT, allowNull: false},
    precioFinal: {type: DataTypes.FLOAT, allowNull: false}
}, {
    tableName: 'ventas', // Nombre de la tabla en minúsculas y plural
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
});

Venta.belongsTo(Cliente);
Cliente.hasMany(Venta);

Venta.belongsTo(Vendedor);
Vendedor.hasMany(Venta);

Venta.belongsTo(Vehiculo);
Vehiculo.hasMany(Venta);

module.exports = Venta;