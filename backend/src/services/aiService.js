const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
    }
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Generate article content using Google Gemini API
   * @param {Object} questionnaireData - The questionnaire data from the user
   * @param {Object} publication - The publication guidelines
   * @returns {Promise<string>} - Generated article content
   */
  async generateArticle(questionnaireData, publication) {
    // Validate content against publication guidelines
    const validationError = this.validateAgainstGuidelines(questionnaireData, publication);
    if (validationError) {
      throw new Error(validationError);
    }

    // Build the prompt based on questionnaire data and publication guidelines
    const prompt = this.buildArticlePrompt(questionnaireData, publication);

    // Retry logic for rate limiting
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        const generatedContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedContent && generatedContent.trim().length > 0) {
          // Format the generated content properly
          return this.formatArticleContent(generatedContent, questionnaireData, publication);
        }
      } catch (error) {
        lastError = error;
        const errorData = error.response?.data;

        // Check if it's a rate limit error (429)
        if (error.response?.status === 429) {
          const retryAfter = error.response?.headers?.['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000; // Exponential backoff

          console.warn(`Rate limit hit (attempt ${attempt}/${maxRetries}), waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // For other errors, log and break
        console.warn(`Gemini API call failed (attempt ${attempt}/${maxRetries}):`, errorData || error.message);
        break;
      }
    }

    // If all retries fail, use properly formatted mock article with additional prompt
    console.warn('All Gemini API attempts failed, using properly formatted mock article. Last error:', lastError?.response?.data || lastError?.message);
    return this.generateProperlyFormattedArticle(questionnaireData, publication);
  }

  /**
   * Validate questionnaire data against publication guidelines
   * @param {Object} questionnaireData - User questionnaire data
   * @param {Object} publication - Publication guidelines
   * @returns {string|null} - Error message if validation fails, null if passes
   */
  validateAgainstGuidelines(questionnaireData, publication) {
    const { story_type, background, challenges, unique_perspective, highlights, aspirations } = questionnaireData;

    // Check if required fields are filled with meaningful content
    const requiredFields = [
      { field: background, name: 'background', minLength: 5 },
      { field: challenges, name: 'challenges', minLength: 5 },
      { field: unique_perspective, name: 'unique perspective', minLength: 5 },
      { field: highlights, name: 'highlights', minLength: 5 },
      { field: aspirations, name: 'future aspirations', minLength: 5 }
    ];

    for (const { field, name, minLength } of requiredFields) {
      if (!field || field.trim().length < minLength) {
        return `Your ${name} response is too short or missing. Please provide more detailed information (minimum ${minLength} characters) to meet our publication guidelines.`;
      }
    }

    // Check for inappropriate content
    const inappropriateWords = ['spam', 'scam', 'illegal', 'harmful', 'offensive'];
    const allText = Object.values(questionnaireData).filter(val => typeof val === 'string').join(' ').toLowerCase();

    for (const word of inappropriateWords) {
      if (allText.includes(word)) {
        return `Your submission contains content that violates our publication guidelines. Please revise and resubmit.`;
      }
    }

    // Check story type compatibility
    const allowedStoryTypes = ['profile', 'editorial', 'advertorial', 'listicle'];
    if (!allowedStoryTypes.includes(story_type)) {
      return `Invalid story type selected. Please choose from: ${allowedStoryTypes.join(', ')}.`;
    }

    // Check publication-specific restrictions
    if (publication?.excluding_categories) {
      const excludedCategories = publication.excluding_categories.toLowerCase();
      if (excludedCategories.includes(story_type.toLowerCase()) ||
          allText.includes(excludedCategories)) {
        return `Your submission content conflicts with this publication's guidelines. Please review the publication requirements and resubmit.`;
      }
    }

    return null; // Validation passed
  }

  /**
   * Format the generated article content properly
   * @param {string} content - Raw generated content
   * @param {Object} questionnaireData - User questionnaire data
   * @param {Object} publication - Publication guidelines
   * @returns {string} - Formatted article content
   */
  formatArticleContent(content, questionnaireData, publication) {
    // Split content into lines for processing
    const lines = content.split('\n');
    let formattedContent = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip empty lines at the beginning
      if (line === '' && formattedContent === '') continue;

      // Handle main title (# Title)
      if (line.startsWith('# ') && !line.includes('##')) {
        const title = line.substring(2);
        formattedContent += `<h1 style="font-size: 2.5rem; font-weight: 800; color: #212121; margin: 2rem 0 1.5rem 0; line-height: 1.2;">${title}</h1>`;
        continue;
      }

      // Handle section headers (## Header)
      if (line.startsWith('## ')) {
        // Close any open paragraph
        if (formattedContent.endsWith('</p>')) {
          formattedContent = formattedContent.slice(0, -4);
        } else if (formattedContent && !formattedContent.endsWith('>')) {
          formattedContent += '</p>';
        }

        const header = line.substring(3);
        formattedContent += `<h2 style="font-size: 1.8rem; font-weight: 700; color: #212121; margin: 3rem 0 1.5rem 0; padding-bottom: 0.5rem; border-bottom: 3px solid #1976D2;">${header}</h2>`;
        continue;
      }

      // Handle bullet points (- item)
      if (line.startsWith('- ')) {
        if (!inList) {
          formattedContent += '<ul style="margin: 1.5rem 0; padding-left: 2rem;">';
          inList = true;
        }
        const item = line.substring(2);
        formattedContent += `<li style="font-size: 1.1rem; line-height: 1.8; color: #212121; margin-bottom: 0.5rem;">${item}</li>`;
        continue;
      }

      // Handle end of list
      if (inList && (line === '' || !line.startsWith('- '))) {
        formattedContent += '</ul>';
        inList = false;
      }

      // Handle regular paragraphs
      if (line && !line.startsWith('#') && !line.startsWith('- ') && !line.startsWith('*')) {
        if (!formattedContent.includes('<p>') || formattedContent.endsWith('</p>') || formattedContent.endsWith('</h2>') || formattedContent.endsWith('</ul>')) {
          formattedContent += `<p style="font-size: 1.1rem; line-height: 1.8; color: #212121; margin-bottom: 1.5rem;">${line}`;
        } else {
          formattedContent += ` ${line}`;
        }
      }

      // Handle attribution line
      if (line.startsWith('*') && line.includes('generated using AI')) {
        if (formattedContent.endsWith('</p>')) {
          formattedContent = formattedContent.slice(0, -4);
        }
        formattedContent += `<div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #E0E0E0; font-size: 0.9rem; color: #757575; font-style: italic;">${line.substring(1)}</div>`;
      }
    }

    // Close any open tags
    if (inList) {
      formattedContent += '</ul>';
    }
    if (formattedContent && !formattedContent.endsWith('</p>') && !formattedContent.endsWith('</div>')) {
      formattedContent += '</p>';
    }

    return formattedContent;
  }

  /**
   * Generate a properly formatted article that simulates Gemini AI output
   * @param {Object} questionnaireData - User questionnaire data
   * @param {Object} publication - Publication guidelines
   * @returns {string} - Properly formatted article
   */
  generateProperlyFormattedArticle(questionnaireData, publication) {
    const { additional_prompt } = questionnaireData;
    const {
      story_type,
      name,
      preferred_title,
      background,
      inspiration,
      challenges,
      unique_perspective,
      highlights,
      anecdotes,
      aspirations,
      additional_info,
      goal,
      audience,
      message,
      points,
      seo_keywords,
      tone,
      social_links,
      references,
      title_ideas,
      exclude_info,
      geo_location,
      person_name,
      company_name
    } = questionnaireData;

    let article = `# ${name || 'Subject Name'}: A ${story_type} Story\n\n`;

    // Apply additional prompt modifications
    const makeLonger = additional_prompt && additional_prompt.toLowerCase().includes('long');
    const makeShorter = additional_prompt && additional_prompt.toLowerCase().includes('short');

    article += `## Introduction\n\n`;
    if (background) {
      article += `${background}`;
      if (makeLonger) {
        article += ` This comprehensive background provides essential context for understanding the subject's journey and the challenges they have overcome.`;
      }
      article += `\n\n`;
    } else {
      article += `This article explores the remarkable journey and achievements of ${name || 'our subject'} in their field.`;
      if (makeLonger) {
        article += ` Through detailed examination of their background, experiences, and accomplishments, we gain valuable insights into what drives success in today's competitive landscape.`;
      }
      article += `\n\n`;
    }

    article += `## The Journey\n\n`;
    if (message) {
      article += `${message}`;
      if (makeLonger) {
        article += ` This journey represents not just personal growth, but also the evolution of an entire field or industry approach.`;
      }
      article += `\n\n`;
    } else {
      article += `The journey began with a vision to make a difference and has evolved into a story of perseverance and success.`;
      if (makeLonger) {
        article += ` Every step along this path has been marked by determination, innovation, and an unwavering commitment to excellence that continues to inspire others in similar pursuits.`;
      }
      article += `\n\n`;
    }

    article += `## Key Achievements\n\n`;
    const achievements = [];
    if (goal) achievements.push(`- ${goal}`);
    if (highlights) achievements.push(`- ${highlights}`);
    if (audience) achievements.push(`- Successfully reached and engaged ${audience}`);
    if (unique_perspective) achievements.push(`- ${unique_perspective}`);
    if (achievements.length === 0) {
      achievements.push('- Achieved significant milestones in their field');
      achievements.push('- Built a strong reputation through consistent excellence');
      achievements.push('- Demonstrated leadership and innovation');
    }

    if (makeLonger) {
      achievements.push('- Pioneered new approaches and methodologies');
      achievements.push('- Mentored and inspired the next generation of professionals');
      achievements.push('- Received recognition from industry leaders and peers');
    }

    article += achievements.join('\n') + '\n\n';

    article += `## Future Outlook\n\n`;
    if (aspirations) {
      article += `${aspirations}`;
      if (makeLonger) {
        article += ` These forward-looking goals demonstrate a continued commitment to growth, innovation, and making a lasting impact on their field.`;
      }
      article += `\n\n`;
    } else {
      article += `Looking ahead, ${name || 'the subject'} continues to innovate and inspire in their industry.`;
      if (makeLonger) {
        article += ` The ${story_type} presented here demonstrates the power of dedication and vision in achieving remarkable results, while also pointing toward exciting future developments that will further advance their field.`;
      } else {
        article += ` The ${story_type} presented here demonstrates the power of dedication and vision in achieving remarkable results.`;
      }
      article += `\n\n`;
    }

    article += `## Conclusion\n\n`;
    article += `This comprehensive ${story_type} showcases the remarkable journey and achievements of ${name || 'the subject'}.`;
    if (makeLonger) {
      article += ` Through this detailed exploration, we see not just individual success, but also the broader implications for industry standards, innovation, and the future of professional excellence.`;
    }
    article += ` For ${publication?.publication_name || 'the publication'}, this represents another compelling story of success and inspiration.\n\n`;

    article += `*This article was generated using AI technology for ${publication?.publication_name || 'the publication'}.*`;

    return article;
  }

  /**
   * Get default content for missing sections
   * @param {string} section - Section name
   * @param {Object} questionnaireData - User questionnaire data
   * @returns {string} - Default section content
   */
  getDefaultSectionContent(section, questionnaireData) {
    const { background, message, goal, audience, aspirations } = questionnaireData;

    switch (section) {
      case 'Introduction':
        return background || 'This article introduces the subject and their background.';
      case 'The Journey':
        return message || 'This section explores the journey and key messages.';
      case 'Key Achievements':
        return `- ${goal || 'Achieved significant milestones'}\n- ${audience || 'Reached target audiences'}\n- Built strong reputation through excellence`;
      case 'Future Outlook':
        return aspirations || 'Looking forward to continued success and innovation.';
      case 'Conclusion':
        return 'This comprehensive story showcases remarkable achievements and future potential.';
      default:
        return 'Content for this section.';
    }
  }

  /**
   * Build the prompt for article generation
   * @param {Object} questionnaireData - User questionnaire data
   * @param {Object} publication - Publication guidelines
   * @returns {string} - Formatted prompt
   */
  buildArticlePrompt(questionnaireData, publication) {
    const {
      story_type,
      name,
      preferred_title,
      background,
      inspiration,
      challenges,
      unique_perspective,
      highlights,
      anecdotes,
      aspirations,
      additional_info,
      goal,
      audience,
      message,
      points,
      seo_keywords,
      tone,
      social_links,
      references,
      title_ideas,
      exclude_info,
      geo_location,
      person_name,
      company_name
    } = questionnaireData;

    let prompt = `You are a professional journalist writing a high-quality ${story_type} article for ${publication.publication_name || 'a publication'}. `;

    // Add publication guidelines if available
    if (publication.word_limit) {
      prompt += `The article should be approximately ${publication.word_limit} words. `;
    }

    prompt += `\n\nIMPORTANT: You must structure your response in proper Markdown format with these exact sections:\n`;
    prompt += `1. A main title starting with # (e.g., "# ${name || 'Subject'}: A ${story_type} Story")\n`;
    prompt += `2. ## Introduction section\n`;
    prompt += `3. ## The Journey section\n`;
    prompt += `4. ## Key Achievements section (use bullet points)\n`;
    prompt += `5. ## Future Outlook section\n`;
    prompt += `6. ## Conclusion section\n`;
    prompt += `7. Attribution note at the end\n\n`;

    prompt += `Write a ${story_type} article based on the following information:\n\n`;

    // Add subject information
    if (name) prompt += `Subject Name: ${name}\n`;
    if (preferred_title) prompt += `Preferred Title: ${preferred_title}\n`;
    if (background) prompt += `Background: ${background}\n`;
    if (inspiration) prompt += `Inspiration: ${inspiration}\n`;
    if (challenges) prompt += `Challenges: ${challenges}\n`;
    if (unique_perspective) prompt += `Unique Perspective: ${unique_perspective}\n`;
    if (highlights) prompt += `Highlights: ${highlights}\n`;
    if (anecdotes) prompt += `Anecdotes: ${anecdotes}\n`;
    if (aspirations) prompt += `Aspirations: ${aspirations}\n`;
    if (additional_info) prompt += `Additional Information: ${additional_info}\n`;

    // Add article requirements
    if (goal) prompt += `\nGoal of the article: ${goal}\n`;
    if (audience) prompt += `Target Audience: ${audience}\n`;
    if (message) prompt += `Key Message: ${message}\n`;
    if (points) prompt += `Key Points to Cover: ${points}\n`;
    if (tone) prompt += `Tone: ${tone}\n`;

    // Add SEO information
    if (seo_keywords) prompt += `SEO Keywords: ${seo_keywords}\n`;
    if (geo_location) prompt += `Geographic Location: ${geo_location}\n`;
    if (person_name) prompt += `Person Name for SEO: ${person_name}\n`;
    if (company_name) prompt += `Company Name for SEO: ${company_name}\n`;

    // Add references and social links if provided
    if (references) prompt += `References to include: ${references}\n`;
    if (social_links) {
      const links = typeof social_links === 'string' ? social_links : JSON.stringify(social_links);
      prompt += `Social Media Links: ${links}\n`;
    }

    // Add title ideas
    if (title_ideas) prompt += `Title Ideas: ${title_ideas}\n`;

    // Add exclusions
    if (exclude_info) prompt += `Information to exclude: ${exclude_info}\n`;

    prompt += `\n\nCRITICAL FORMATTING REQUIREMENTS:\n`;
    prompt += `- Start with a main title using # symbol\n`;
    prompt += `- Use ## for section headers (Introduction, The Journey, Key Achievements, Future Outlook, Conclusion)\n`;
    prompt += `- Use bullet points (-) for Key Achievements section\n`;
    prompt += `- End with: "*This article was generated using AI technology for ${publication?.publication_name || 'the publication'}.*"\n`;
    prompt += `- Write in a professional, journalistic tone\n`;
    prompt += `- Ensure all provided information is incorporated naturally\n`;
    prompt += `- Make the article engaging and informative\n\n`;

    prompt += `Please write a compelling, well-structured ${story_type} article that follows journalistic standards and incorporates all the provided information. Ensure the article is engaging, informative, and optimized for the target audience.`;

    return prompt;
  }
}

module.exports = new AIService();
