const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseSequelize');

const AiGeneratedArticle = sequelize.define('AiGeneratedArticle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  story_type: {
    type: DataTypes.ENUM('profile', 'editorial', 'advertorial', 'listicle'),
    allowNull: false,
    validate: {
      isIn: [['profile', 'editorial', 'advertorial', 'listicle']],
    },
  },
  // Part 1 fields
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  preferred_title: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  background: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  inspiration: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  challenges: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unique_perspective: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  highlights: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  anecdotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  aspirations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  additional_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Part 2 fields
  goal: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  audience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  points: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  seo_keywords: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tone: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  social_links: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  reference_links: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  title_ideas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  exclude_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // SEO fields
  geo_location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  person_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // Other fields
  publication_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'publications',
      key: 'id',
    },
  },
  generated_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'pending', 'approved']],
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  uploaded_file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'ai_generated_articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['story_type'] },
    { fields: ['status'] },
    { fields: ['publication_id'] },
    { fields: ['user_id'] },
    { fields: ['person_name'] },
    { fields: ['company_name'] },
    { fields: ['geo_location'] },
    { fields: ['created_at'] },
  ],
});

// Class methods
AiGeneratedArticle.findByUserId = async function(userId, options = {}) {
  return await this.findAll({
    where: { user_id: userId },
    ...options,
  });
};

AiGeneratedArticle.findByPublicationId = async function(publicationId, options = {}) {
  return await this.findAll({
    where: { publication_id: publicationId },
    ...options,
  });
};

AiGeneratedArticle.findByStatus = async function(status, options = {}) {
  return await this.findAll({
    where: { status },
    ...options,
  });
};

AiGeneratedArticle.findByStoryType = async function(storyType, options = {}) {
  return await this.findAll({
    where: { story_type: storyType },
    ...options,
  });
};

// Instance methods
AiGeneratedArticle.prototype.isDraft = function() {
  return this.status === 'draft';
};

AiGeneratedArticle.prototype.isPending = function() {
  return this.status === 'pending';
};

AiGeneratedArticle.prototype.isApproved = function() {
  return this.status === 'approved';
};

AiGeneratedArticle.prototype.approve = async function() {
  this.status = 'approved';
  return await this.save();
};

AiGeneratedArticle.prototype.reject = async function() {
  this.status = 'draft';
  return await this.save();
};

AiGeneratedArticle.prototype.submitForApproval = async function() {
  this.status = 'pending';
  return await this.save();
};

// Get questionnaire data (Part 1 and Part 2 combined)
AiGeneratedArticle.prototype.getQuestionnaireData = function() {
  return {
    // Part 1
    name: this.name,
    preferred_title: this.preferred_title,
    background: this.background,
    inspiration: this.inspiration,
    challenges: this.challenges,
    unique_perspective: this.unique_perspective,
    highlights: this.highlights,
    anecdotes: this.anecdotes,
    aspirations: this.aspirations,
    additional_info: this.additional_info,
    // Part 2
    goal: this.goal,
    audience: this.audience,
    message: this.message,
    points: this.points,
    seo_keywords: this.seo_keywords,
    tone: this.tone,
    social_links: this.social_links,
    reference_links: this.reference_links,
    title_ideas: this.title_ideas,
    exclude_info: this.exclude_info,
  };
};

// Set questionnaire data
AiGeneratedArticle.prototype.setQuestionnaireData = function(data) {
  // Part 1
  if (data.name !== undefined) this.name = data.name;
  if (data.preferred_title !== undefined) this.preferred_title = data.preferred_title;
  if (data.background !== undefined) this.background = data.background;
  if (data.inspiration !== undefined) this.inspiration = data.inspiration;
  if (data.challenges !== undefined) this.challenges = data.challenges;
  if (data.unique_perspective !== undefined) this.unique_perspective = data.unique_perspective;
  if (data.highlights !== undefined) this.highlights = data.highlights;
  if (data.anecdotes !== undefined) this.anecdotes = data.anecdotes;
  if (data.aspirations !== undefined) this.aspirations = data.aspirations;
  if (data.additional_info !== undefined) this.additional_info = data.additional_info;

  // Part 2
  if (data.goal !== undefined) this.goal = data.goal;
  if (data.audience !== undefined) this.audience = data.audience;
  if (data.message !== undefined) this.message = data.message;
  if (data.points !== undefined) this.points = data.points;
  if (data.seo_keywords !== undefined) this.seo_keywords = data.seo_keywords;
  if (data.tone !== undefined) this.tone = data.tone;
  if (data.social_links !== undefined) this.social_links = data.social_links;
  if (data.references !== undefined) this.reference_links = data.references;
  if (data.title_ideas !== undefined) this.title_ideas = data.title_ideas;
  if (data.exclude_info !== undefined) this.exclude_info = data.exclude_info;
};

AiGeneratedArticle.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = AiGeneratedArticle;