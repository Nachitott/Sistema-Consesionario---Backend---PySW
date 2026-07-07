const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Turno = sequelize.define('Turno', {
        // Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
        fechaHora: { 
            type: DataTypes.DATE, 
            allowNull: false 
        },
        motivo: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        estado: { 
            type: DataTypes.ENUM('pendiente', 'aprobado', 'cancelado', 'reprogramado'), 
            allowNull: false, 
            defaultValue: 'pendiente' 
        },
        observaciones: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        }
    }, {
        tableName: 'turnos', // Nombre de la tabla en minúsculas y plural
        timestamps: true     // Crea automáticamente los campos createdAt y updatedAt
    });

    return Turno;
};
