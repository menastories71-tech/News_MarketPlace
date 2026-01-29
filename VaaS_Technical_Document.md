# VaaS Solutions - Complete Technical Documentation

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Platform:** https://vaas.solutions  
**Classification:** Technical Reference for Developers & DevOps

---

## 📑 Table of Contents

1. [System Overview](#1-system-overview)
2. [Advanced Technology Stack Analysis](#2-advanced-technology-stack-analysis)
    - [2.1 Frontend Engineering](#21-frontend-engineering)
    - [2.2 Backend Engineering](#22-backend-engineering)
    - [2.3 Database & Infrastructure](#23-database--infrastructure)
    - [2.4 Communication & OTP Strategy](#24-communication--otp-strategy)
    - [2.5 Specialist Library Deep-Dive](#25-specialist-library-deep-dive)
3. [Media Architecture: Image Life-cycle & Optimization](#3-media-architecture-image-life-cycle--optimization)
4. [SEO & AEO Strategy](#4-seo--aeo-strategy)
5. [Infrastructure & Global Hosting](#5-infrastructure--global-hosting)
6. [Project Structure: Complete Architectural Registry](#6-project-structure-complete-architectural-registry)
    - [6.1 Backend Controller Registry](#61-backend-controller-registry)
    - [6.2 Backend Route Registry](#62-backend-route-registry)
    - [6.3 Data Model Registry](#63-data-model-registry)
    - [6.4 Frontend Page Registry](#64-frontend-page-registry)
7. [Prerequisites & Requirements](#7-prerequisites--requirements)
    - [7.1 System Requirements](#71-system-requirements)
    - [7.2 Required Software](#72-required-software)
    - [7.3 Required Accounts](#73-required-accounts)
8. [Complete Local Development Setup](#8-complete-local-development-setup)
9. [Environment Configuration](#9-environment-configuration)
10. [Database Setup](#10-database-setup)
11. [Backend API Reference](#11-backend-api-reference)
12. [Frontend Architecture](#12-frontend-architecture)
13. [Authentication & Security](#13-authentication--security)
14. [VPS Hosting & Deployment](#14-vps-hosting--deployment)
15. [Nginx Configuration (Definitive Setup)](#15-nginx-configuration-definitive-setup)
16. [SSL Certificate Setup](#16-ssl-certificate-setup)
17. [PM2 Process Management](#17-pm2-process-management)
18. [Nginx Frontend Deployment](#18-nginx-frontend-deployment)
19. [CI/CD Pipeline & Automated Deployment](#19-cicd-pipeline--automated-deployment)
20. [Third-Party Services](#20-third-party-services)
21. [Troubleshooting Guide](#21-troubleshooting-guide)
22. [Quick Reference Registry](#22-quick-reference-registry)
23. [Performance Optimization & Scale](#23-performance-optimization--scale)

---

## 1. System Overview

VaaS Solutions is a comprehensive **media and content marketplace platform** built with modern web technologies. The system provides a multi-tenant architecture supporting:

- **Publications** — Digital magazine library with Flipbook reader
- **Podcasters** — Podcast directory with episode management
- **Radio Stations** — Radio station listings with streaming integration
- **Paparazzi** — Event photography marketplace
- **Themes** — Social media theme marketplace
- **Events** — Event management and registration
- **Power Lists** — Influential people rankings
- **Press Packs** — Downloadable press materials
- **Real Estate** — Property listings and professional directory
- **Awards** — Award program management
- **Blogs/Articles** — Content management with AI generation
- **Careers** — Job listing and application system

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                        │
│  - SSL Termination (Let's Encrypt)                              │
│  - Static file serving (React build)                            │
│  - API routing to Node.js                                       │
│  - Gzip compression                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   PM2 Process    │ │   PM2 Process    │ │   PM2 Process    │
│ news-marketplace │ │   translator     │ │  seo-automation  │
│    -backend      │ │  (Python Flask)  │ │                  │
│   (Node.js)      │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                    │
         ▼                    ▼
┌──────────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │   Redis Cloud    │
│   Database       │ │   (Caching)      │
└──────────────────┘ └──────────────────┘
         │
         ▼
┌──────────────────┐
│     AWS S3       │
│  (Media Storage) │
└──────────────────┘
```

---

## 2. Advanced Technology Stack Analysis

### 2.1 Frontend Engineering

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | Core UI library, component-based architecture |
| **Vite** | 7.1.7 | Build tool, HMR development server |
| **Tailwind CSS** | 4.1.16 | Utility-first CSS framework |
| **React Router DOM** | 6.20.1 | Client-side routing, nested routes |
| **Framer Motion** | 12.23.24 | Animation library, page transitions |
| **Axios** | 1.6.2 | HTTP client, API communication |
| **Lucide React** | 0.553.0 | Icon library (primary) |
| **React Icons** | 5.5.0 | Additional icon library |
| **React Helmet Async** | 2.0.5 | Dynamic meta tags, SEO |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **React PDF** | 10.2.0 | PDF rendering |
| **React PageFlip** | 2.0.3 | Flipbook/magazine viewer |
| **Quill** | 2.0.3 | Rich text editor |
| **React Google Recaptcha** | 3.1.0 | Form spam protection |
| **React Phone Number Input** | 3.4.14 | International phone input |
| **Styled Components** | 6.1.19 | CSS-in-JS (selective use) |
| **Three.js** | 0.181.1 | 3D graphics (homepage effects) |
| **Firebase** | 12.6.0 | Authentication, analytics |

### 2.2 Backend Engineering

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ LTS | Runtime environment |
| **Express.js** | 5.1.0 | Web framework |
| **Sequelize** | 6.37.7 | ORM for PostgreSQL |
| **PostgreSQL (pg)** | 8.16.3 | Database driver |
| **Redis** | 4.6.10 | Caching, sessions |
| **JWT (jsonwebtoken)** | 9.0.2 | Authentication tokens |
| **Bcrypt.js** | 2.4.3 | Password hashing |
| **Multer** | 1.4.5 | File upload handling |
| **Sharp** | 0.34.5 | Image processing, optimization |
| **AWS SDK S3** | 3.937.0 | Cloud storage integration |
| **Helmet** | 8.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.1 | HTTP request logging |
| **Express Rate Limit** | 7.1.5 | API rate limiting |
| **Express Validator** | 7.0.1 | Request validation |
| **Cookie Parser** | 1.4.6 | Cookie handling |
| **Nodemailer** | 7.0.11 | Email sending |
| **Axios** | 1.13.2 | HTTP client (server-side) |

### 2.3 Database & Infrastructure

| Component | Technology | Details |
|-----------|------------|---------|
| **Primary Database** | PostgreSQL | Relational data, ACID compliance |
| **ORM** | Sequelize | Model definitions, migrations, associations |
| **Caching Layer** | Redis Cloud | Session storage, API response caching |
| **File Storage** | AWS S3 | Media files, images, PDFs, documents |
| **Process Manager** | PM2 | Node.js lifecycle, auto-restart, clustering |
| **Web Server** | Nginx | Reverse proxy, SSL, static files |
| **OS** | Ubuntu 22.04 LTS | VPS operating system |

### 2.4 Communication & OTP Strategy

| Service | Provider | Purpose |
|---------|----------|---------|
| **Email Delivery** | Brevo (Sendinblue) | Transactional emails, newsletters |
| **SMS OTP** | Message Central | Phone number verification |
| **Push Notifications** | Firebase Cloud Messaging | Mobile/web push (future) |

**Email Templates Sent:**
- Welcome email on registration
- OTP verification codes
- Password reset links
- Article approval/rejection notifications
- Reporter/Agency approval notifications
- Contact form confirmations
- Event registration confirmations

### 2.5 Specialist Library Deep-Dive

#### AI & Machine Learning
| Library | Version | Purpose |
|---------|---------|---------|
| **@google/generative-ai** | 0.24.1 | Google Gemini AI for article generation |
| **OpenAI** | 6.9.1 | ChatGPT integration (optional) |
| **Cheerio** | 1.1.2 | Web scraping, HTML parsing |
| **Puppeteer** | 24.31.0 | Headless browser automation |

#### Security & Compliance
| Library | Version | Purpose |
|---------|---------|---------|
| **@google-cloud/recaptcha-enterprise** | 6.3.1 | Server-side reCAPTCHA validation |
| **Helmet** | 8.1.0 | Security headers (CSP, XSS protection) |
| **Express Rate Limit** | 7.1.5 | DDoS/brute force protection |
| **Bcrypt.js** | 2.4.3 | Password hashing (10 salt rounds) |

#### Data Processing
| Library | Version | Purpose |
|---------|---------|---------|
| **XLSX** | 0.18.5 | Excel file parsing for bulk uploads |
| **CSV Parser** | 3.2.0 | CSV file parsing |
| **JSON2CSV** | 6.0.0-alpha.2 | Data export to CSV |
| **Sharp** | 0.34.5 | Image resizing, format conversion |

---

## 3. Media Architecture: Image Life-cycle & Optimization

### Upload Flow

```
User Upload → Multer (memory) → Sharp Processing → AWS S3 → Database URL
```

### Image Processing Pipeline

```javascript
// Sharp configuration for image optimization
const processImage = async (buffer, options) => {
  return sharp(buffer)
    .resize(options.width, options.height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
};
```

### S3 Bucket Structure

```
vaas-media-bucket/
├── publications/
│   ├── covers/          # Magazine cover images
│   └── pdfs/            # Full PDF files
├── paparazzi/
│   ├── galleries/       # Event photo galleries
│   └── thumbnails/      # Compressed thumbnails
├── themes/
│   └── screenshots/     # Theme preview images
├── profiles/
│   ├── users/           # User avatars
│   ├── reporters/       # Reporter photos
│   └── agencies/        # Agency logos
├── events/
│   ├── banners/         # Event cover images
│   └── speakers/        # Speaker photos
├── press-packs/
│   └── assets/          # Downloadable brand assets
└── blogs/
    └── featured/        # Blog cover images
```

### Image Size Guidelines

| Content Type | Dimensions | Format | Max Size |
|--------------|------------|--------|----------|
| Cover Images | 1200×630 | JPG/WebP | 500KB |
| Profile Photos | 400×400 | JPG/PNG | 200KB |
| Gallery Images | 1920×1080 | JPG | 1MB |
| Thumbnails | 300×200 | JPG | 50KB |
| PDFs | N/A | PDF | 50MB |

> **⚠️ SVG Warning:** SVG files are NOT supported for social media link previews. Always use raster formats (JPG, PNG, WebP) for cover/featured images.

---

## 4. SEO & AEO Strategy

### Implemented SEO Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Dynamic Meta Tags** | React Helmet Async | Per-page title, description, keywords |
| **JSON-LD Schema** | Structured data in `<script>` | Rich snippets in search results |
| **Open Graph Tags** | `og:` meta tags | Facebook, LinkedIn, WhatsApp previews |
| **Twitter Cards** | `twitter:` meta tags | Twitter/X previews |
| **Canonical URLs** | `<link rel="canonical">` | Duplicate content prevention |
| **Sitemap.xml** | Auto-generated | Search engine crawling |
| **Robots.txt** | Static file | Crawler directives |

### Bot Detection for Link Previews

```javascript
// server.js - Bot detection middleware
const isBotLike = /bot|crawler|spider|facebookexternalhit|linkedin|twitterbot|whatsapp|slack|discord|pinterest|googlebot|bingbot|applebot|telegram/i.test(userAgent);
```

### Meta Tag Generation

```javascript
// metaTags.js - Dynamic metadata for social sharing
const getMetaData = async (route, idOrSlug) => {
  // Fetch content from database
  // Generate HTML with Open Graph and Twitter Card tags
  // Return complete HTML document for bots
};
```

### What's NOT Included

- ❌ Google News integration
- ❌ AMP pages
- ❌ hreflang tags (single language content)

### Sitemap Automation

The `seo-automation` PM2 process automatically regenerates `sitemap.xml` when:
- New content is created (articles, events, publications, etc.)
- Content is updated
- Content is deleted

---

## 5. Infrastructure & Global Hosting

### VPS Specifications

| Component | Specification |
|-----------|---------------|
| **Provider** | VPS Hosting |
| **OS** | Ubuntu 22.04 LTS |
| **RAM** | 4GB+ recommended |
| **Storage** | 50GB+ SSD |
| **CPU** | 2+ vCPUs |
| **Bandwidth** | Unlimited |

### Network Architecture

```
Internet
    │
    ▼
DNS (vaas.solutions → VPS IP)
    │
    ▼
Nginx (:443 SSL, :80 redirect)
    │
    ├── /api/* → localhost:3000 (Node.js backend)
    ├── /api/translation/* → localhost:5005 (Python translator)
    └── /* → /var/www/news-marketplace/dist (React static files)
```

### Port Allocation

| Port | Service | Description |
|------|---------|-------------|
| 80 | Nginx | HTTP (redirects to HTTPS) |
| 443 | Nginx | HTTPS |
| 3000 | Node.js | Backend API |
| 5005 | Python | Translation service |
| 5432 | PostgreSQL | Database (local only) |
| 6379 | Redis | Cache (cloud hosted) |

---

## 6. Project Structure: Complete Architectural Registry

### Directory Structure

```
News_MarketPlace/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── src/
│   │   ├── config/            # Database, Redis configuration
│   │   ├── controllers/       # Business logic (50 files)
│   │   ├── models/            # Sequelize models (48 files)
│   │   ├── routes/            # API route definitions (52 files)
│   │   ├── middleware/        # Auth, validation middleware
│   │   ├── services/          # External service integrations
│   │   └── utils/             # Helper functions, metaTags
│   ├── migrations/            # Database migrations
│   ├── uploads/               # Temporary file uploads
│   └── tests/                 # Jest test files
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application, routing
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Global styles, design system
│   │   ├── pages/             # Page components (67 files)
│   │   ├── components/        # Reusable components
│   │   │   ├── admin/         # Admin panel components
│   │   │   ├── common/        # Shared components (Icon, etc.)
│   │   │   └── home/          # Homepage sections
│   │   ├── contexts/          # React contexts (Auth, Theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions
│   │   └── locales/           # Translation files
│   ├── public/
│   │   ├── sitemap.xml        # Auto-generated sitemap
│   │   ├── robots.txt         # Crawler directives
│   │   └── assets/            # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
├── VaaS_Solutions_Comprehensive_Document.md
└── VaaS_Technical_Document.md (this file)
```

### 6.1 Backend Controller Registry

| Controller | File | Purpose |
|------------|------|---------|
| adminAuthController | adminAuthController.js | Admin login, logout, session |
| adminAwardCreationController | adminAwardCreationController.js | Award CRUD operations |
| adminEventCreationController | adminEventCreationController.js | Event CRUD operations |
| adminPaparazziCreationsController | adminPaparazziCreationsController.js | Paparazzi CRUD operations |
| adminPressPackController | adminPressPackController.js | Press pack management |
| adminPressReleaseController | adminPressReleaseController.js | Press release management |
| adminPublicationManagementController | adminPublicationManagementController.js | Publication CRUD operations |
| adminRealEstateController | adminRealEstateController.js | Real estate CRUD operations |
| adminRealEstateProfessionalController | adminRealEstateProfessionalController.js | RE professional management |
| affiliateEnquiryController | affiliateEnquiryController.js | Affiliate program enquiries |
| agencyController | agencyController.js | Agency registration, approval |
| aiGeneratedArticleController | aiGeneratedArticleController.js | AI article generation (Gemini) |
| articleSubmissionController | articleSubmissionController.js | User article submissions |
| authController | authController.js | User authentication |
| awardController | awardController.js | Public award display |
| awardSubmissionController | awardSubmissionController.js | Award nominations |
| blogController | blogController.js | Blog CRUD operations |
| careerController | careerController.js | Job listings, applications |
| cookieController | cookieController.js | Cookie consent management |
| eventApplicationsController | eventApplicationsController.js | Event registrations |
| eventController | eventController.js | Event display and management |
| eventDisclaimerController | eventDisclaimerController.js | Event legal disclaimers |
| eventEnquiryController | eventEnquiryController.js | Event enquiry forms |
| eventRegistrationController | eventRegistrationController.js | Event sign-ups |
| groupController | groupController.js | Categories, tags management |
| notificationController | notificationController.js | User notifications |
| orderController | orderController.js | Order processing |
| otpController | otpController.js | OTP generation, verification |
| paparazziController | paparazziController.js | Paparazzi galleries |
| paparazziOrderController | paparazziOrderController.js | Photo purchase orders |
| podcasterController | podcasterController.js | Podcaster profiles |
| powerlistController | powerlistController.js | Power list management |
| powerlistNominationController | powerlistNominationController.js | Nomination handling |
| powerlistNominationSubmissionController | powerlistNominationSubmissionController.js | User nominations |
| pressPackController | pressPackController.js | Press pack display |
| pressPackOrderController | pressPackOrderController.js | Press pack orders |
| publicationController | publicationController.js | Publication management |
| publishedWorkController | publishedWorkController.js | Published works |
| radioController | radioController.js | Radio station management |
| radioOrderController | radioOrderController.js | Radio advertising orders |
| realEstateController | realEstateController.js | Property listings |
| realEstateOrderController | realEstateOrderController.js | Real estate enquiries |
| realEstateProfessionalController | realEstateProfessionalController.js | RE professional profiles |
| reporterController | reporterController.js | Reporter registration, approval |
| rolePermissionController | rolePermissionController.js | Admin roles and permissions |
| themeController | themeController.js | Theme marketplace |
| themeOrderController | themeOrderController.js | Theme purchase orders |
| ticketController | ticketController.js | Support tickets |
| translationController | translationController.js | Translation proxy |
| websiteController | websiteController.js | Website submissions |

### 6.2 Backend Route Registry

| Route File | Base Path | Description |
|------------|-----------|-------------|
| auth.js | `/api/auth` | User authentication |
| adminAuth.js | `/api/admin/auth` | Admin authentication |
| contact.js | `/api/contact` | Contact form submissions |
| groups.js | `/api/groups` | Categories and tags |
| publications.js | `/api/publications` | Publication endpoints |
| podcasters.js | `/api/podcasters` | Podcaster endpoints |
| radios.js | `/api/radios` | Radio station endpoints |
| paparazzi.js | `/api/paparazzi` | Paparazzi endpoints |
| themes.js | `/api/themes` | Theme marketplace |
| events.js | `/api/events` | Event endpoints |
| powerlist.js | `/api/powerlist` | Power list endpoints |
| awards.js | `/api/awards` | Award endpoints |
| blogs.js | `/api/blogs` | Blog endpoints |
| careers.js | `/api/careers` | Career endpoints |
| pressPacks.js | `/api/press-packs` | Press pack endpoints |
| realEstates.js | `/api/real-estates` | Real estate endpoints |
| agencies.js | `/api/agencies` | Agency endpoints |
| reporters.js | `/api/reporters` | Reporter endpoints |
| articleSubmissions.js | `/api/article-submissions` | Article submission |
| aiGeneratedArticles.js | `/api/ai-generated-articles` | AI articles |
| otp.js | `/api/otp` | OTP verification |
| translations.js | `/api/translations` | Translation service |
| rolePermissions.js | `/api/admin/role-permissions` | Admin permissions |

### 6.3 Data Model Registry

| Model | File | Key Fields |
|-------|------|------------|
| Admin | Admin.js | id, email, password, role, first_name, last_name |
| User | User.js | id, email, password, name, phone, verified |
| Agency | Agency.js | id, name, email, gstin, pan_card, status |
| Reporter | Reporter.js | id, user_id, bio, portfolio_url, status |
| Publication | Publication.js | id, title, slug, cover_image, pdf_url, category |
| Podcaster | Podcaster.js | id, name, platform, category, episodes |
| Radio | Radio.js | id, station_name, frequency, region, stream_url |
| Paparazzi | Paparazzi.js | id, event_name, photos, photographer, price |
| Theme | Theme.js | id, platform, handle, followers, niche, price |
| Event | Event.js | id, title, date, location, description |
| Powerlist | Powerlist.js | id, title, category, year, nominations |
| Award | Award.js | id, title, category, deadline, criteria |
| Blog | Blog.js | id, title, slug, content, author, status |
| Career | Career.js | id, title, department, location, type |
| PressPack | PressPack.js | id, title, assets, description |
| RealEstate | RealEstate.js | id, title, price, location, type, images |
| RealEstateProfessional | RealEstateProfessional.js | id, name, specialty, experience |
| ArticleSubmission | ArticleSubmission.js | id, user_id, title, content, status |
| AiGeneratedArticle | AiGeneratedArticle.js | id, user_id, prompt, content |
| Group | Group.js | id, name, slug, parent_id, type |
| Order | Order.js | id, user_id, type, amount, status |
| Website | Website.js | id, url, category, description, status |

### 6.4 Frontend Page Registry

| Page Component | Route | Description |
|----------------|-------|-------------|
| Home.jsx | `/` | Landing page |
| AboutUs.jsx | `/about` | Company information |
| ContactUs.jsx | `/contact` | Contact form |
| FAQ.jsx | `/faq` | Frequently asked questions |
| TermsAndConditions.jsx | `/terms-and-conditions` | Legal terms |
| PrivacyPolicy.jsx | `/privacy-policy` | Privacy policy |
| CookiePolicy.jsx | `/cookie-policy` | Cookie usage |
| PublicationsPage.jsx | `/publications` | Magazine listing |
| PublicationDetailPage.jsx | `/publications/:id` | Magazine Flipbook viewer |
| PodcastersList.jsx | `/podcasters` | Podcaster directory |
| PodcasterDetail.jsx | `/podcasters/:id` | Podcaster profile |
| Radio.jsx | `/radio` | Radio stations listing |
| RadioDetails.jsx | `/radio/:id` | Radio station detail |
| Paparazzi.jsx | `/paparazzi` | Photo galleries |
| PaparazziDetailPage.jsx | `/paparazzi/:id` | Gallery detail |
| ThemesPage.jsx | `/themes` | Theme marketplace |
| ThemeDetailPage.jsx | `/themes/:id` | Theme detail |
| EventsPage.jsx | `/events` | Events listing |
| EventDetailPage.jsx | `/events/:id` | Event detail |
| PowerlistPage.jsx | `/power-lists` | Power lists |
| PowerlistDetailPage.jsx | `/power-lists/:id` | Power list detail |
| AwardsPage.jsx | `/awards` | Awards listing |
| AwardDetailPage.jsx | `/awards/:id` | Award detail |
| BlogListingPage.jsx | `/blogs` | Blog listing |
| BlogDetailPage.jsx | `/blogs/:id` | Blog article |
| CareersPage.jsx | `/careers` | Job listings |
| CareerDetailPage.jsx | `/careers/:id` | Job detail |
| PressPacksPage.jsx | `/press-packs` | Press packs |
| PressPackDetailPage.jsx | `/press-packs/:id` | Press pack detail |
| RealEstateList.jsx | `/real-estate` | Property listings |
| RealEstateDetail.jsx | `/real-estate/:id` | Property detail |
| ArticleSubmissionPage.jsx | `/submit-article` | Article submission form |
| AiArticleQuestionnairePage.jsx | `/ai-article-questionnaire` | AI article generator |
| ReporterRegistrationPage.jsx | `/reporter-registration` | Reporter sign-up |
| AgencyRegistrationPage.jsx | `/agency-registration` | Agency sign-up |
| UserProfile.jsx | `/profile` | User dashboard |
| OrdersDeliveredPage.jsx | `/orders-delivered` | Order history |

---

## 7. Prerequisites & Requirements

### 7.1 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 2GB | 4GB+ |
| **CPU** | 1 vCPU | 2+ vCPUs |
| **Storage** | 20GB SSD | 50GB+ SSD |
| **OS** | Ubuntu 20.04 | Ubuntu 22.04 LTS |
| **Node.js** | 18.x LTS | 20.x LTS |
| **Python** | 3.9+ | 3.11+ |

### 7.2 Required Software

```bash
# Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Python 3
sudo apt update
sudo apt install python3 python3-pip python3-venv

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Nginx
sudo apt install nginx

# PM2
npm install -g pm2

# Git
sudo apt install git
```

### 7.3 Required Accounts

| Service | Account | Purpose |
|---------|---------|---------|
| **AWS** | `menastories71@gmail.com` | S3 storage |
| **Brevo** | `menastories71@gmail.com` | Email delivery |
| **Message Central** | `advocatevandan28@gmail.com` | SMS OTP |
| **Google Cloud** | `menastories71@gmail.com` | reCAPTCHA, Gemini AI |
| **Redis Cloud** | `menastories71@gmail.com` | Caching |

---

## 8. Complete Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url> News_MarketPlace
cd News_MarketPlace
```

### Step 2: Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your local settings

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install

# Start development server
npm run dev
```

### Step 4: Translation Service (Optional)

```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: .\venv\Scripts\activate  # Windows

pip install -r requirements.txt
python translator.py
```

### Step 5: Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Translation:** http://localhost:5005

---

## 9. Environment Configuration

### Backend `.env` Template

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vaas_solutions
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud:
REDIS_URL=redis://default:password@host:port

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Cookie
COOKIE_SECRET=your_cookie_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=vaas-media-bucket

# Brevo (Email)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@vaas.solutions
BREVO_SENDER_NAME=VaaS Solutions

# Message Central (SMS)
MSG_CENTRAL_AUTH_TOKEN=your_auth_token
MSG_CENTRAL_CUSTOMER_ID=your_customer_id

# Google Services
GOOGLE_RECAPTCHA_SECRET=your_recaptcha_secret
GOOGLE_API_KEY=your_gemini_api_key
```

### Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 10. Database Setup

### Remote PostgreSQL Connection

VaaS Solutions uses a **remote PostgreSQL database** hosted on a VPS. No local PostgreSQL installation required.

### Connection Configuration

Configure the database connection in your `.env` file:

```env
# Remote Database Configuration
DB_HOST=72.60.108.85
DB_PORT=5432
DB_NAME=newsmarketplace
DB_USER=newsmarketplace
DB_PASSWORD=your_database_password
```

### Test Connection

```bash
# Test remote connection (requires psql client)
psql -h 72.60.108.85 -U newsmarketplace -d newsmarketplace

# Or use the application
cd backend
npm run migrate
```

### Run Migrations

```bash
cd backend

# Run all migrations
npm run migrate

# Or run specific migration
node run_specific_migration.js 001
```

### Database Schema Overview

The database uses Sequelize ORM with the following key tables:

- `admins` — Admin users with roles
- `users` — Regular users
- `agencies` — Registered agencies
- `reporters` — Registered reporters
- `publications` — Digital magazines
- `podcasters` — Podcast profiles
- `radios` — Radio stations
- `paparazzi` — Photo galleries
- `themes` — Social media themes
- `events` — Event listings
- `powerlists` — Power list rankings
- `awards` — Award programs
- `blogs` — Blog articles
- `careers` — Job listings
- `press_packs` — Press materials
- `real_estates` — Property listings
- `groups` — Categories and tags
- `orders` — All order types
- `article_submissions` — User articles
- `ai_generated_articles` — AI content

---

## 11. Backend API Reference

### Authentication Endpoints

```
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password  # Password reset confirm

POST   /api/admin/auth/login     # Admin login
POST   /api/admin/auth/logout    # Admin logout
GET    /api/admin/auth/me        # Get current admin
```

### Content Endpoints (Public)

```
GET    /api/publications         # List publications
GET    /api/publications/:id     # Get publication detail
GET    /api/podcasters           # List podcasters
GET    /api/podcasters/:id       # Get podcaster detail
GET    /api/radios               # List radio stations
GET    /api/radios/:id           # Get radio detail
GET    /api/paparazzi            # List galleries
GET    /api/paparazzi/:id        # Get gallery detail
GET    /api/themes               # List themes
GET    /api/themes/:id           # Get theme detail
GET    /api/events               # List events
GET    /api/events/:id           # Get event detail
GET    /api/powerlist            # List power lists
GET    /api/powerlist/:id        # Get power list detail
GET    /api/awards               # List awards
GET    /api/awards/:id           # Get award detail
GET    /api/blogs                # List blogs
GET    /api/blogs/:id            # Get blog detail
GET    /api/careers              # List careers
GET    /api/careers/:id          # Get career detail
GET    /api/press-packs          # List press packs
GET    /api/press-packs/:id      # Get press pack detail
```

### Submission Endpoints (Authenticated)

```
POST   /api/article-submissions        # Submit article
POST   /api/ai-generated-articles      # Generate AI article
POST   /api/agencies                   # Agency registration
POST   /api/reporters                  # Reporter registration
POST   /api/themes                     # Theme submission
POST   /api/paparazzi                  # Paparazzi submission
POST   /api/award-submissions          # Award nomination
POST   /api/event-applications         # Event registration
```

### Admin Endpoints

```
# All prefixed with /api/admin/

# Article Management
GET    /api/admin/article-submissions
PUT    /api/admin/article-submissions/:id/approve
PUT    /api/admin/article-submissions/:id/reject

# Publication Management
GET    /api/admin/publication-management
POST   /api/admin/publication-management
PUT    /api/admin/publication-management/:id
DELETE /api/admin/publication-management/:id

# Similar CRUD for all modules...
```

### OTP Endpoints

```
POST   /api/otp/send             # Send OTP
POST   /api/otp/verify           # Verify OTP
POST   /api/otp/resend           # Resend OTP
```

### Translation Endpoint

```
POST   /api/translations/translate/batch   # Batch translation
```

---

## 12. Frontend Architecture

### Routing Structure

```jsx
// App.jsx - Main routing configuration
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<AboutUs />} />
  <Route path="/contact" element={<ContactUs />} />
  
  {/* Content Pages */}
  <Route path="/publications" element={<PublicationsPage />} />
  <Route path="/publications/:id" element={<PublicationDetailPage />} />
  
  {/* Protected Routes */}
  <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
  <Route path="/submit-article" element={<ProtectedRoute><ArticleSubmissionPage /></ProtectedRoute>} />
  
  {/* Admin Routes */}
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin/*" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>} />
</Routes>
```

### Component Architecture

```
components/
├── common/
│   ├── Icon.jsx           # Unified icon component
│   ├── Header.jsx         # Site header with navigation
│   ├── Footer.jsx         # Site footer
│   ├── Loading.jsx        # Loading spinner
│   ├── ShareMenu.jsx      # Social sharing component
│   └── Pagination.jsx     # Pagination component
├── home/
│   ├── HeroSection.jsx    # Homepage hero
│   ├── FeaturedSection.jsx
│   └── StatsSection.jsx
├── admin/
│   ├── Sidebar.jsx        # Admin navigation (26 modules)
│   ├── Dashboard.jsx      # Admin dashboard
│   └── [ModuleName]Management.jsx
└── forms/
    ├── AuthModal.jsx      # Login/Register modal
    ├── ContactForm.jsx
    └── SubmissionForm.jsx
```

### State Management

- **Context API** for global state (Auth, Theme)
- **Local state** for component-specific data
- **React Query** patterns for API caching (manual implementation)

### API Service Layer

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Request interceptor for auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 13. Authentication & Security

### User Authentication Flow

```
1. User submits credentials (email + password)
2. Backend validates credentials
3. Backend generates JWT token
4. Token stored in httpOnly cookie + localStorage
5. Subsequent requests include token in Authorization header
6. Backend middleware validates token on protected routes
```

### Admin Authentication Flow

```
1. Admin accesses /admin/login
2. Submits credentials (separate from user DB)
3. Backend validates against admins table
4. JWT token with admin role generated
5. Admin middleware checks role on admin routes
```

### Password Security

```javascript
// Bcrypt hashing (10 salt rounds)
const hashedPassword = await bcrypt.hash(password, 10);

// Password comparison
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Rate Limiting

```javascript
// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests per window
});

// Admin auth rate limiter (stricter)
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200                    // 200 attempts per window
});
```

### Security Headers (Helmet)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"]
    }
  }
}));
```

### reCAPTCHA Integration

- **Frontend:** `react-google-recaptcha` component on forms
- **Backend:** `@google-cloud/recaptcha-enterprise` server-side validation
- **Protected forms:** Login, Register, Contact, Submissions

---

## 14. VPS Hosting & Deployment

### Server User

All VPS operations are performed under the **`deploy`** user:

```bash
# Switch to deploy user
su - deploy

# Now you're in: /home/deploy
# Navigate to project
cd /var/www/news-marketplace
```

### Initial Server Setup (as root)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Create deploy user (if not exists)
sudo adduser deploy
sudo usermod -aG sudo deploy

# Install Node.js via nvm (as deploy user)
su - deploy
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2 globally
npm install -g pm2

# Install Python and pip
sudo apt install -y python3 python3-pip python3-venv
```

### Application Deployment (as deploy user)

```bash
# Switch to deploy user
su - deploy

# Create application directory
sudo mkdir -p /var/www/news-marketplace
sudo chown -R deploy:deploy /var/www/news-marketplace

# Clone repository
cd /var/www/news-marketplace
git clone <repository-url> .

# Backend setup
cd backend
npm install --production
cp .env.local .env
nano .env  # Edit with production values

# Frontend build
cd ../frontend
npm install
npm run build
```

### Directory Structure on Server

```
/var/www/news-marketplace/
├── backend/
│   ├── server.js
│   ├── node_modules/
│   ├── src/
│   └── .env
├── frontend/
│   ├── dist/          # Production build
│   └── src/
└── translator.py
```

---

## 15. Nginx Configuration (Definitive Setup)

### Configuration File Locations

| Environment | Path | Description |
|-------------|------|-------------|
| **VPS Production** | `/etc/nginx/conf.d/vaas.solutions.conf` | Main server configuration |
| **Local Reference** | `nginx_share_config.conf` | Local copy in project root |

### Edit Configuration

```bash
# Edit production Nginx configuration
sudo nano /etc/nginx/conf.d/vaas.solutions.conf
```

### Production Configuration (vaas.solutions.conf)

The configuration file is also available locally at: **`nginx_share_config.conf`** in the project root.

```nginx
###############################
# HTTP → HTTPS Redirect
###############################
server {
    listen 80;
    server_name vaas.solutions www.vaas.solutions;
    return 301 https://$host$request_uri;
}

###############################
# HTTPS Server
###############################
server {
    listen 443 ssl http2;
    server_name vaas.solutions www.vaas.solutions;

    client_max_body_size 100M;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/vaas.solutions/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vaas.solutions/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend Root
    root /var/www/news-marketplace/dist;
    index index.html;

    # ==========================
    # 1. SOCIAL MEDIA BOT PROXY (LinkedIn Fix)
    # ==========================
    location ~* ^/(publications|events|blog|blogs|careers|themes|power-lists|paparazzi|awards|real-estate-professionals|radio|podcasters|press-packs|published-works) {
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Range ""; 
        proxy_set_header If-Range "";

        # Refined bot detection to avoid matching normal browsers (like AppleWebKit/Chrome)
        if ($http_user_agent ~* "linkedin|facebookexternalhit|twitterbot|whatsapp|googlebot|bingbot|applebot|slackbot|discordbot|telegrambot|bot|spider|crawler") {
            proxy_pass http://127.0.0.1:3000;
            add_header X-Vaas-Bot-Proxy "Active";
            break;
        }

        # For regular users, serve the React app
        try_files $uri $uri/ /index.html;
    }

    # ==========================
    # 2. TRANSLATION SERVICE (Port 5005)
    # ==========================
    location ^~ /api/translation {
        # This matches both /api/translation and /api/translation/
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Ensure 404s and errors from Flask are passed through correctly
        proxy_intercept_errors off;
    }

    # ==========================
    # 3. MAIN API PROXY (Port 3000)
    # ==========================
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # ==========================
    # 4. GENERAL SPA ROUTING
    # ==========================
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ==========================
    # 5. STATIC ASSETS CACHE
    # ==========================
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    access_log /var/log/nginx/news-marketplace.access.log;
    error_log /var/log/nginx/news-marketplace.error.log;
}
```

### Key Configuration Sections

| Section | Purpose |
|---------|---------|
| **Social Media Bot Proxy** | Detects crawlers (LinkedIn, Facebook, Twitter, etc.) and proxies to Node.js for dynamic meta tags |
| **Translation Service** | Routes `/api/translation/*` to Python Flask on port 5005 |
| **Main API Proxy** | Routes `/api/*` to Node.js backend on port 3000 |
| **SPA Routing** | Fallback to `index.html` for React Router |
| **Static Assets Cache** | 7-day cache for CSS, JS, images, fonts |

### Test and Reload Configuration

```bash
# Test configuration syntax
sudo nginx -t

# Reload Nginx (zero-downtime)
sudo systemctl reload nginx

# Full restart (if needed)
sudo systemctl restart nginx
```

### View Logs

```bash
# Access log
sudo tail -f /var/log/nginx/news-marketplace.access.log

# Error log
sudo tail -f /var/log/nginx/news-marketplace.error.log
```

---

## 16. SSL Certificate Setup

### Certbot Installation

```bash
sudo apt install certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d vaas.solutions -d www.vaas.solutions
```

### Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Cron job (auto-created by certbot)
# /etc/cron.d/certbot
0 */12 * * * root certbot renew --quiet
```

---

## 17. PM2 Process Management

> **Important:** All PM2 commands run as the `deploy` user.

```bash
# First, switch to deploy user
su - deploy
cd /var/www/news-marketplace
```

### Start Backend Process

```bash
cd /var/www/news-marketplace/backend
pm2 start server.js --name news-marketplace-backend
```

### Start Translation Service

```bash
cd /var/www/news-marketplace/backend
pm2 start translator.py --name translator --interpreter python3
```

### Start SEO Automation

```bash
pm2 start seo-automation.js --name seo-automation
```

### PM2 Commands Reference

```bash
# List all processes
pm2 list

# View process logs
pm2 logs news-marketplace-backend
pm2 logs translator
pm2 logs seo-automation

# Restart processes
pm2 restart news-marketplace-backend
pm2 restart translator
pm2 restart all

# Stop processes
pm2 stop news-marketplace-backend
pm2 stop all

# Delete process
pm2 delete news-marketplace-backend

# Save current process list
pm2 save

# Setup startup script
pm2 startup

# Monitor all processes
pm2 monit
```

### Ecosystem File (Optional)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'news-marketplace-backend',
      script: 'server.js',
      cwd: '/var/www/news-marketplace/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'translator',
      script: 'translator.py',
      cwd: '/var/www/news-marketplace/backend',
      interpreter: 'python3',
      autorestart: true
    },
    {
      name: 'seo-automation',
      script: 'seo-automation.js',
      cwd: '/var/www/news-marketplace/backend',
      autorestart: true
    }
  ]
};
```

```bash
# Start with ecosystem file
pm2 start ecosystem.config.js
```

---

## 18. Nginx Frontend Deployment

### Build Frontend

```bash
cd /var/www/news-marketplace/frontend
npm run build
```

### Verify Build

```bash
ls -la dist/
# Should contain:
# - index.html
# - assets/
# - sitemap.xml
# - robots.txt
```

### Update Nginx (if needed)

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Zero-Downtime Deployment

```bash
# Build in temporary directory
npm run build

# Atomic swap
mv dist dist.old
mv dist.new dist

# Reload Nginx
sudo systemctl reload nginx

# Clean up
rm -rf dist.old
```

---

## 19. CI/CD Pipeline & Automated Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/news-marketplace
            git pull origin main
            cd backend && npm install --production
            cd ../frontend && npm install && npm run build
            pm2 restart news-marketplace-backend
            sudo systemctl reload nginx
```

### Manual Deployment Script

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

cd /var/www/news-marketplace

# Pull latest code
git pull origin main

# Backend
cd backend
npm install --production
pm2 restart news-marketplace-backend

# Frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

---

## 20. Third-Party Services

### AWS S3 Configuration

```javascript
// s3Config.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (buffer, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  });
  
  await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
};
```

### Brevo Email Configuration

```javascript
// emailService.js
const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { 
    email: process.env.BREVO_SENDER_EMAIL, 
    name: process.env.BREVO_SENDER_NAME 
  };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};
```

### Message Central SMS

```javascript
// smsService.js
const axios = require('axios');

const sendOTP = async (phoneNumber) => {
  const response = await axios.post('https://cpaas.messagecentral.com/verification/v2/verification/send', {
    phoneNumber,
    productId: 'VaaS Solutions'
  }, {
    headers: {
      'authToken': process.env.MSG_CENTRAL_AUTH_TOKEN
    }
  });
  
  return response.data;
};
```

### Google Gemini AI

```javascript
// aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const generateArticle = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};
```

---

## 21. Troubleshooting Guide

### Common Issues

#### 1. Backend Not Starting

```bash
# Check logs
pm2 logs news-marketplace-backend

# Common causes:
# - Missing .env file
# - Database connection failed
# - Port already in use

# Fix port conflict
lsof -i :3000
kill -9 <PID>

# Restart
pm2 restart news-marketplace-backend
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U vaas_user -d vaas_solutions -h localhost

# Common fixes:
# - pg_hba.conf authentication method
# - Database not created
# - Wrong credentials in .env
```

#### 3. Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Common causes:
# - Backend not running
# - Wrong proxy_pass port
# - SELinux blocking connection (CentOS)
```

#### 4. SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

#### 5. Translation Service Not Working

```bash
# Check translator process
pm2 logs translator

# Common causes:
# - Python dependencies missing
# - Port 5005 blocked
# - Rate limit hit on translation API
```

### Debug Commands

```bash
# System resources
htop
df -h
free -m

# Network
netstat -tlnp
ss -tlnp

# Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
pm2 logs --lines 100

# Process check
ps aux | grep node
ps aux | grep python
```

---

## 22. Quick Reference Registry

### VPS Server Access

```bash
# SSH into server
ssh root@72.60.108.85

# Switch to deploy user (required for all operations)
su - deploy

# Navigate to project
cd /var/www/news-marketplace
```

### Essential URLs

| Resource | URL |
|----------|-----|
| Production Site | https://vaas.solutions |
| Admin Panel | https://vaas.solutions/admin/login |
| API Base | https://vaas.solutions/api |

### PM2 Processes

| Process Name | Script | Port |
|--------------|--------|------|
| news-marketplace-backend | server.js | 3000 |
| translator | translator.py | 5005 |
| seo-automation | seo-automation.js | N/A |

### Service Accounts

| Service | Email |
|---------|-------|
| AWS S3 | menastories71@gmail.com |
| Brevo | menastories71@gmail.com |
| Message Central | advocatevandan28@gmail.com |
| Google Cloud | menastories71@gmail.com |
| Redis Cloud | menastories71@gmail.com |

### Key File Paths (VPS)

| Path | Description |
|------|-------------|
| /var/www/news-marketplace | Application root |
| /var/www/news-marketplace/backend | Node.js backend |
| /var/www/news-marketplace/frontend/dist | React production build |
| /etc/nginx/conf.d | Nginx configurations |
| /var/log/nginx | Nginx logs |
| /var/backups/news-marketplace | Database backups |

---

## 23. Performance Optimization & Scale

### Current Optimizations

| Optimization | Implementation |
|--------------|----------------|
| Gzip compression | Nginx configuration |
| Static asset caching | 1-year cache headers |
| Image optimization | Sharp processing on upload |
| Database indexing | Sequelize model indexes |
| Redis caching | API response caching |
| CDN-ready | S3 with public-read |

### Scaling Strategies

#### Horizontal Scaling (Future)

```javascript
// ecosystem.config.js - Cluster mode
{
  name: 'news-marketplace-backend',
  script: 'server.js',
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'
}
```

#### Database Optimization

```sql
-- Common indexes
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_users_email ON users(email);
```

#### Redis Caching Strategy

```javascript
// Implement caching for frequently accessed data
const getCachedData = async (key, fetchFn, ttl = 3600) => {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
};
```

### Monitoring Recommendations

- **PM2 Plus** — Process monitoring dashboard
- **Nginx Amplify** — Nginx performance monitoring
- **Sentry** — Error tracking and alerting
- **UptimeRobot** — Uptime monitoring

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 29, 2026 | Initial technical documentation |

---

*Document maintained by the VaaS Solutions Development Team.*  
*For technical support, contact the development team directly.*
