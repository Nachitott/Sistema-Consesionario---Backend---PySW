const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Usuario = sequelize.define('Usuario', {
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
    fechaIngreso: {type: DataTypes.STRING, allowNull: true, defaultValue: DataTypes.NOW},
    rol: {type: DataTypes.ENUM('cliente', 'vendedor', 'admin'), allowNull: false, defaultValue: 'cliente'},
    observaciones: {type: DataTypes.TEXT, allowNull: true}
    }, {
    tableName: 'usuarios', // Nombre de la tabla en minúsculas y plural
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
    });

    return Usuario;
}