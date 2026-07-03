const { DataTypes } = require('sequelize');
const sequelize = require('./../../config/database'); // Asegúrate de que la ruta apunte a tu archivo
const Vendedor = sequelize.define('Vendedor', {
// Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
    username: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    nombre: {type: DataTypes.STRING, allowNull: false},
    apellido: {type: DataTypes.STRING, allowNull: false},
    dni: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, allowNull: false},
    telefono: {type: DataTypes.STRING, allowNull: true},
    fechaIngreso: {type: DataTypes.STRING, allowNull: true},
    observaciones: {type: DataTypes.TEXT, allowNull: true}
}, {
    tableName: 'vendedores', // Nombre de la tabla en minúsculas y plural
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
});

module.exports = Vendedor;