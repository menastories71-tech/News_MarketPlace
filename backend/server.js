require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./src/routes/auth');
const adminAuthRoutes = require('./src/routes/adminAuth');
const contactRoutes = require('./src/routes/contact');
const groupRoutes = require('./src/routes/groups');
const publicationRoutes = require('./src/routes/publications');
const notificationRoutes = require('./src/routes/notifications');
const powerlistRoutes = require('./src/routes/powerlist');
const powerlistNominationsRoutes = require('./src/routes/powerlistNominations');
const powerlistNominationSubmissionsRoutes = require('./src/routes/powerlistNominationSubmissions');
const awardsRoutes = require('./src/routes/awards');
const awardSubmissionsRoutes = require('./src/routes/awardSubmissions');
const radioRoutes = require('./src/routes/radios');
const paparazziRoutes = require('./src/routes/paparazzi');
const themeRoutes = require('./src/routes/themes');
const websitesRoutes = require('./src/routes/websites');
const pressPackRoutes = require('./src/routes/pressPacks');
const agenciesRoutes = require('./src/routes/agencies');
const reportersRoutes = require('./src/routes/reporters');
const podcastersRoutes = require('./src/routes/podcasters');
const eventEnquiriesRoutes = require('./src/routes/eventEnquiries');
const affiliateEnquiriesRoutes = require('./src/routes/affiliateEnquiries');
const careersRoutes = require('./src/routes/careers');
const blogsRoutes = require('./src/routes/blogs');
const realEstatesRoutes = require('./src/routes/realEstates');
const realEstateProfessionalsRoutes = require('./src/routes/realEstateProfessionals');
const realEstateOrdersRoutes = require('./src/routes/realEstateOrders');
const publishedWorksRoutes = require('./src/routes/publishedWorks');
const articleSubmissionsRoutes = require('./src/routes/articleSubmissions');
const adminArticleSubmissionsRoutes = require('./src/routes/adminArticleSubmissions');
console.log('Admin Article Submissions Routes loaded:', typeof adminArticleSubmissionsRoutes);
const adminPowerlistManagementRoutes = require('./src/routes/adminPowerlistManagement');
console.log('Admin Powerlist Management Routes loaded:', typeof adminPowerlistManagementRoutes);
const adminPublicationManagementRoutes = require('./src/routes/adminPublicationManagement');
console.log('Admin Publication Management Routes loaded:', typeof adminPublicationManagementRoutes);
const adminPaparazziCreationsRoutes = require('./src/routes/adminPaparazziCreations');
console.log('Admin Paparazzi Creations Routes loaded:', typeof adminPaparazziCreationsRoutes);
const adminEventCreationRoutes = require('./src/routes/adminEventCreation');
console.log('Admin Event Creation Routes loaded:', typeof adminEventCreationRoutes);
const adminAwardCreationRoutes = require('./src/routes/adminAwardCreation');
console.log('Admin Award Creation Routes loaded:', typeof adminAwardCreationRoutes);
const adminRealEstateRoutes = require('./src/routes/adminRealEstate');
console.log('Admin Real Estate Routes loaded:', typeof adminRealEstateRoutes);
const adminRealEstateProfessionalsRoutes = require('./src/routes/adminRealEstateProfessionals');
console.log('Admin Real Estate Professionals Routes loaded:', typeof adminRealEstateProfessionalsRoutes);
const adminPressPacksRoutes = require('./src/routes/adminPressPacks');
console.log('Admin Press Packs Routes loaded:', typeof adminPressPacksRoutes);
const adminPressReleasesRoutes = require('./src/routes/adminPressReleases');
console.log('Admin Press Releases Routes loaded:', typeof adminPressReleasesRoutes);
const adminPressPackOrdersRoutes = require('./src/routes/adminPressPackOrders');
console.log('Admin Press Pack Orders Routes loaded:', typeof adminPressPackOrdersRoutes);
const aiGeneratedArticlesRoutes = require('./src/routes/aiGeneratedArticles');
const ordersRoutes = require('./src/routes/orders');
const paparazziOrdersRoutes = require('./src/routes/paparazziOrders');
const themeOrdersRoutes = require('./src/routes/themeOrders');
const pressPackOrdersRoutes = require('./src/routes/pressPackOrders');
const radioOrdersRoutes = require('./src/routes/radioOrders');
const rolePermissionsRoutes = require('./src/routes/rolePermissions');
const eventsRoutes = require('./src/routes/events');
const eventApplicationsRoutes = require('./src/routes/eventApplications');
const otpRoutes = require('./src/routes/otp');
const translationsRoutes = require('./src/routes/translations');
const cookieRoutes = require('./src/routes/cookies');
// const userRoutes = require('./src/routes/users');
// const articleRoutes = require('./src/routes/articles');
// const paymentRoutes = require('./src/routes/payments');
// const adminRoutes = require('./src/routes/admin');
// const uploadRoutes = require('./src/routes/uploads');

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection on startup
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');

    // Migrations are now handled by separate migration files
    // Run: node run_specific_migration.js <migration_number>
    console.log('ℹ️  Migrations are handled by separate files. Use run_specific_migration.js for manual migrations.');

    release();
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Stricter rate limiting for admin authentication
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 admin login attempts per windowMs (development)
  message: 'Too many admin login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('combined'));

// Apply global rate limiter to non-admin routes
// Temporarily disabled for testing
// app.use((req, res, next) => {
//   if (req.path.startsWith('/api/admin/')) {
//     return next();
//   }
//   return limiter(req, res, next);
// });
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Static file serving removed - all files now served from S3

// Test route (moved to top)
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route working' });
});

// Debug route for article submission
app.get('/api/debug-article-submission', (req, res) => {
  console.log('Debug route hit');
  res.json({
    message: 'Debug route working',
    timestamp: new Date().toISOString()
  });
});

// Test POST route for article submissions
app.post('/api/test-article-submission', (req, res) => {
  console.log('Test POST route hit');
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  res.json({
    message: 'Test POST route working',
    receivedBody: !!req.body,
    receivedFiles: !!req.files,
    timestamp: new Date().toISOString()
  });
});

// Ultra simple test
app.get('/simple-test', (req, res) => {
  console.log('Simple test route working!');
  res.json({ message: 'Simple test working!' });
});

// Routes
const { getMetaData } = require('./src/utils/metaTags');

app.get([
  '/publications', '/publications/:id',
  '/events', '/events/:id',
  '/blog', '/blog/:id',
  '/blogs', '/blogs/:id',
  '/careers', '/careers/:id',
  '/themes', '/themes/:id',
  '/power-lists', '/power-lists/:id',
  '/paparazzi', '/paparazzi/:id',
  '/awards', '/awards/:id',
  '/real-estate-professionals', '/real-estate-professionals/:id',
  '/radio', '/radio/:id',
  '/podcasters', '/podcasters/:id',
  '/press-packs', '/press-packs/:id',
  '/published-works', '/published-works/:id'
], async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBotLike = /bot|crawler|spider|facebookexternalhit|linkedin|twitterbot|whatsapp|slack|discord|pinterest|googlebot|bingbot|applebot|telegram/i.test(userAgent);

  const route = req.path.split('/')[1];
  const idOrSlug = req.params.id;

  // IMPORTANT: Only serve metadata to bots. 
  // For humans, call next() so they get the standard React app.
  if (!isBotLike) {
    return next();
  }

  // If we can't get an ID or slug part, let the SPA handle it
  if (!idOrSlug) {
    return next();
  }

  console.log(`[SHARE-BOT-HIT] Path: ${req.path} | UA: ${userAgent}`);

  try {
    const html = await getMetaData(route, idOrSlug);
    const body = Buffer.from(html, 'utf-8');

    res.set('X-VaaS-Source', 'metadata-bot-service');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Content-Length', body.length);
    res.set('Cache-Control', 'public, max-age=3600');

    return res.status(200).send(body);
  } catch (error) {
    console.error(`[SHARE-ERROR] Bot metadata failure for ${req.path}:`, error);
    next();
  }
});

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthLimiter, adminAuthRoutes);
// Test direct route mounting
app.get('/test-admin-routes', (req, res) => {
  console.log('Direct test route working!');
  res.json({ message: 'Direct test route working!' });
});

console.log('Mounting admin article submissions at /api/admin/article-submissions');
app.use('/api/admin/article-submissions', adminArticleSubmissionsRoutes);
console.log('Mounting admin powerlist management at /api/admin/powerlist-management');
app.use('/api/admin/powerlist-management', adminPowerlistManagementRoutes);
console.log('Mounting admin publication management at /api/admin/publication-management');
app.use('/api/admin/publication-management', adminPublicationManagementRoutes);
console.log('Mounting admin paparazzi creations at /api/admin/paparazzi-creations');
app.use('/api/admin/paparazzi-creations', adminPaparazziCreationsRoutes);
console.log('Mounting admin event creations at /api/admin/event-creations');
app.use('/api/admin/event-creations', adminEventCreationRoutes);
console.log('Mounting admin award creations at /api/admin/award-creations');
app.use('/api/admin/award-creations', adminAwardCreationRoutes);
console.log('Mounting admin real estate at /api/admin/real-estates');
app.use('/api/admin/real-estates', adminRealEstateRoutes);
console.log('Mounting admin real estate professionals at /api/admin/real-estate-professionals');
app.use('/api/admin/real-estate-professionals', adminRealEstateProfessionalsRoutes);
console.log('Mounting admin press packs at /api/admin/press-packs');
app.use('/api/admin/press-packs', adminPressPacksRoutes);
console.log('Mounting admin press releases at /api/admin/press-releases');
app.use('/api/admin/press-releases', adminPressReleasesRoutes);
console.log('Mounting admin press pack orders at /api/admin/press-pack-orders');
app.use('/api/admin/press-pack-orders', adminPressPackOrdersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/powerlist', powerlistRoutes);
app.use('/api/powerlist-nominations', powerlistNominationsRoutes);
app.use('/api/powerlist-nomination-submissions', powerlistNominationSubmissionsRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/award-submissions', awardSubmissionsRoutes);
app.use('/api/radios', radioRoutes);
app.use('/api/paparazzi', paparazziRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/websites', websitesRoutes);
app.use('/api/press-packs', pressPackRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/reporters', reportersRoutes);
app.use('/api/podcasters', podcastersRoutes);
app.use('/api/event-enquiries', eventEnquiriesRoutes);
app.use('/api/real-estates', realEstatesRoutes);
app.use('/api/real-estate-professionals', realEstateProfessionalsRoutes);
app.use('/api/real-estate-orders', realEstateOrdersRoutes);
app.use('/api/published-works', publishedWorksRoutes);
app.use('/api/affiliate-enquiries', affiliateEnquiriesRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/blogs', blogsRoutes);
console.log('Mounting article submissions at /api/article-submissions');
app.use('/api/article-submissions', articleSubmissionsRoutes);
console.log('Article submissions routes mounted successfully');
app.use('/api/ai-generated-articles', aiGeneratedArticlesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/paparazzi-orders', paparazziOrdersRoutes);
app.use('/api/theme-orders', themeOrdersRoutes);
app.use('/api/press-pack-orders', pressPackOrdersRoutes);
app.use('/api/radio-orders', radioOrdersRoutes);
app.use('/api/admin/role-permissions', rolePermissionsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/event-applications', eventApplicationsRoutes);
app.use('/api/otp', otpRoutes);
// --- TRANSLATION SAFETY NET ---
const axios = require('axios');
app.use(['/api/translation', '/api/translations'], async (req, res) => {
  // Extract the part of the URL after /api/translation
  // e.g., if req.originalUrl is /api/translation/translate/batch, path is /translate/batch
  let targetPath = req.originalUrl.replace(/^\/api\/translations?/, '');
  if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

  const targetUrl = `http://127.0.0.1:5005${targetPath}`;
  console.log(`[SAFETY-NET] 🔄 Forwarding ${req.method} to: ${targetUrl}`);

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[SAFETY-NET-ERROR] ❌ ${error.message}`);
    return res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Translation safety-net failure', details: error.message }
    );
  }
});

app.use('/api/cookies', cookieRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/articles', articleRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to News Marketplace Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      adminAuth: '/api/admin/auth',
      contact: '/api/contact',
      groups: '/api/groups',
      publications: '/api/publications',
      notifications: '/api/notifications',
      reporters: '/api/reporters',
      blogs: '/api/blogs',
      users: '/api/users',
      articles: '/api/articles',
      payments: '/api/payments',
      awards: '/api/awards',
      awardSubmissions: '/api/award-submissions',
      radios: '/api/radios',
      paparazzi: '/api/paparazzi',
      themes: '/api/themes',
      pressPacks: '/api/press-packs',
      affiliateEnquiries: '/api/affiliate-enquiries',
      otp: '/api/otp',
      admin: '/api/admin',
      uploads: '/api/uploads'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export app for testing
module.exports = app;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}