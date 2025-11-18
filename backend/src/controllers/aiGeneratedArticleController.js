const AiGeneratedArticle = require('../models/AiGeneratedArticle');
const Publication = require('../models/Publication');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../services/recaptchaService');
const aiService = require('../services/aiService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');

console.log('AiGeneratedArticleController loaded');

// Helper function to delete uploaded file
const deleteUploadedFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, '../../uploads/ai-articles', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted uploaded file: ${filename}`);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/ai-articles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ai-article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, GIF, and TXT files are allowed.'), false);
    }
  }
});

class AiGeneratedArticleController {

  // Validation rules for creating questionnaire
  createValidation = [
    body('storyType').isIn(['profile', 'editorial', 'advertorial', 'listicle']).withMessage('Invalid story type'),
    body('publicationId').isInt({ min: 1 }).withMessage('Valid publication ID is required')
  ];

  // Validation rules for updating status (admin only)
  updateStatusValidation = [
    body('status').isIn(['draft', 'pending', 'approved']).withMessage('Invalid status')
  ];

  /**
   * Create/submit questionnaire with file upload handling
   */
  async createQuestionnaire(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user?.userId || null;
      const {
        storyType,
        publicationId,
        part1,
        part2,
        seo
      } = req.body;

      // Parse JSON strings and map to correct field names
      const part1Data = part1 ? JSON.parse(part1) : {};
      const part2Data = part2 ? JSON.parse(part2) : {};
      const seoData = seo ? JSON.parse(seo) : {};

      const questionnaireData = {
        // Part 1 mapping
        name: part1Data.name,
        preferred_title: part1Data.preferredTitle,
        background: part1Data.background,
        inspiration: part1Data.inspiration,
        challenges: part1Data.challenges,
        unique_perspective: part1Data.uniquePerspective,
        highlights: part1Data.highlights,
        anecdotes: part1Data.anecdotes,
        aspirations: part1Data.futureVision, // map futureVision to aspirations
        additional_info: part1Data.additionalInfo,

        // Part 2 mapping
        goal: part2Data.goal,
        audience: part2Data.targetAudience, // map targetAudience to audience
        message: part2Data.message,
        points: part2Data.points,
        seo_keywords: part2Data.seoKeywords,
        tone: part2Data.tone,
        social_links: part2Data.socialLinks,
        references: part2Data.references,
        title_ideas: part2Data.titles, // map titles to title_ideas
        exclude_info: part2Data.exclusions, // map exclusions to exclude_info

        // SEO mapping
        geo_location: seoData.geoLocation,
        person_name: seoData.personName,
        company_name: seoData.companyName
      };

      // Skip captcha for authenticated users

      // Get publication to validate
      const publication = await Publication.findById(publicationId);
      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      // Handle file upload
      let uploadedFilePath = null;
      if (req.file) {
        uploadedFilePath = req.file.filename;
      }

      // Create the AI generated article record
      const articleData = {
        story_type: storyType,
        publication_id: publicationId,
        user_id: userId,
        uploaded_file_path: uploadedFilePath,
        status: 'draft' // Start as draft
      };

      // Set questionnaire data
      const article = new AiGeneratedArticle(articleData);
      article.setQuestionnaireData(questionnaireData);

      const savedArticle = await article.save();

      res.status(201).json({
        message: 'AI article questionnaire submitted successfully',
        article: savedArticle.toJSON()
      });
    } catch (error) {
      console.error('Create questionnaire error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Generate article content using AI
   */
  async generateArticle(req, res) {
    try {
      const { id } = req.params;
      const { additional_prompt } = req.body;
      const userId = req.user?.userId;

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      // Check if user owns this article
      if (article.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get publication for guidelines
      const publication = await Publication.findById(article.publication_id);
      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      // Generate content using AI
      const questionnaireData = article.getQuestionnaireData();

      // Validate content against publication guidelines before generation
      const validationError = aiService.validateAgainstGuidelines({
        ...questionnaireData,
        story_type: article.story_type
      }, publication);

      if (validationError) {
        return res.status(400).json({
          error: 'Content validation failed',
          message: validationError
        });
      }

      const generatedContent = await aiService.generateArticle({
        ...questionnaireData,
        story_type: article.story_type,
        additional_prompt: additional_prompt || ''
      }, publication);

      // Update article with generated content (keep as draft until finalized)
      article.generated_content = generatedContent;
      await article.save();

      res.json({
        message: 'Article generated successfully',
        article: article.toJSON()
      });
    } catch (error) {
      console.error('Generate article error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Finalize article (submit for admin review)
   */
  async finalizeArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      // Check if user owns this article
      if (article.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if article has generated content
      if (!article.generated_content) {
        return res.status(400).json({ error: 'Article must be generated before finalizing' });
      }

      // Update status to pending for admin review
      article.status = 'pending';
      await article.save();

      res.json({
        message: 'Article submitted for review successfully',
        article: article.toJSON()
      });
    } catch (error) {
      console.error('Finalize article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Fetch user's AI articles
   */
  async getUserArticles(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10, status } = req.query;

      const filters = { user_id: userId };
      if (status) filters.status = status;

      const offset = (page - 1) * limit;

      // Get articles with publication data
      const sql = `
        SELECT aga.*, p.publication_name
        FROM ai_generated_articles aga
        LEFT JOIN publications p ON aga.publication_id = p.id
        WHERE aga.user_id = $1
        ${status ? 'AND aga.status = $2' : ''}
        ORDER BY aga.created_at DESC
        LIMIT $${status ? 3 : 2} OFFSET $${status ? 4 : 3}
      `;

      const values = status ?
        [userId, status, parseInt(limit), offset] :
        [userId, parseInt(limit), offset];

      const result = await query(sql, values);

      // Get total count
      const countSql = status ?
        'SELECT COUNT(*) FROM ai_generated_articles WHERE user_id = $1 AND status = $2' :
        'SELECT COUNT(*) FROM ai_generated_articles WHERE user_id = $1';

      const countValues = status ? [userId, status] : [userId];
      const countResult = await query(countSql, countValues);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);

      // Build articles with associations
      const articlesWithAssociations = result.rows.map(row => {
        const article = new AiGeneratedArticle(row);
        article.publication_name = row.publication_name;

        const json = article.toJSON();
        let publication = null;
        if (article.publication_name) {
          publication = { publication_name: article.publication_name };
        }

        return { ...json, publication };
      });

      res.json({
        articles: articlesWithAssociations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get user articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Fetch single article
   */
  async getArticleById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      // Check if user owns this article (unless admin)
      if (article.user_id !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Load associations
      const publication = await Publication.findById(article.publication_id);

      res.json({
        article: {
          ...article.toJSON(),
          publication: publication ? publication.toJSON() : null
        }
      });
    } catch (error) {
      console.error('Get article by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update status (for admin approval)
   */
  async updateStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      // Update status
      article.status = status;
      await article.save();

      res.json({
        message: `Article status updated to ${status} successfully`,
        article: article.toJSON()
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      // Check if user owns this article (unless admin)
      if (article.user_id !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete uploaded file if exists
      if (article.uploaded_file_path) {
        deleteUploadedFile(article.uploaded_file_path);
      }

      await article.destroy();

      res.json({ message: 'AI generated article deleted successfully' });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get user's own AI articles
   */
  async getMyArticles(req, res) {
    try {
      const userId = req.user?.userId;
      const {
        page = 1,
        limit = 12
      } = req.query;

      const offset = (page - 1) * limit;

      // Get articles with publication data
      const sql = `
        SELECT aga.*, p.publication_name
        FROM ai_generated_articles aga
        LEFT JOIN publications p ON aga.publication_id = p.id
        WHERE aga.user_id = $1
        ORDER BY aga.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const values = [userId, parseInt(limit), offset];
      const result = await query(sql, values);

      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM ai_generated_articles WHERE user_id = $1', [userId]);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);

      // Build articles with publication objects
      const articlesWithPublications = result.rows.map(row => {
        const article = new AiGeneratedArticle(row);

        const json = article.toJSON();

        // Build publication object
        let publication = null;
        if (row.publication_name) {
          publication = { publication_name: row.publication_name };
        }

        return { ...json, publication };
      });

      res.json({
        articles: articlesWithPublications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get my articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update article status (admin only)
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      article.status = status;
      await article.save();

      res.json({
        message: 'Article status updated successfully',
        article: article.toJSON()
      });
    } catch (error) {
      console.error('Update article status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete article (admin only)
   */
  async deleteArticle(req, res) {
    try {
      const { id } = req.params;

      const article = await AiGeneratedArticle.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: 'AI generated article not found' });
      }

      await article.destroy();

      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all articles (admin only)
   */
  async getAllArticles(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        user_id,
        publication_id,
        search
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (user_id) filters.user_id = parseInt(user_id);
      if (publication_id) filters.publication_id = parseInt(publication_id);

      const offset = (page - 1) * limit;

      // Get articles with user and publication data
      const sql = `
        SELECT aga.*, u.first_name, u.last_name, u.email, p.publication_name
        FROM ai_generated_articles aga
        LEFT JOIN users u ON aga.user_id = u.id
        LEFT JOIN publications p ON aga.publication_id = p.id
        ${Object.keys(filters).length > 0 ? 'WHERE ' + Object.keys(filters).map((key, index) => `aga.${key} = $${index + 1}`).join(' AND ') : ''}
        ORDER BY aga.created_at DESC
        LIMIT $${Object.keys(filters).length + 1} OFFSET $${Object.keys(filters).length + 2}
      `;

      const values = [...Object.values(filters), parseInt(limit), offset];
      const result = await query(sql, values);

      // Get total count
      const countSql = `SELECT COUNT(*) FROM ai_generated_articles${Object.keys(filters).length > 0 ? ' WHERE ' + Object.keys(filters).map((key, index) => `${key} = $${index + 1}`).join(' AND ') : ''}`;
      const countResult = await query(countSql, Object.values(filters));
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);

      // Build articles with associations
      const articlesWithAssociations = result.rows.map(row => {
        const article = new AiGeneratedArticle(row);

        const json = article.toJSON();

        // Build user object
        let user = null;
        if (row.first_name || row.last_name || row.email) {
          user = {
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email
          };
        }

        // Build publication object
        let publication = null;
        if (row.publication_name) {
          publication = { publication_name: row.publication_name };
        }

        return { ...json, user, publication };
      });

      res.json({
        articles: articlesWithAssociations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get all articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AiGeneratedArticleController();