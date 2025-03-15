const { Sequelize } = require('sequelize');
require('dotenv').config();
// Configuration Sequelize
const db = new Sequelize('travelApp', 'SIG_BAM', '123456', {
  host: 'localhost', // Adresse de votre serveur PostgreSQL
  port: '5432',      // Port par défaut pour PostgreSQL
  dialect:'postgres', // Utilisation de PostgreSQL
  logging: false,    // Désactiver les logs SQL
});

db.authenticate()
  .then(() => console.log('Database connected.'))
  .catch(err => console.error('Database connection error:', err));

module.exports = db;
