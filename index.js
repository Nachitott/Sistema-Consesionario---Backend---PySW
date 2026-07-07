require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const { sanitizarXSS } = require('./middlewares/xssMiddleware');
var app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(sanitizarXSS);

app.use('/api/vehiculo', require('./src/routes/vehiculo.route'));
app.use('/api/usuario', require('./src/routes/usuario.route'));
app.use('/api/reserva', require('./src/routes/reserva.route'));
app.use('/api/reporte', require('./src/routes/reporte.route'));
app.use('/api/venta', require('./src/routes/venta.route'));
app.use('/api/turno', require('./src/routes/turno.route'));

// Configuración de Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Concesionario',
            version: '1.0.0',
            description: 'Documentación interactiva de la API de gestión del Concesionario para la materia Programación y Servicios Web.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local de Desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Ruta a los archivos con anotaciones JSDoc de Swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set('port', process.env.PORT || 3000);

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