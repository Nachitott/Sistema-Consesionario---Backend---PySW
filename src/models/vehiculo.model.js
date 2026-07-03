const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Vehiculo = sequelize.define('Vehiculo', {
        marca: { type: DataTypes.STRING, allowNull: false },
        modelo: { type: DataTypes.STRING, allowNull: false },
        anio: { type: DataTypes.INTEGER, allowNull: false },
        version: { type: DataTypes.STRING, allowNull: false },
        kilometraje: { type: DataTypes.INTEGER, allowNull: false },
        combustible: { type: DataTypes.STRING, allowNull: false },
        transmision: { type: DataTypes.STRING, allowNull: false },
        color: { type: DataTypes.STRING, allowNull: false },
        precio: { type: DataTypes.INTEGER, allowNull: false },
        descuento: { type: DataTypes.INTEGER, allowNull: false },
        descripcion: { type: DataTypes.STRING, allowNull: false },
        estado: { type: DataTypes.STRING, allowNull: false },
        imagenes: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
        visible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
        tableName: 'vehiculos',
        timestamps: true
    });

    return Vehiculo
}