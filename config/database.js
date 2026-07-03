const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('concesionariodb', 'postgres', 'admin123', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

// Cargar modelos inyectando la instancia de sequelize
const Vehiculo = require('../src/models/vehiculo.model')(sequelize);
const Cliente = require('../src/models/cliente.model')(sequelize);
const Venta = require('../src/models/venta.model')(sequelize);
const Reserva = require('../src/models/reserva.model')(sequelize);

// Definición de Relaciones / Asociaciones

// Un Cliente tiene muchas Reservas, una Reserva pertenece a un Cliente
Cliente.hasMany(Reserva, { foreignKey: 'clienteId', as: 'reservas' });
Reserva.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Un Vehículo puede tener muchas Reservas (historial de reservas), una Reserva pertenece a un Vehículo
Vehiculo.hasMany(Reserva, { foreignKey: 'vehiculoId', as: 'reservas' });
Reserva.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });

// Un Cliente tiene muchas Ventas, una Venta pertenece a un Cliente
Cliente.hasMany(Venta, { foreignKey: 'clienteId', as: 'ventas' });
Venta.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Un Vehículo pertenece a una Venta, una Venta tiene un Vehículo
Vehiculo.hasMany(Venta, { foreignKey: 'vehiculoId', as: 'ventas' });
Venta.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });

sequelize.authenticate()
    .then(() => console.log('DB is connected to PostgreSQL'))
    .catch(err => console.error('Error al conectar a PostgreSQL:', err));

module.exports = {
    sequelize,
    Vehiculo,
    Cliente,
    Venta,
    Reserva
};