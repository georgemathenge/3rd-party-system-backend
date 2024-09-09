// app.js
const express = require('express');
const requestRoutes = require('./routes/requestRoutes');
const notifcationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use routes
app.use('/api/v1/requests', requestRoutes);
// app.use('/api/v1/fetch/requests/:id', requestRoutes);

app.use('/api/v1/fetch/notifcations', notifcationRoutes);

module.exports = app;
