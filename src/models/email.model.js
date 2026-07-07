const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Email = sequelize.define('Email', {
        email: { type: DataTypes.STRING, allowNull: false },
        fecha: { type: DataTypes.DATE, allowNull: true },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    }, {
        tableName: 'emails',
        timestamps: true
    });
    return Email;
};