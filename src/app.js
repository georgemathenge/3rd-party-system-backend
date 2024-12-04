// app.js
const express = require('express');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const notifcationRoutes = require('./routes/notificationRoutes');
const loginRoutes = require('./routes/loginRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors')

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins (consider specifying your frontend origin for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Swagger definition and options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'], // Path to your API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//Login
app.use('/api/v1', loginRoutes);

//Admin Routes
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);

// Use Request routes
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/fetch/notifcations', notifcationRoutes);

module.exports = app;
