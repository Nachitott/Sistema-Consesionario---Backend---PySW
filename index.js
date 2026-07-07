require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const { sanitizarXSS } = require('./middlewares/xssMiddleware');
var app = express();

app.use(express.json());

const allowedOrigins = [
    'http://localhost:4200',
    'https://proyfrontendgrupo07-sn13.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origen (como Postman, curl o logs del servidor)
        if (!origin) return callback(null, true);
        
        // Permitir si coincide con los orígenes permitidos o con previsualizaciones de Vercel
        const isAllowed = allowedOrigins.includes(origin) || 
                          /^https:\/\/proyfrontendgrupo07-.*\.vercel\.app$/.test(origin);
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por la política de CORS de la API'));
        }
    },
    credentials: true
}));
app.use(sanitizarXSS);

app.use('/api/vehiculo', require('./src/routes/vehiculo.route'));
app.use('/api/usuario', require('./src/routes/usuario.route'));
app.use('/api/reserva', require('./src/routes/reserva.route'));
app.use('/api/reporte', require('./src/routes/reporte.route'));
app.use('/api/venta', require('./src/routes/venta.route'));
app.use('/api/turno', require('./src/routes/turno.route'));
app.use('/api/email', require('./src/routes/email.route'));
app.use("/api/youtube", require('./src/routes/youtube.route.js'));

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
            {
                url: 'https://sistema-consesionario-backend-pysw.onrender.com',
                description: 'Servidor de Producción (Render)',
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