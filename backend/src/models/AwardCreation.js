const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseSequelize');

const AwardCreation = sequelize.define('AwardCreation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  award_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  award_organiser_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tentative_month: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  regional_focused: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  award_country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  award_city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_focused_individual_focused: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'award_creations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = AwardCreation;