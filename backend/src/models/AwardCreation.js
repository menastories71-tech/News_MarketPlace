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

// Custom findAll method with filters
AwardCreation.findAllFiltered = async (filters = {}, sortBy = 'createdAt', sortOrder = 'desc', limit = null, offset = null) => {
  const whereClause = {};

  // Add filters
  if (filters.award_name) {
    whereClause.award_name = { [require('sequelize').Op.iLike]: `%${filters.award_name}%` };
  }
  if (filters.award_organiser_name) {
    whereClause.award_organiser_name = { [require('sequelize').Op.iLike]: `%${filters.award_organiser_name}%` };
  }
  if (filters.url) {
    whereClause.url = { [require('sequelize').Op.iLike]: `%${filters.url}%` };
  }
  if (filters.tentative_month) {
    whereClause.tentative_month = filters.tentative_month;
  }
  if (filters.industry) {
    whereClause.industry = { [require('sequelize').Op.iLike]: `%${filters.industry}%` };
  }
  if (filters.regional_focused !== undefined && filters.regional_focused !== '') {
    whereClause.regional_focused = filters.regional_focused === 'true';
  }
  if (filters.award_country) {
    whereClause.award_country = { [require('sequelize').Op.iLike]: `%${filters.award_country}%` };
  }
  if (filters.award_city) {
    whereClause.award_city = { [require('sequelize').Op.iLike]: `%${filters.award_city}%` };
  }
  if (filters.company_focused_individual_focused) {
    whereClause.company_focused_individual_focused = filters.company_focused_individual_focused;
  }

  const options = {
    where: whereClause,
    order: [[sortBy, sortOrder.toUpperCase()]]
  };

  if (limit) options.limit = limit;
  if (offset) options.offset = offset;

  return await AwardCreation.findAll(options);
};

module.exports = AwardCreation;