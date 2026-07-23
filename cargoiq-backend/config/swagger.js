const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CargoIQ Backend API',
      version: '1.0.0',
      description: 'Express + MongoDB API for managing cargo items.'
    },
    servers: [
      {
        url: 'http://localhost:5000'
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJSDoc(options);

