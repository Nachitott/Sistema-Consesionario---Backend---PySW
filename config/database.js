const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('concesionariodb', 'postgres', 'admin123', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

// Cargar modelos inyectando la instancia de sequelize
const Vehiculo = require('../src/models/vehiculo.model')(sequelize);
const Usuario = require('../src/models/usuario.model')(sequelize);
const Venta = require('../src/models/venta.model')(sequelize);

// Definición de Relaciones / Asociaciones

// Un Usuario tiene muchas Ventas, una Venta pertenece a un Usuario
Venta.belongsTo(Usuario, {
    as: 'cliente',
    foreignKey: 'clienteId'
});

Usuario.hasMany(Venta, {
    as: 'compras',
    foreignKey: 'clienteId'
});

Venta.belongsTo(Usuario, {
    as: 'vendedor',
    foreignKey: 'vendedorId'
});

Usuario.hasMany(Venta, {
    as: 'ventasRealizadas',
    foreignKey: 'vendedorId'
});

// Un Vehículo pertenece a una Venta, una Venta tiene un Vehículo
Vehiculo.hasMany(Venta, { foreignKey: 'vehiculoId', as: 'ventas' });
Venta.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });

sequelize.authenticate()
    .then(() => console.log('DB is connected to PostgreSQL'))
    .catch(err => console.error('Error al conectar a PostgreSQL:', err));

module.exports = {
    sequelize,
    Vehiculo,
    Usuario,
    Venta,
};