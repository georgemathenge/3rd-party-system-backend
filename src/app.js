// app.js
const express = require('express');
const requestRoutes = require('./routes/requestRoutes');
const notifcationRoutes = require('./routes/notificationRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

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


// Use routes
app.use('/api/v1/requests', requestRoutes);
// app.use('/api/v1/fetch/requests/:id', requestRoutes);

app.use('/api/v1/fetch/notifcations', notifcationRoutes);

module.exports = app;
