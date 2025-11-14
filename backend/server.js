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
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
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
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin/')) {
    return next();
  }
  return limiter(req, res, next);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Static file serving for uploads
app.use('/api/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthLimiter, adminAuthRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/powerlist', powerlistRoutes);
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
app.use('/api/affiliate-enquiries', affiliateEnquiriesRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/blogs', blogsRoutes);
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