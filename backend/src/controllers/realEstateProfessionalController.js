const RealEstateProfessional = require('../models/RealEstateProfessional');
const { verifyRecaptcha } = require('../services/recaptchaService');
const { s3Service } = require('../services/s3Service');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Maximum 1 file for professional image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});


class RealEstateProfessionalController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getApprovedRealEstateProfessionals = this.getApprovedRealEstateProfessionals.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
    this.getLanguages = this.getLanguages.bind(this);
    this.getCountries = this.getCountries.bind(this);
    this.getCities = this.getCities.bind(this);
  }

  // Validation rules for user submissions
  createValidation = [
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('ig_url').optional().isURL().withMessage('Instagram URL must be a valid URL'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('verified_tick').optional().isBoolean().withMessage('Verified tick must be a boolean'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    body('tiktok').optional().isURL().withMessage('TikTok URL must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook URL must be a valid URL'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be a valid URL'),
    body('real_estate_agency_owner').optional().isBoolean().withMessage('Real estate agency owner must be a boolean'),
    body('real_estate_agent').optional().isBoolean().withMessage('Real estate agent must be a boolean'),
    body('developer_employee').optional().isBoolean().withMessage('Developer employee must be a boolean'),
    body('gender').optional().trim(),
    body('nationality').optional().trim(),
    body('current_residence_city').optional().trim(),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('recaptchaToken').optional()
  ];

  // Create a new real estate professional submission
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to submit a real estate professional application'
        });
      }

      // Verify reCAPTCHA for user submissions (not admin submissions)
      // Admin routes don't require reCAPTCHA
      if (req.body.recaptchaToken && !req.originalUrl.includes('/admin/')) {
        const recaptchaScore = await verifyRecaptcha(req.body.recaptchaToken);
        if (recaptchaScore === null || recaptchaScore < 0.5) {
          return res.status(400).json({
            error: 'reCAPTCHA verification failed',
            message: 'Please complete the reCAPTCHA verification'
          });
        }
      }

      const professionalData = { ...req.body };

      // Handle image upload to S3
      if (req.file) {
        const s3Key = s3Service.generateKey('real-estate-professionals', 'image', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          professionalData.image = s3Url;
        } catch (uploadError) {
          console.error(`Failed to upload professional image to S3:`, uploadError);
          throw new Error('Failed to upload image');
        }
      }

      // Remove recaptchaToken from data before saving
      delete professionalData.recaptchaToken;

      // Set submission details
      professionalData.submitted_by = req.user.userId;
      professionalData.status = 'pending';

      const professional = await RealEstateProfessional.create(professionalData);
      res.status(201).json({
        message: 'Real estate professional submission created successfully and is pending review',
        professional: professional.toJSON()
      });
    } catch (error) {
      console.error('Create real estate professional error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Get approved real estate professionals for public access
  async getApprovedRealEstateProfessionals(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        first_name,
        last_name,
        nationality,
        gender,
        profession_type,
        current_residence_city,
        languages
      } = req.query;

      // Build filters - only approved and active
      const filters = {
        status: 'approved',
        is_active: true
      };

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (first_name) {
        searchSql += ` AND rp.first_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${first_name}%`);
        searchParamCount++;
      }

      if (last_name) {
        searchSql += ` AND rp.last_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${last_name}%`);
        searchParamCount++;
      }


      if (current_residence_city) {
        searchSql += ` AND LOWER(rp.current_residence_city) = LOWER($${searchParamCount})`;
        searchValues.push(current_residence_city);
        searchParamCount++;
      }

      if (gender) {
        searchSql += ` AND LOWER(rp.gender) = LOWER($${searchParamCount})`;
        searchValues.push(gender);
        searchParamCount++;
      }

      if (profession_type) {
        switch (profession_type) {
          case 'agency_owner':
            searchSql += ` AND rp.real_estate_agency_owner = true`;
            break;
          case 'agent':
            searchSql += ` AND rp.real_estate_agent = true`;
            break;
          case 'developer_employee':
            searchSql += ` AND rp.developer_employee = true`;
            break;
          default:
            // No filtering if invalid profession_type
            break;
        }
      }

      if (languages) {
        // Search for professionals who speak the specified language (case-insensitive)
        // languages field is stored as JSON string, so we need to parse it first
        searchSql += ` AND LOWER($${searchParamCount}) = ANY(ARRAY(SELECT LOWER(unnest(rp.languages::json))))`;
        searchValues.push(languages);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const professionals = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        professionals: professionals.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get approved real estate professionals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved real estate professional by ID (public access)
  async getApprovedById(req, res) {
    try {
      const { id } = req.params;
      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      // Only allow access to approved and active professionals
      if (professional.status !== 'approved' || !professional.is_active) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      res.json({ professional: professional.toJSON() });
    } catch (error) {
      console.error('Get approved real estate professional by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods for database queries
  async findAllWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE rp.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT rp.* FROM real_estate_professionals rp
      ${whereClause} ${searchSql}
      ORDER BY rp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    // Ensure languages field is properly parsed for raw SQL results
    return result.rows.map(row => {
      if (row.languages && typeof row.languages === 'string') {
        try {
          row.languages = JSON.parse(row.languages);
        } catch (e) {
          console.error('Error parsing languages in raw query result:', e);
          row.languages = [];
        }
      }
      return new RealEstateProfessional(row);
    });
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE rp.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM real_estate_professionals rp ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Get languages for real estate professional form
  async getLanguages(req, res) {
    try {
      const languages = [
        'English', 'Hindi', 'Arabic', 'French', 'Spanish', 'Chinese', 'Russian', 'German', 'Japanese', 'Portuguese'
      ];
      res.json({ languages });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get countries for real estate professional form
  async getCountries(req, res) {
    try {
      const countryPhoneData = require('../data/countryPhoneData');
      const countries = Object.keys(countryPhoneData);
      res.json({ countries });
    } catch (error) {
      console.error('Get countries error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get cities for a specific country
  async getCities(req, res) {
    try {
      const { country } = req.params;
      if (!country) {
        return res.status(400).json({ error: 'Country parameter is required' });
      }

      const citiesByCountry = {
        "India": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Tiruppur", "Davanagere", "Kozhikode", "Akbarpur", "Kurnool", "Rajpur Sonarpur", "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar", "Bhatpara", "Panihati", "Latur", "Dhule", "Tirupati", "Rohtak", "Korba", "Bhilwara", "Berhampur", "Muzaffarpur", "Ahmednagar", "Mathura", "Kollam", "Avadi", "Kadapa", "Kamarhati", "Bilaspur", "Shahjahanpur", "Bijapur", "Rampur", "Shivamogga", "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kulti", "Kakinada", "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Ozhukarai", "Bihar Sharif", "Panipat", "Darbhanga", "Bally", "Aizawl", "Dewas", "Ichalkaranji", "Karnal", "Bathinda", "Jalna", "Eluru", "Kirari Suleman Nagar", "Barasat", "Purnia", "Satna", "Mau", "Sonipat", "Farrukhabad", "Sagar", "Rourkela", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", "Anantapur", "Karimnagar", "Etawah", "Ambarnath", "North Dumdum", "Bharatpur", "Begusarai", "New Delhi", "Gandhidham", "Baranagar", "Tiruvottiyur", "Pondicherry", "Sikar", "Thoothukudi", "Rewa", "Mirzapur", "Raichur", "Pali", "Ramagundam", "Silchar", "Haridwar", "Vijayanagaram", "Tenali", "Nagercoil", "Sri Ganganagar", "Karawal Nagar", "Mango", "Thanjavur", "Bulandshahr", "Uluberia", "Katni", "Sambhal", "Singrauli", "Nadiad", "Secunderabad", "Naihati", "Yamunanagar", "Bidhan Nagar", "Pallavaram", "Bidar", "Munger", "Panchkula", "Burhanpur", "Raurkela Industrial Township", "Kharagpur", "Dindigul", "Gandhinagar", "Hospet", "Nangloi Jat", "Malda", "Ongole", "Deoghar", "Chapra", "Haldia", "Khandwa", "Nandyal", "Morena", "Amroha", "Anand", "Bhind", "Bhalswa Jahangir Pur", "Madhyamgram", "Bhiwani", "Berhampore", "Ambala", "Morbi", "Fatehpur", "Raebareli", "Khora", "Chittoor", "Bhusawal", "Orai", "Bahraich", "Phusro", "Vellore", "Mehsana", "Raiganj", "Sirsa", "Danapur", "Serampore", "Sultan Pur Majra", "Guna", "Jaunpur", "Panvel", "Shivpuri", "Surendranagar Dudhrej", "Unnao", "Chinsurah", "Alappuzha", "Kottayam", "Machilipatnam", "Shimla", "Adoni", "Udupi", "Katihar", "Proddatur", "Mahbubnagar", "Saharsa", "Dibrugarh", "Jorhat", "Hazaribagh", "Hindupur", "Nagaon", "Sasaram", "Hajipur", "Giridih", "Bhimavaram", "Kumbakonam", "Bongaigaon", "Dehri", "Madanapalle", "Siwan", "Bettiah", "Ramgarh", "Tinsukia", "Guntakal", "Srikakulam", "Motihari", "Dharmavaram", "Medak", "Cuddalore", "Narasaraopet", "Raigarh", "Nagaon", "Godhra", "Hindaun", "Tadpatri", "Mandya", "Bagaha", "Nandurbar", "Chakradharpur", "Pudukkottai", "Udamalpet", "Kishanganj", "Puducherry", "Palakkad", "Khargone", "Sivakasi", "Jhunjhunun", "Krishnanagar", "Ballia", "Neyveli", "Firozpur", "Vikarabad", "Tenali", "Greater Noida", "Shivpuri", "Baran", "Moga", "Barnala", "Lakhimpur", "Rajapalayam", "Budaun", "Raebareli", "Pilibhit", "Hardoi", "Chandausi", "Azamgarh", "Palwal", "Firozabad", "Fatehabad", "Ujhani", "Jalalabad", "Lakhisarai", "Tonk", "Siddipet", "Nagapattinam", "Suratgarh", "Miryalaguda", "Virudhachalam", "Nalgonda", "Chhatarpur", "Kairana", "Vaniyambadi", "Vidisha", "Ujjain", "Shamli", "Shikohabad", "Jhumri Telaiya", "Araria", "Gonda", "Bulandshahr", "Aligarh", "Etah", "Bahadurgarh", "Anantnag", "Balurghat", "Seoni", "Phagwara", "Kapurthala", "Muktsar", "Rajpura", "Erode", "Banga", "Sahibganj"],
        "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Long Beach", "Colorado Springs", "Raleigh", "Miami", "Virginia Beach", "Omaha", "Oakland", "Minneapolis", "Tulsa", "Arlington", "New Orleans", "Wichita", "Cleveland", "Tampa", "Bakersfield", "Aurora", "Anaheim", "Honolulu", "Santa Ana", "Corpus Christi", "Riverside", "Lexington", "Stockton", "Henderson", "Saint Paul", "St. Louis", "Cincinnati", "Pittsburgh", "Greensboro", "Anchorage", "Plano", "Lincoln", "Orlando", "Irvine", "Newark", "Durham", "Chula Vista", "Toledo", "Fort Wayne", "St. Petersburg", "Laredo", "Jersey City", "Chandler", "Madison", "Lubbock", "Scottsdale", "Reno", "Buffalo", "Gilbert", "Glendale", "North Las Vegas", "Winston-Salem", "Chesapeake", "Norfolk", "Fremont", "Garland", "Irving", "Hialeah", "Richmond", "Boise", "Spokane", "Baton Rouge"],
        "United Kingdom": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Glasgow", "Edinburgh", "Bristol", "Newcastle", "Sheffield"],
        "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
        "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraydah"],
        "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Nizhny Novgorod", "Kazan", "Chelyabinsk", "Omsk", "Samara", "Rostov-on-Don"],
        "Turkey": ["Istanbul", "Ankara", "İzmir", "Bursa", "Adana", "Gaziantep", "Konya", "Çankaya", "Antalya", "Kayseri"],
        "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "Tanta", "Asyut"],
        "Iran": ["Tehran", "Mashhad", "Isfahan", "Karaj", "Tabriz", "Shiraz", "Ahvaz", "Qom", "Kermanshah", "Urmia"],
        "Thailand": ["Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Hat Yai", "Pak Kret", "Si Racha", "Phuket", "Patong", "Pattaya"],
        "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang", "Haiphong", "Biên Hòa", "Cần Thơ", "Huế", "Nha Trang", "Vũng Tàu", "Quy Nhơn"],
        "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Goyang", "Seongnam", "Ulsan"],
        "China": ["Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Dongguan", "Tianjin", "Wuhan", "Hangzhou", "Nanjing", "Chengdu", "Chongqing", "Xi'an", "Suzhou", "Qingdao", "Shenyang", "Wuxi", "Xiamen", "Ningbo", "Foshan", "Hefei", "Harbin", "Shijiazhuang", "Jinan", "Dalian", "Zhengzhou", "Changsha", "Kunming", "Changchun", "Ürümqi", "Wenzhou", "Xuzhou", "Yangzhou", "Nanchang", "Huzhou", "Linyi", "Taiyuan", "Fuzhou", "Jiaxing", "Changzhou", "Zibo", "Tangshan", "Yantai", "Huai'an", "Lianyungang", "Qinhuangdao", "Zaozhuang", "Shaoxing", "Yangquan", "Jinzhou", "Hengyang", "Baotou", "Liuzhou", "Suzhou", "Xining", "Hohhot", "Yancheng", "Wuhu", "Mianyang", "Shaoyang", "Haikou", "Yinchuan", "Xiangtan", "Nanning", "Zhuzhou", "Putian", "Yulin", "Jining", "Jiaxing", "Wujiang", "Xinyang", "Jiujiang", "Leshan", "Xinxiang", "Yichang", "Quanzhou", "Nantong", "Xianyang", "Nanchong", "Zhenjiang", "Changde", "Neijiang", "Maoming", "Huaibei", "Xiangyang", "Yiyang", "Guilin", "Anqing", "Xinyu", "Huangshi", "Yixing", "Dandong", "Pingdingshan", "Sanming", "Jinhua", "Zhangzhou", "Taizhou", "Nanyang", "Ma'anshan", "Fushun", "Jieyang", "Shaoguan", "Yangjiang", "Laiwu", "Bengbu", "Chenzhou", "Meishan", "Handan", "Kaifeng", "Jiamusi", "Liaocheng", "Chifeng", "Shantou", "Heyuan", "Huainan", "Luohe", "Puyang", "Xingtai", "Heze", "Maoming", "Shaoxing", "Yueyang", "Huanggang", "Xiaogan", "Yunfu", "Chuzhou", "Huaihua", "Loudi", "Yongzhou", "Xinyang", "Hengyang", "Qianjiang", "Ezhou", "Tianmen", "Xiantao", "Qianjiang", "Hanchuan", "Xiaogan", "Wuxue", "Songzi", "Jingzhou", "Zhijiang", "Jingmen", "Yicheng", "Dangyang", "Zhuzhou", "Xiangtan", "Hengyang", "Chenzhou", "Yueyang", "Changde", "Zhangjiajie", "Huaihua", "Shaoyang", "Yiyang", "Loudi", "Chenzhou", "Yongzhou", "Huaihua", "Shaoyang", "Yiyang", "Loudi", "Chenzhou", "Yongzhou"],
        "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Bekasi", "Medan", "Tangerang", "Depok", "Semarang", "Palembang", "Makassar"],
        "Pakistan": ["Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Peshawar", "Multan", "Hyderabad", "Islamabad", "Quetta"],
        "Bangladesh": ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Comilla", "Barisal", "Sylhet", "Narayanganj", "Gazipur", "Rangpur"],
        "Nigeria": ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Jos"],
        "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
        "Mexico": ["Mexico City", "Guadalajara", "Puebla", "Tijuana", "Ecatepec", "León", "Juárez", "Torreón", "Querétaro", "Mérida"],
        "Philippines": ["Quezon City", "Manila", "Caloocan", "Davao City", "Cebu City", "Zamboanga City", "Taguig", "Antipolo", "Taguig", "Pasig"],
        "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta", "Ibagué"],
        "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "San Miguel de Tucumán", "La Plata", "Mar del Plata", "Salta", "Santa Fe", "San Juan"],
        "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Pietermaritzburg", "Benoni", "Tembisa"],
        "Kenya": ["Nairobi", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega"],
        "Morocco": ["Casablanca", "Rabat", "Fès", "Marrakech", "Salé", "Agadir", "Oujda", "Kenitra", "Tétouan", "Safi"],
        "Algeria": ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif", "Sidi Bel Abbès", "Biskra"],
        "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih", "Mykolaiv", "Mariupol"],
        "Poland": ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice"],
        "Romania": ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați", "Ploiești", "Oradea"],
        "Kazakhstan": ["Almaty", "Nur-Sultan", "Shymkent", "Aktobe", "Karaganda", "Taraz", "Pavlodar", "Ust-Kamenogorsk", "Semey", "Atyrau"],
        "Uzbekistan": ["Tashkent", "Namangan", "Samarkand", "Andijan", "Nukus", "Fergana", "Bukhara", "Qarshi", "Kokand", "Margilan"],
        "Malaysia": ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Kuching", "Shah Alam", "Kota Kinabalu", "Sandakan", "Seremban", "Kuantan"],
        "Peru": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Huancayo", "Tacna", "Iquitos", "Chimbote"],
        "Venezuela": ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Barcelona", "Maturín", "Puerto La Cruz", "Santa Teresa del Tuy"],
        "Ghana": ["Accra", "Kumasi", "Tamale", "Takoradi", "Atsiaman", "Tema", "Cape Coast", "Obuasi", "Teshie", "Madina"],
        "Ivory Coast": ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Gagnoa", "Divo", "Soubré"],
        "Angola": ["Luanda", "N'dalatando", "Huambo", "Lobito", "Benguela", "Kuito", "Lubango", "Malanje", "Namibe", "Soyo"],
        "Sri Lanka": ["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Jaffna", "Katunayake", "Negombo", "Kotte", "Sri Jayawardenepura Kotte"],
        "Myanmar": ["Yangon", "Mandalay", "Naypyidaw", "Mawlamyine", "Bago", "Pathein", "Monywa", "Sittwe", "Meiktila", "Myeik"],
        "Cameroon": ["Douala", "Yaoundé", "Garoua", "Kousséri", "Bamenda", "Maroua", "Bafoussam", "Mokolo", "Ngaoundéré", "Bertoua"],
        "Tanzania": ["Dar es Salaam", "Dodoma", "Mwanza", "Zanzibar City", "Arusha", "Mbeya", "Morogoro", "Tanga", "Kahama", "Tabora"],
        "Zimbabwe": ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru", "Epworth", "Kwekwe", "Kadoma", "Masvingo", "Chinhoyi"],
        "Senegal": ["Dakar", "Pikine", "Touba", "Thiès", "Kaolack", "Ziguinchor", "Saint-Louis", "Diourbel", "Louga", "Tambacounda"],
        "Guinea": ["Conakry", "Nzérékoré", "Kankan", "Manéah", "Dubréka", "Kindia", "Forécariah", "Coyah", "Siguiri", "Labé"],
        "Mali": ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes", "Ségou", "Gao", "Timbuktu", "Markala", "Kolokani"],
        "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora", "Dédougou", "Kaya", "Tenkodogo", "Réo", "Fada N'gourma"],
        "Chad": ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo", "Koumra", "Pala", "Am Timan", "Bongor", "Mongo"],
        "Sudan": ["Khartoum", "Omdurman", "Khartoum North", "Port Sudan", "Kassala", "Gedaref", "Kosti", "Al Fashir", "Ad-Damazin", "Sennar"],
        "Afghanistan": ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Jalalabad", "Kunduz", "Ghazni", "Balkh", "Baghlan", "Gardez"],
        "Yemen": ["Sana'a", "Al Hudaydah", "Taiz", "Aden", "Mukalla", "Ibb", "Dhamar", "Amran", "Sayyan", "Zabid"],
        "Nepal": ["Kathmandu", "Pokhara", "Patan", "Biratnagar", "Birgunj", "Dharan", "Bharatpur", "Janakpur", "Dhangadhi", "Butwal"],
        "Malawi": ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Karonga", "Kasungu", "Mangochi", "Salima", "Nkhotakota", "Liwonde"],
        "Zambia": ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola", "Mufulira", "Luanshya", "Livingstone", "Kasama", "Chipata"],
        "Mozambique": ["Maputo", "Matola", "Beira", "Nampula", "Chimoio", "Nacala", "Quelimane", "Tete", "Xai-Xai", "Maxixe"],
        "Ethiopia": ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Jimma", "Bahir Dar", "Dessie", "Jijiga", "Shashamane"],
        "Uganda": ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Bujumbura", "Mukono", "Kasese", "Masaka", "Entebbe"],
        "Cuba": ["Havana", "Santiago de Cuba", "Camagüey", "Holguín", "Guantánamo", "Santa Clara", "Las Tunas", "Bayamo", "Cienfuegos", "Pinar del Río"],
        "Dominican Republic": ["Santo Domingo", "Santiago de los Caballeros", "Santo Domingo Oeste", "Santo Domingo Este", "Santo Domingo Norte", "Puerto Plata", "La Romana", "San Pedro de Macorís", "Higüey", "San Francisco de Macorís"],
        "Haiti": ["Port-au-Prince", "Carrefour", "Delmas", "Pétion-Ville", "Port-de-Paix", "Jacmel", "Leogâne", "Les Cayes", "Jerémie", "Cap-Haïtien"],
        "Bolivia": ["Santa Cruz de la Sierra", "El Alto", "La Paz", "Cochabamba", "Oruro", "Sucre", "Potosí", "Tarija", "Sacaba", "Montero"],
        "Ecuador": ["Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Machala", "Durán", "Manta", "Portoviejo", "Loja", "Ambato"],
        "Guatemala": ["Guatemala City", "Villa Nueva", "Mixco", "Cobán", "Quetzaltenango", "Escuintla", "Jutiapa", "Chiquimula", "Huehuetenango", "Totonicapán"],
        "Honduras": ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Choluteca", "Comayagua", "Puerto Cortés", "La Lima", "Danlí"],
        "Paraguay": ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora", "Limpio", "Ñemby", "Encarnación"],
        "Nicaragua": ["Managua", "León", "Chinandega", "Masaya", "Estelí", "Granada", "Matagalpa", "Jinotega", "El Viejo", "Nueva Guinea"],
        "Costa Rica": ["San José", "Puerto Viejo", "Liberia", "Puntarenas", "Limón", "San Carlos", "Alajuela", "Heredia", "Cartago", "Guanacaste"],
        "Panama": ["Panama City", "San Miguelito", "Tocumen", "David", "Arraiján", "Colón", "Las Cumbres", "La Chorrera", "Pacora", "Santiago"],
        "Uruguay": ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó", "Melo", "Mercedes", "Artigas"],
        "Jamaica": ["Kingston", "Spanish Town", "Montego Bay", "Portmore", "Ocho Rios", "Mandeville", "May Pen", "Savanna-la-Mar", "Linstead", "Half Way Tree"],
        "Trinidad and Tobago": ["Chaguanas", "San Fernando", "Port of Spain", "Arima", "Point Fortin", "Princes Town", "Scarborough", "Marabella", "Tunapuna", "Sangre Grande"],
        "Barbados": ["Bridgetown", "Speightstown", "Oistins", "Bathsheba", "Holetown", "Crane", "Blackmans", "Greenland", "Hillcrest", "Warrens"],
        "Bahamas": ["Nassau", "Lucaya", "Freeport", "West End", "Cooper's Town", "Marsh Harbour", "High Rock", "Andros Town", "Clarence Town", "Dunmore Town"],
        "New Zealand": ["Auckland", "Wellington", "Christchurch", "Manurewa", "Hamilton", "Tauranga", "Lower Hutt", "Dunedin", "Palmerston North", "Napier"],
        "Papua New Guinea": ["Port Moresby", "Lae", "Madang", "Wewak", "Goroka", "Kokopo", "Kimbe", "Alotau", "Daru", "Popondetta"],
        "Fiji": ["Suva", "Nadi", "Lautoka", "Labasa", "Ba", "Sigatoka", "Tavua", "Rakiraki", "Nausori", "Levuka"],
        "Solomon Islands": ["Honiara", "Gizo", "Auki", "Kirakira", "Tulagi", "Lata", "Taro Island"],
        "Vanuatu": ["Port Vila", "Luganville", "Norsup", "Port Olry", "Isangel", "Sola", "Lakatoro", "Saratamata"],
        "Samoa": ["Apia", "Asau", "Mulifanua", "Faleula", "Siusega", "Malie", "Vaiusu", "Poutasi", "Afega", "Leulumoega"],
        "Tonga": ["Nuku'alofa", "Neiafu", "Haveluloto", "Vaini", "Pangai", "Ohonua", "Hihifo", "Tonga", "Mu'a", "Lapaha"],
        "Kiribati": ["Tarawa", "Betio", "Bikenibeu", "Teaoraereke", "Butaritari", "Makin", "Marakei", "Abaiang", "Maiana", "Kuria"],
        "Marshall Islands": ["Majuro", "Ebeye", "Jaluit", "Wotje", "Laura", "Namu", "Ebon", "Kili", "Lib", "Namdrik"],
        "Micronesia": ["Palikir", "Weno", "Tofol", "Kolonia", "Lelu", "Nett", "Sokehs", "Pohnpei"],
        "Palau": ["Ngerulmud", "Koror", "Kloulklubed", "Ulimang", "Mengellang", "Ngchesar", "Ngardmau", "Ngarchelong", "Ngatpang", "Ngchesar"],
        "Nauru": ["Yaren", "Anabar", "Anibare", "Baiti", "Boe", "Buada", "Denigomodu", "Ewa", "Ijuw", "Meneng"],
        "Tuvalu": ["Funafuti", "Savave", "Tanrake", "Toga", "Asau", "Kulia", "Niulakita", "Niutao", "Nui", "Nukufetau"],
        "Cook Islands": ["Avarua", "Rarotonga"],
        "Niue": ["Alofi"],
        "Tokelau": ["Atafu", "Nukunonu", "Fakaofo"],
        "Wallis and Futuna": ["Mata-Utu", "Sigave"],
        "French Polynesia": ["Papeete", "Faaa", "Punaauia", "Pirae", "Mahina", "Paea", "Arue", "Papara", "Moore", "Papar"],
        "New Caledonia": ["Nouméa", "Mont-Dore", "Dumbéa", "Païta", "Koné", "Wé", "Bourail", "Koumac", "Thio", "Canala"],
        "American Samoa": ["Pago Pago", "Tāfuna", "Nu'uuli", "Faleniu", "Leone", "Fagatogo", "Vatia", "Aoloau", "Aasu", "Mapusagafou"],
        "Northern Mariana Islands": ["Saipan", "Tinian", "Rota", "Northern Islands"],
        "Guam": ["Hagåtña", "Dededo", "Yigo", "Tamuning", "Mangilao", "Barrigada", "Santa Rita", "Chalan Pago-Ordot", "Ordot", "Agana Heights"],
        "Puerto Rico": ["San Juan", "Bayamón", "Carolina", "Ponce", "Caguas", "Guaynabo", "Mayagüez", "Trujillo Alto", "Arecibo", "Fajardo"],
        "U.S. Virgin Islands": ["Charlotte Amalie", "Christiansted", "Frederiksted", "Cruz Bay", "Longford", "Coral Bay", "East End"],
        "British Virgin Islands": ["Road Town", "Spanish Town", "East End", "West End", "Long Bay", "The Settlement", "Great Harbour", "Port Purcell"],
        "Cayman Islands": ["George Town", "West Bay", "Bodden Town", "North Side", "East End", "Little Cayman", "Cayman Brac"],
        "Turks and Caicos Islands": ["Cockburn Town", "Providenciales", "North Caicos", "Middle Caicos", "South Caicos", "Salt Cay", "Grand Turk"],
        "Bermuda": ["Hamilton", "Saint George", "Somerset", "Sandys", "Southampton", "Warwick", "Paget", "Pembroke", "Devonshire", "Smith's"],
        "Greenland": ["Nuuk", "Sisimiut", "Ilulissat", "Qaqortoq", "Aasiaat", "Maniitsoq", "Tasiilaq", "Paamiut", "Uummannaq", "Upernavik"],
        "Faroe Islands": ["Tórshavn", "Klaksvík", "Runavík", "Tvøroyri", "Fuglafjørður", "Vágur", "Vestmanna", "Sorvágur", "Saltangará", "Gjógv"],
        "Isle of Man": ["Douglas", "Onchan", "Peel", "Ramsey", "Castletown", "Port Erin", "Port St Mary", "Crosby", "Union Mills", "Laxey"],
        "Guernsey": ["Saint Peter Port", "Vale", "Castel", "Saint Sampson", "Saint Anne", "Saint Saviour", "Forest", "Torteval", "Saint Martin"],
        "Jersey": ["Saint Helier", "Saint Saviour", "Grouville", "Trinity", "Saint John", "Saint Lawrence", "Saint Mary", "Saint Ouen", "Saint Peter", "Saint Brelade"],
        "Gibraltar": ["Gibraltar"],
        "Monaco": ["Monaco"],
        "Andorra": ["Andorra la Vella", "Escaldes-Engordany", "Encamp", "Sant Julià de Lòria", "La Massana", "Canillo", "Ordino", "El Pas de la Casa"],
        "Liechtenstein": ["Vaduz", "Schaan", "Balzers", "Triesen", "Eschen", "Mauren", "Triesenberg", "Ruggell", "Gamprin", "Schellenberg"],
        "San Marino": ["San Marino", "Serravalle", "Borgo Maggiore", "Acquaviva", "Chiesanuova", "Domagnano", "Faetano", "Fiorentino", "Montegiardino", "City of San Marino"],
        "Vatican City": ["Vatican City"],
        // Add more countries as needed
      };

      const cities = citiesByCountry[country] || [];
      res.json({ cities });
    } catch (error) {
      console.error('Get cities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RealEstateProfessionalController();