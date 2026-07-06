require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
var app = express();


//middlewares
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));
//Cargamos el modulo de direccionamiento de rutas
app.use('/api/vehiculo', require('./src/routes/vehiculo.route'));
app.use('/api/usuario', require('./src/routes/usuario.route'));
app.use('/api/reserva', require('./src/routes/reserva.route'));
app.use('/api/reporte', require('./src/routes/reporte.route'));
//app.use('/api/sector', require('./src/routes/sector.route'));
app.use('/api/venta', require('./src/routes/venta.route'));
//setting
app.set('port', process.env.PORT || 3000);
// Sincronizar Base de Datos y arrancar el servidor
// .sync() crea las tablas automáticamente en Postgres si aún no existen
// force en false crea las tablas solo si no existe, no borra datos en cada inicio
sequelize.sync({ force: false })
    .then(() => {
        console.log('Tablas de PostgreSQL sincronizadas');
        app.listen(app.get('port'), () => {
            console.log(`Server started on port`, app.get('port'));
        });
    })
    .catch(err => {
        console.error('No se pudo iniciar el servidor debido a un error en la BD:', err);
    });