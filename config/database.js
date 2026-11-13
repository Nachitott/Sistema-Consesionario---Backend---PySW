const { Sequelize } = require('sequelize');
require('dotenv').config(); // Aseguramos que lea el archivo .env

let sequelize;

// Si existe la URL de Supabase, conecta a internet con SSL
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Conexión a la base en Docker. Si DB_READ_HOST está definido,
    // las escrituras van al primario (DB_HOST) y las lecturas a la réplica.
    const opciones = {
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: false,
    };
    if (process.env.DB_READ_HOST) {
        opciones.replication = {
            write: { host: process.env.DB_HOST || 'localhost' },
            read: [{ host: process.env.DB_READ_HOST }],
        };
    } else {
        opciones.host = process.env.DB_HOST || 'localhost';
    }
    sequelize = new Sequelize(
        process.env.DB_NAME || 'concesionariodb',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'admin123',
        opciones
    );
}

// Cargar modelos inyectando la instancia de sequelize
const Vehiculo = require('../src/models/vehiculo.model')(sequelize);
const Usuario = require('../src/models/usuario.model')(sequelize);
const Venta = require('../src/models/venta.model')(sequelize);
const Reserva = require('../src/models/reserva.model')(sequelize);
const Turno = require('../src/models/turno.model')(sequelize);
const Auditoria = require('../src/models/auditora.model')(sequelize);
const Email = require('../src/models/email.model')(sequelize);

// Definición de Relaciones / Asociaciones

// Un Cliente tiene muchas Reservas, una Reserva pertenece a un Cliente
Usuario.hasMany(Reserva, { foreignKey: 'clienteId', as: 'reservas' });
Reserva.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente' });

// Un Vehículo puede tener muchas Reservas (historial de reservas), una Reserva pertenece a un Vehículo
Vehiculo.hasMany(Reserva, { foreignKey: 'vehiculoId', as: 'reservas' });
Reserva.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });

// Relaciones para Turnos (Historial del Cliente)
Usuario.hasMany(Turno, { foreignKey: 'clienteId', as: 'turnos' });
Turno.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente' });

Vehiculo.hasMany(Turno, { foreignKey: 'vehiculoId', as: 'turnos' });
Turno.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });

// Un Usuario tiene muchas Ventas, una Venta pertenece a un Usuario
Venta.belongsTo(Usuario, { as: 'cliente', foreignKey: 'clienteId' });
Usuario.hasMany(Venta, { as: 'compras', foreignKey: 'clienteId' });

Venta.belongsTo(Usuario, { as: 'vendedor', foreignKey: 'vendedorId' });
Usuario.hasMany(Venta, { as: 'ventasRealizadas', foreignKey: 'vendedorId' });

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
    Reserva,
    Turno,
    Auditoria,
    Email
};
