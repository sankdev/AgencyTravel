const { DataTypes, Sequelize } = require("sequelize");
const db = require("../config/bd");

const PaymentMode = db.define("PaymentMode", {
  id: {
    type: DataTypes.INTEGER, 
    autoIncrement: true, // Génère automatiquement un ID unique
    primaryKey: true,    // Définit cette colonne comme clé primaire
  },
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
}, {
  tableName: "payment_modes",
  timestamps: true,
});

module.exports = PaymentMode;
