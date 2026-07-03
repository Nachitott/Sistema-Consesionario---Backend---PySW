const { DataTypes } = require('sequelize');
const sequelize = require('./../../config/database'); // Asegúrate de que la ruta apunte a tu archivo
const Cliente = sequelize.define('Cliente', {
// Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
    username: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    nombre: {type: DataTypes.STRING, allowNull: false},
    apellido: {type: DataTypes.STRING, allowNull: false},
    dni: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, allowNull: false},
    telefono: {type: DataTypes.STRING, allowNull: true},
    direccion: {type: DataTypes.STRING, allowNull: true},
    ciudad: {type: DataTypes.STRING, allowNull: true},
    provincia: {type: DataTypes.STRING, allowNull: true},
    fechaNacimiento: {type: DataTypes.STRING, allowNull: true},
    observaciones: {type: DataTypes.TEXT, allowNull: true}
}, {
    tableName: 'clientes', // Nombre de la tabla en minúsculas y plural
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
});

module.exports = Cliente;