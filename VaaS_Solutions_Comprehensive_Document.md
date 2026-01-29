# VaaS Solutions Website - Comprehensive Delivery Document

---

## 📋 Document Information

| **Document Title** | VaaS Solutions Website Delivery & Walkthrough |
|-------------------|---------------------------------------------|
| **Version** | 2.0 |
| **Date** | January 29, 2026 |
| **Prepared For** | Management Team & Stakeholders |
| **Website URL** | https://vaas.solutions |

---

> ## ⚠️ IMPORTANT: Deployment Timing Notice
>
> When you perform any action in the Admin Panel that modifies data (Add, Update, or Delete), please be aware of the following:
>
> ### 🕐 Wait Time Required
> - **After making changes, please wait 2-3 minutes** for the changes to fully reflect on the live website
> - **Reason**: Any data modification (Create, Update, Delete) triggers the system to **regenerate the `sitemap.xml` file**. This ensures that search engines always have the most up-to-date links for your content. This regeneration process, combined with the deployment workflow, causes the 1-2 minute wait time.
>
> ### 🔄 What Happens Behind the Scenes
> 1. Your changes are saved to the database
> 2. **The system updates and regenerates the `sitemap.xml`**
> 3. An automated build and deployment process (CI/CD) is triggered
> 4. The updated code is pushed to the production server
> 5. The website may experience **brief downtime (approximately 1 minute)** during this process
>
> ### ⚡ Best Practices
> - **Batch your changes**: If you have multiple updates, make them all before the deployment triggers
> - **Avoid refreshing during deployment**: If the website appears unavailable, wait 1-2 minutes and try again
> - **Schedule major updates**: For bulk content changes, consider doing them during low-traffic hours
>
> 

# 📑 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Part A: Administrator Panel](#part-a-administrator-panel)
   - [A.1 Dashboard](#a1-dashboard)
   - [A.2 Affiliate Enquiries](#a2-affiliate-enquiries)
   - [A.3 Agency Management](#a3-agency-management)
   - [A.4 AI Articles](#a4-ai-articles)
   - [A.5 Article Submissions](#a5-article-submissions)
   - [A.6 Award Submissions](#a6-award-submissions)
   - [A.7 Awards](#a7-awards)
   - [A.8 Blog Management](#a8-blog-management)
   - [A.9 Career Management](#a9-career-management)
   - [A.10 Contact Management](#a10-contact-management)
   - [A.11 Event Enquiries](#a11-event-enquiries)
   - [A.12 Event Management](#a12-event-management)
   - [A.13 Group Management](#a13-group-management)
   - [A.14 Paparazzi Management](#a14-paparazzi-management)
   - [A.15 Podcaster Management](#a15-podcaster-management)
   - [A.16 Power Lists](#a16-power-lists)
   - [A.17 Press Pack Management](#a17-press-pack-management)
   - [A.18 Publications](#a18-publications)
   - [A.19 Published Works Management](#a19-published-works-management)
   - [A.20 Radio Management](#a20-radio-management)
   - [A.21 Real Estate Management](#a21-real-estate-management)
   - [A.22 Reporter Management](#a22-reporter-management)
   - [A.23 Roles & Permissions](#a23-roles-permissions)
   - [A.24 Theme Management](#a24-theme-management)
   - [A.25 User Management](#a25-user-management)
   - [A.26 Website Management](#a26-website-management)
4. [Part B: User-Facing Website](#part-b-user-facing-website)
5. [Appendix: Quick Reference Guide](#appendix-quick-reference-guide)
6. [Part C: Maintenance & FAQs for Common Users](#part-c-maintenance--faqs-for-common-users)
7. [Third Party Tools & Libraries](#7-third-party-tools--libraries)

---

# 1. Executive Summary

## 1.1 Purpose of This Document

This document serves as a comprehensive guide for the **VaaS Solutions (News MarketPlace)** website, providing detailed explanations of all features, functionalities, and processes. It is designed for non-technical stakeholders and management team members who need to understand how the website operates from two primary perspectives:

1.  **Administrator Perspective** - How to manage and control all aspects of the website, including content moderation, user roles, and system configurations.
2.  **User Perspective** - How visitors, content creators (reporters/podcasters), and businesses (agencies/professions) experience and interact with the platform.

## 1.2 Key Highlights

*   **Multi-role Ecosystem**: The website supports a diverse range of roles including Administrators, Reporters, Agencies, Podcasters, Real Estate Professionals, and General Users.
*   **Rich Content Types**: Built to handle complex media including Articles, AI Articles, Podcasts, Events, Power Lists, Press Packs, Real Estate Listings, and Award Competitions.
*   **Multi-language Support**: Fully localized in **6 languages** - English, Arabic (RTL), French, Hindi, Russian, and Chinese.
*   **SEO Optimized**: Comprehensive SEO implementation including dynamic meta tags, structured data schemas, and auto-regenerating sitemaps for maximum search visibility.
*   **Analytics Integration**: Built-in tracking for user engagement and system performance (referenced in Admin Dashboard).
*   **Responsive Design**: Fully responsive interface ensuring a seamless experience across desktop, tablet, and mobile devices.

# 2. System Overview

## 2.1 Architecture Overview

The **VaaS Solutions (News MarketPlace)** platform is architected into two primary portals:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            VaaS Solutions Platform                                                 │
├─────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┤
│                Admin Panel                      │                       User-Facing Website                        │
│                (/admin/*)                       │                             (/)                                  │
├─────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│                                                 │                                                                  │
│ 📊 DASHBOARD                                    │ 🏠 PUBLIC & AUTHENTICATED PAGES                                  │
│ • /admin/dashboard                              │ • / (Homepage)                                                   │
│                                                 │ • /about-us (About Us)                                           │
│ 📝 CONTENT & MANAGEMENT MODULES                 │ • /services-overview (Services)                                  │
│ • /admin/affiliate-enquiries                    │ • /how-it-works (How It Works)                                   │
│ • /admin/agencies                               │ • /blogs (Blog/News)                                             │
│ • /admin/ai-articles                            │ • /contact-us (Contact)                                          │
│ • /admin/article-submissions                    │ • /faq (FAQ)                                                     │
│ • /admin/award-submissions                      │ • /video-tutorials (Tutorials)                                   │
│ • /admin/awards                                 │ • /how-to-guides (Guides)                                        │
│ • /admin/blogs                                  │ • /download-center (Resources)                                   │
│ • /admin/careers                                │ • /orders-delivered (Success Stories)                            │
│ • /admin/contacts                               │                                                                  │
│ • /admin/event-enquiries                        │ 📰 CONTENT LISTINGS                                              │
│ • /admin/events                                 │ • /publications                                                  │
│ • /admin/groups                                 │ • /radio                                                         │
│ • /admin/paparazzi                              │ • /paparazzi                                                     │
│ • /admin/podcasters                             │ • /power-lists                                                   │
│ • /admin/power-lists                            │ • /awards                                                        │
│ • /admin/press-packs                            │ • /themes                                                        │
│ • /admin/publications                           │ • /real-estate-professionals                                     │
│ • /admin/published-works                        │ • /podcasters                                                    │
│ • /admin/radios                                 │ • /careers                                                       │
│ • /admin/real-estates                           │ • /events                                                        │
│ • /admin/reporters                              │                                                                  │
│ • /admin/roles-permissions                      │ 🔐 SUBMISSION & REGISTRATION                                     │
│ • /admin/themes                                 │ • /submit-article                                                │
│ • /admin/users                                  │ • /ai-article-questionnaire                                      │
│ • /admin/websites                               │ • /website-submission                                            │
│                                                 │ • /agency-registration                                           │
│                                                 │ • /reporter-registration                                         │
│                                                 │ • /event-enquiry                                                 │
│                                                 │ • /affiliate-program                                             │
│                                                 │                                                                  │
│                                                 │ 👤 USER DASHBOARD                                                │
│                                                 │ • /dashboard                                                     │
│                                                 │ • /profile                                                       │
│                                                 │ • /reporter-submissions                                          │
│                                                 │                                                                  │
│                                                 │ 🌐 MULTI-LANGUAGE SUPPORT                                        │
│                                                 │ EN | AR | FR | HI | RU | ZH-CN                                   │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

### 2.1.1 Complete Page Reference

Below is a comprehensive list of **all pages** available in the VaaS Solutions platform, categorized by their function.

---

#### 🔐 AUTHENTICATION & USER PAGES

| Page Type | URL | Description |
|-----------|-----|-------------|
| **Admin Login** | `/admin/login` | Secure entry point for platform administrators. |
| **User Login/Register** | *(Modal)* | Accessed via "Sign In / Sign Up" button in header. |
| **User Dashboard** | `/dashboard` | Central hub for logged-in users to access services and saved items. |
| **User Profile** | `/profile` | Profile management settings for registered users. |
| **Reporter Dashboard** | `/reporter-submissions`| Specific dashboard for reporters to track their article submissions. |

---

#### 📰 PUBLIC CONTENT PAGES

| Section | List URL | Detail URL | Description |
|---------|----------|------------|-------------|
| **Blogs** | `/blogs` | `/blog/:id` | News articles, press releases, and blog posts. |
| **Publications** | `/publications` | `/publications/:id` | Digital publications and magazines. |
| **Published Works** | `/published-works` | `/published-works/:id` | Specific works authored by platform users. |
| **Events** | `/events` | `/events/:id` | Upcoming industry events and calendars. |
| **Podcasts** | `/podcasters` | `/podcasters/:id` | Directory of podcasters and their episodes. |
| **Real Estate** | `/real-estate-professionals` | `/real-estate-professionals/:id` | Profiles of real estate professionals. |
| **Awards** | `/awards` | `/awards/:id` | Industry awards and competitions. |
| **Power Lists** | `/power-lists` | `/power-lists/:id` | Curated lists of influential figures/entities. |
| **Paparazzi** | `/paparazzi` | `/paparazzi/:id` | Media gallery and photo submissions. |
| **Radio** | `/radio` | `/radio/:id` | Radio station listings and features. |
| **Themes** | `/themes` | `/themes/:id` | UI/UX themes available for download/viewing. |
| **Careers** | `/careers` | `/careers/:id` | Job listings and career opportunities. |
| **Press Packs** | `/press-packs` | `/press-packs/:id` | Electronic Press Kits (EPKs) for media use. |
| **Success Stories** | `/orders-delivered` | - | Showcase of successful client orders and deliveries. |

---

#### 📝 SUBMISSION & REGISTRATION FORMS

| Form Name | URL | Description |
|-----------|-----|-------------|
| **Article Submission** | `/submit-article` | Form for manual article submission. |
| **AI Article Gen** | `/ai-article-questionnaire`| Tool to generate articles using AI assistance. |
| **Website Submission** | `/website-submission` | Submit a website for listing or review. |
| **Agency Reg** | `/agency-registration` | Registration form for media agencies. |
| **Reporter Reg** | `/reporter-registration` | Registration form for individual reporters. |
| **Event Partnership**| `/event-enquiry` | Enquiry form for media partnerships at events. |
| **Affiliate Program**| `/affiliate-program` | Registration/enquiry for the affiliate program. |
| **Theme Submission** | `/themes/submit` | Submission form for new UI themes. |
| **Paparazzi Submit** | `/paparazzi/submit` | Upload form for new paparazzi media. |


---

#### ℹ️ INFORMATIONAL & SUPPORT PAGES

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Main landing page of the application. |
| **About Us** | `/about-us` | Company overview and mission. |
| **Services** | `/services-overview` | Comprehensive list of services offered. |
| **How It Works** | `/how-it-works` | Step-by-step guide to using the platform. |
| **Video Tutorials** | `/video-tutorials` | Library of video guides for users. |
| **How-To Guides** | `/how-to-guides` | Text-based instructional guides. |
| **Download Center** | `/download-center` | Repository for templates and documents (e.g., PR Questionnaire). |
| **Resource Library** | `/resource-library` | General resources and assets. |
| **Contact Us** | `/contact-us` | General contact form and details. |
| **FAQ** | `/faq` | Frequently Asked Questions. |
| **Media Partners** | `/media-partnerships` | Information on media partnership opportunities. |
| **Brands & People** | `/brands-people` | Information section for brands and individuals. |
| **CSR** | `/csr` | Corporate Social Responsibility initiatives. |

---

#### 📜 LEGAL PAGES

| Page | URL | Description |
|------|-----|-------------|
| **Terms** | `/terms-and-conditions` | Terms of Service. |
| **Privacy** | `/privacy-policy` | Privacy Policy. |
| **Cookies** | `/cookie-policy` | Cookie usage policy. |
| **Refunds** | `/refund-policy` | Refund and cancellation policy. |
| **Trademarks** | `/trademark-policy` | Trademark and logo usage guidelines. |
| **Data Protection**| `/data-protection` | GDPR and data protection standards. |
| **Reselling** | `/reselling-agreement` | Agreement terms for resellers. |
| **Press Guidelines**| `/press-guidelines` | Guidelines for press release distribution. |
| **User Data** | `/data/new/cookies/user` | User cookie data transparency page. |

---

#### 🔧 ADMIN PANEL

The Admin Panel is a comprehensive management suite. All routes are prefixed with `/admin`.

| Module | Management URL | Orders/Creation/Extra URLs |
|--------|----------------|--------------------------|
| **Dashboard** | `/dashboard` | - |
| **Affiliate Enquiries**| `/affiliate-enquiries`| - |
| **Agencies** | `/agencies` | - |
| **AI Articles** | `/ai-articles` | - |
| **Article Submissions**| `/article-submissions`| - |
| **Award Submissions** | `/award-submissions` | - |
| **Awards** | `/awards` | `/award-creation` |
| **Blogs** | `/blogs` | - |
| **Careers** | `/careers` | - |
| **Contacts** | `/contacts` | - |
| **Event Enquiries** | `/event-enquiries` | - |
| **Events** | `/events` | `/event-creation` |
| **Groups** | `/groups` | - |
| **Orders (General)** | `/orders` | - |
| **Paparazzi** | `/paparazzi` | `/paparazzi-orders`<br>`/paparazzi-creation` |
| **Podcasters** | `/podcasters` | - |
| **Power Lists** | `/power-lists` | `/powerlist-orders` |
| **Press Packs** | `/press-packs` | `/press-pack-orders`<br>`/press-pack-creation` |
| **Publications** | `/publications` | `/publication-management` |
| **Published Works** | `/published-works` | - |
| **Radios** | `/radios` | `/radio-orders` |
| **Real Estate** | `/real-estates` | `/real-estate-orders`<br>`/real-estate-creation` |
| **Reporters** | `/reporters` | - |
| **Roles** | `/roles-permissions` | - |
| **Themes** | `/themes` | `/theme-orders` |
| **Users** | `/users` | - |
| **Websites** | `/websites` | - |

## 2.2 User Roles & Access Levels

The platform employs a robust role-based access control (RBAC) system.

### 2.2.1 Administrative Roles
Defined and managed via `/admin/roles-permissions`.

*   **Master Admin**: Full system access, including user management (`/admin/users`) and role configuration.
*   **Admin**: Standard administrative access to content management modules.
*   **Specific Roles**: Custom roles can be created with granular permissions (Create, Read, Update, Delete) for specific modules (e.g., "Event Manager" with access only to `/admin/events`).

### 2.2.2 User Types
*   **Guest**: Unregistered visitor. Can view public content (Home, About, Blogs, etc.) but cannot submit content or view protected details.
*   **Web User**: Registered generic user. Can access the Dashboard (`/dashboard`), view restricted content, and submit basic enquiries.
*   **Reporter**: A specialized user role `reporter`. Has access to:
    *   **Reporter Dashboard** (`/reporter-submissions`) to track articles.
    *   **Submission Tools**: `/submit-article`, `/ai-article-questionnaire`.
    *   **Registration**: Via `/reporter-registration`.
*   **Agency**: A specialized user role `agency`. Has access to agency-specific features and registration via `/agency-registration`.
*   **Professional**: specialized profiles like Real Estate Professionals or Podcasters, managed via their respective admin modules but interacting through the user portal.

### 2.2.3 Authentication Flow
*   **Admin Auth**: Handled via `AdminAuthContext` and `/admin/login`.
*   **User Auth**: Handled via `AuthContext`.
    *   Users click "Sign In / Sign Up" to open the `AuthModal`.
    *   Supports Login, Registration, and Password Reset.
    *   Protected User Routes are wrapped in `<ProtectedRoute>`.
    *   Protected Admin Routes are wrapped in `<AdminProtectedRoute>`.

---

# Part A: Administrator Panel

The Administrator Panel is the central control hub for managing all aspects of the VaaS Solutions (News MarketPlace) platform. This section provides comprehensive documentation for administrative functions, designed for non-technical users.

---

## A.1 Admin Login & Authentication

### Purpose
The Admin Login page serves as the secure gateway to the administration panel. It ensures that only authorized personnel with valid credentials can access the system's backend.

### Access URL
```
https://vaas.solutions/admin/login
```

### Login Process

1.  **Navigate**: Open your browser and go to `https://vaas.solutions/admin/login`.
2.  **Credentials**: Enter your registered administrator **Email** and **Password**.
3.  **Submit**: Click the "Log In" button.
4.  **Redirect**: Upon successful authentication, you will be redirected to the **Admin Dashboard**.

### Troubleshooting
*   **Invalid Credentials**: Ensure caps lock is off and your email is spelled correctly.
*   **Access Denied**: If you log in but see a permission error, contact a Master Admin to verify your role assignments.

---

## A.2 Admin Dashboard

### Purpose
The Admin Dashboard (`/admin/dashboard`) is the command center, providing real-time insights into platform activity and health.

### Statistics Cards
The dashboard displays 8 key performance indicators (KPIs) in a responsive grid. These metrics provide an instant snapshot of the platform's content and user base:

| Statistic | Icon | Description | Source Data |
|-----------|------|-------------|-------------|
| **Total Blogs** | 📄 Document | Number of blog posts/articles in the system. | Blog Collection |
| **Publications** | 📰 Newspaper | Count of digital publications managed. | Publications Collection |
| **Websites** | 🌐 Globe | Number of external websites listed. | Websites Collection |
| **Podcasters** | 🎙️ Microphone | Registered podcaster profiles. | Podcasters Collection |
| **Reporters** | 👥 User Group | Registered reporter profiles. | Reporters Collection |
| **Real Estates** | 🏠 Home | Real estate listings/profiles. | Real Estates Collection |
| **Users** | 👥 Users | Total registered users (all types). | User Auth Database |
| **Admin Roles** | 🛡️ Shield | Number of defined admin roles. | Roles & Permissions |

### Role & Permissions Information
The dashboard also features personalized cards displaying your session details:
*   **Current Role**: Displays your assigned role (e.g., Master Admin, Editor).
*   **Level**: Your numeric access level (1-10).
*   **Access Indicators**: Visual checks for your broad permissions:
    *   ✅ System Administration
    *   ✅ Content Management
    *   ✅ Editorial Access

---

## A.3 Management Modules Standard Interface

Most management modules (e.g., Agencies, Events, Users) follow a standardized **CRUD (Create, Read, Update, Delete)** interface for consistency.

### Common Features
1.  **Data Table**: Displays records in rows.
2.  **Search/Filter**: Tools to find specific records by name, date, or status.
3.  **Action Buttons**:
    *   ✏️ **Edit**: Modify an existing record.
    *   🗑️ **Delete**: Permanently remove a record (requires confirmation).
    *   👁️ **View**: See full details of a record.
4.  **Pagination**: Navigate through large sets of data.

---
## A.4 Specific Management Modules

Below is the detailed list of all administrative modules accessible from the sidebar.

## A.1 Dashboard

### Route
`/admin/dashboard`

### Overview
The **Admin Dashboard** is the command center of the VaaS Solutions platform. It is the first screen administrators see after logging in. It serves as a unified interface for monitoring system health, tracking key metrics, and accessing quick actions.

### Key Components

*   **Statistics Grid**: A responsive grid of 8 cards displaying real-time counters for:
    *   **Total Blogs**: Number of articles published.
    *   **Publications**: Count of digital magazines.
    *   **Websites**: External website listings.
    *   **Podcasters**: Registered audio creators.
    *   **Reporters**: Accredited journalists.
    *   **Real Estates**: Property listings.
    *   **Users**: Total user base count.
    *   **Admin Roles**: Number of configured system roles.
*   **Role Information Card**: Displays the current user's role (e.g., Master Admin), access level (1-10), and last login timestamp.
*   **Access Rights Display**: Visual indicators (✅/❌) showing the administrator's broad permission scopes:
    *   **System Administration**: Access to sensitive settings.
    *   **Content Management**: Ability to edit/publish content.
    *   **Editorial Access**: Rights to review submissions.
*   **Mobile Responsiveness**: On mobile devices, the sidebar collapses into a hamburger menu, and the layout adjusts to a single-column view for readability.

---

## A.2 Affiliate Enquiries

### Route
`/admin/affiliate-enquiries`

### Purpose
This module serves as the central inbox for managing all interest in the VaaS Affiliate Partnership Program. It allows administrators to track who is applying, contact them, and manage the lifecycle of their enquiry from "New" to "Viewed".

### Data Fields & Columns
The main table displays the following information for each enquiry:

1.  **Name**: The full name of the applicant.
2.  **Email**: The direct contact email address.
3.  **WhatsApp**: A direct link to open a WhatsApp chat with the applicant (using the provided number).
4.  **Referral Code**: The specific code the user is interested in or has applied with. This is crucial for tracking campaign performance.
5.  **Status**: The current state of the enquiry.
    *   **New**: Recently submitted and untouched.
    *   **Viewed**: Opened by an admin.
6.  **Submitted At**: The exact date and time the form was submitted.

### Detailed Actions & Workflows

#### 1. Viewing & Managing Enquiries
*   **Action**: Click the **View** (Eye icon) button on any row.
*   **Result**: 
    *   Opens a detailed view of the enquiry.
    *   **Auto-Update**: If the status was "New", the system *automatically* updates it to "Viewed" to indicate it is being processed.
    *   Admin can copy email addresses or click the WhatsApp link to initiate contact.

#### 2. Filtering & Search
Located above the table, these tools help locate specific records:
*   **Search Bar**: Type a name or email to instantly filter the list.
*   **Status Filter**: Dropdown to show only `New` or `Viewed` enquiries.
*   **Date Range**: Two date pickers ("From" and "To") to find enquiries submitted within a specific period (analytics).
*   **Referral Code Filter**: Type a specific code to see all enquiries related to it.
*   **Clear Filters**: A reset button to instantly remove all active filters and show the full list.

#### 3. Exporting Data (CSV)
*   **Button**: `Download CSV` (Top right).
*   **Options**:
    *   **Download Filtered Data**: Exports only the rows currently visible based on your active search/filters.
    *   **Download All Data**: Exports the entire database of affiliate enquiries.
*   **Use Case**: Use this for offline analysis in Excel or to import leads into a CRM system.

---

## A.3 Agency Management

### Route
`/admin/agencies`

### Purpose
The **Agency Management** module is a critical security and compliance tool. It allows Super Admins and Content Managers to verify the legitimacy of media agencies applying for professional access. Agencies have higher privileges, so rigorous verification is required.

### Data Fields (Detail View)
When you click **View Details** on an agency, you see a comprehensive profile:

#### A. Basic Information
*   **Agency Name**: The trading name of the business.
*   **Legal Entity**: The official registered corporate name.
*   **Owner Name**: The primary individual responsible for the account.
*   **Emails**: Agency Email, Alternate Email, Owner Email.
*   **Location**: Country, City, and Full Address.
*   **Founded Year**: Verification of business longevity.

#### B. Contact & Social
*   **Phone Numbers**: Agency Landline, Mobile, Owner Contact.
*   **Messaging**: WhatsApp Number, Telegram Handle.
*   **Digital Presence**: Website URL, LinkedIn Profile, Instagram Handle, Facebook Page.

#### C. Verification Data
*   **Owner LinkedIn**: Personal profile of the owner (for identity checks).
*   **Owner Nationality**: Passport nationality.
*   **Source**: "How did you hear about us?" data for marketing.

### Detailed Workflow: Verifying an Agency

1.  **Review**: Locate a `Pending` agency in the list and click **View Details**.
2.  **Audit**: Check their Website and LinkedIn to ensure they are a legitimate media entity.
3.  **Action**:
    *   **Approve**: Click `Approve`. The status changes to **Approved**. The agency gain full access to the Publisher Portal.
    *   **Reject**: Click `Reject`. The status changes to **Rejected**. They cannot access professional features.
4.  **Bulk Processing**:
    *   Select multiple agencies using the checkboxes on the left.
    *   Use the **Bulk Actions** dropdown to `Approve Selected` or `Reject Selected` in one go.

### Status Indicators
*   **Pending** (Orange): New application awaiting review.
*   **Approved** (Green): Verified partner with active access.
*   **Rejected** (Red): Denied application.

---

## A.4 AI Articles

### Route
`/admin/ai-articles`

### Purpose
This module acts as the quality control gate for the platform's Generative AI features. It allows administrators to review content generated by the AI before it is finalized or published by the user.

### 1. The AI Article Questionnaire (Input)
Users generate articles by filling out a detailed form (`AiArticleQuestionnaireForm`). This input is what drives the AI generation.

#### **Part 1: About You / The Brand**
*   **Name**: Subject name (person or brand).
*   **Preferred Title**: How they want to be addressed.
*   **Background**: Detailed history or biography (min 5 chars).
*   **Inspiration**: What drives the subject.
*   **Challenges**: Obstacles overcome (min 5 chars).
*   **Unique Perspective**: What distinguishes them from others.
*   **Highlights**: Key achievements or milestones.
*   **Anecdotes**: Personal stories or examples.
*   **Future Vision**: Goals for the future.

#### **Part 2: Article Guidelines**
*   **Goal**: The objective of the article (e.g., "Brand Awareness").
*   **Target Audience**: Who the article is written for.
*   **Message**: The core message to convey.
*   **Key Points**: Specific bullets to include.
*   **SEO Keywords**: Primary terms for search optimization.
*   **Tone**: The desired voice (e.g., "Professional", "Casual").
*   **Social Links**: URLs to social profiles.

#### **Data Integration**
*   **Files**: Users can upload supplementary documents (`.pdf`, `.doc`, etc.) which the AI analyzes for context.
*   **Publication**: Users must select a target publication ID to tailor the style.

### 2. Process Flow: How Requests Work
The system follows a strict request-response lifecycle:

1.  **Submission**:
    *   The user submits the form via `POST /api/ai-generated-articles`.
    *   The backend validates all required fields (e.g., 'Challenges' > 5 chars).
2.  **Generation**:
    *   The server processes the inputs and sends a prompt to the AI Engine.
    *   **Rate Limiting**: If the user exceeds their token quota, a 429 error is returned with a `remainingMinutes` countdown.
3.  **Creation**:
    *   A new record is created in the database with status `Draft` or `Pending`.
    *   The user is redirected to `/ai-article-generation/{id}` to view the result.

### 3. Return Data & usage
When the API returns the generated data, it provides:
*   **Generated HTML**: The full article content formatted with headings and paragraphs.
*   **Metadata**: Story type, user details, and publication info.
*   **Status**:
    *   `Draft`: AI has generated it, but user is still editing.
    *   `Pending`: User has submitted it for your approval.
    *   `Approved`: You have verified it; it is ready to be live.

### 4. Technology Stack
*   **AI Engine**: Google Gemini API
*   **Model**: `gemini-2.0-flash`
*   **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
*   **Format**: The system instructs the AI to return content in strict Markdown format, which is then parsed into HTML for the frontend.

### Detailed Workflow: Reviewing AI Content

1.  **Monitor**: Watch the list for items with status **Pending**.
2.  **Inspect**: Click the **View** (Eye icon) to open the modal.
    *   **Read**: The modal renders the `generated_content` HTML. Check for coherence and safety.
3.  **Decision**:
    *   **Approve**: Click the **Checkmark**. The user is notified and can proceed.
    *   **Reject**: Click the **X**. The status changes to `Rejected`.
    *   **Delete**: Permanently remove bad generations to clean the database.

### Filtering & Export
*   **Story Types**: `Profile`, `Editorial`, `Advertorial`, `Listicle`.
---

## A.5 Article Submissions

### Route
`/admin/article-submissions`

### Purpose
The **Article Submissions** module serves as the editorial gatekeeper for the platform. It allows administrators to review, edit, and adjudicate content submitted by users, reporters, and agencies before it reaches the public eye. The interface is designed to facilitate a quick yet thorough editorial review process.

### Visual Indicators & Statuses
The table uses color-coded badges to instantly convey the state of a submission:
*   **APPROVED** (Green background): Content is live or queued for publication.
*   **REJECTED** (Red background): Content failed editorial standards.
*   **PENDING** (Orange background): Awaiting admin review.

### Data Fields
#### 1. Submission Details (View Modal)
When an admin clicks the **View** (Eye icon) button, a detailed modal appears with the following read-only data:
*   **Article Metadata**:
    *   **ID**: Unique system identifier.
    *   **Status**: Current editorial status.
    *   **Tentative Publish Date**: The user's requested date.
    *   **Timestamps**: `Created At` and `Updated At`.
*   **Content**:
    *   **Title**: The headline (Max 12 words).
    *   **Subtitle**: Secondary hook (Optional).
    *   **By Line**: Credited author.
    *   **Article Text**: Displayed in a pre-wrapped text block to preserve formatting.
*   **Attribution**:
    *   **Publication**: The specific publication outlet selected by the user.
    *   **User**: Name and Email of the submitter.
*   **Visual Assets**:
    *   **Primary Image**: Main visual.
    *   **Secondary Image**: Supporting visual.
*   **Digital Footprint**:
    *   **Website**: Linked external URL.
    *   **Instagram**: Profile link.
    *   **Facebook**: Page link.

#### 2. Creation & Validation (Create Modal)
Admins can also manually submit articles on behalf of users. The creation form includes strict validation:
*   **Publication Selection**: Selecting a publication automatically enforces its specific **Word Limit** and **Image Requirements**.
*   **Title/Slug**: As the admin types the title, a URL-friendly **Slug** is auto-generated (e.g., "Tech News" -> `tech-news`).
*   **Article Text**:
    *   **Word Counter**: A real-time counter shows `Current / Max` words.
    *   **Visual Warning**: The counter turns **Red** if the limit is exceeded and prevents submission.
*   **Image Validation**:
    *   **Orientation Check**: Images *must* be landscape (Width > Height).
    *   **Resolution Check**: Minimum acceptable resolution is **1000x600px**.
    *   **Alerts**: Use of invalid images triggers an immediate pop-up alert.
*   **Security**: ReCAPTCHA verification is required even for admin submissions to prevent script-based spam.

### Detailed Workflow: Editorial Review
1.  **Triage**: Filter the main list to show only `Pending` submissions.
2.  **Inspect**: Click **View** to open the submission specifics.
3.  **Review Content**: Read the `Article Text` for quality and check specific `Social Links` for validity.
4.  **Verify Images**: Ensure the uploaded images render correctly and match the article tone.
5.  **Decision**:
    *   **Approve**: Validates the content. The status updates to `Approved` (Green).
    *   **Reject**: Denies the content. The status updates to `Rejected` (Red).
    *   **Delete**: Permanently removes the submission (Trash Can icon).

---

## A.6 Award Submissions

### Route
`/admin/award-submissions`

### Purpose
This module handles the intake of high-intent applications for platform-hosted award galas. It organizes applicants based on their specific role in the event (Winner, Sponsor, Speaker, etc.), allowing for targeted follow-up by the sales or events team.

### Features & Layout
*   **Search & Filter Bar**:
    *   **Search**: Filters by Name, Email, or Company.
    *   **Award Filter**: view submissions for a specific Event.
    *   **Interest Filters**: Boolean toggles to see only "Sponsors", "Speakers", or "Exhibitors".
    *   **Demographic Filters**: Filter by Gender or Industry.
*   **Export**: The **Download CSV** function respects these active filters, allowing you to generate targeted lists (e.g., "All Female CEO Applicants for the Tech Award").

### Data Fields (Detailed View)
A comprehensive profile of the applicant is available in the detail view:
*   **Basic Profile**: Name, Email, Gender, Date of Birth.
*   **Award Target**: The specific **Award Name** they applied for.
*   **Contact Matrix**: WhatsApp, Calling Number, Telegram Username, and Direct Number.
*   **Professional Profile**: Current Company, Position, and Industry context.
*   **Interest Matrix** (Yes/No):
    *   *Receive Award*: Applying to win.
    *   *Sponsor Award*: Applying to fund/brand.
    *   *Speak at Award*: Applying for a keynote/panel.
    *   *Exhibit at Award*: Applying for a booth.
    *   *Attend Award*: Applying for audience tickets.
*   **Residency & Nationality**:
    *   **Dual Passport**: Checks for dual citizenship (Passport 1 & 2 details).
    *   **Residence**: Checks for UAE Residence status or "Other" residence.
*   **Digital Presence**: Live links to LinkedIn, Instagram, Facebook, and Websites (Personal & Company).
*   **Application Context**:
    *   **Earlier News Features**: History of previous coverage.
    *   **Filling for Other**: Indicates if this is an assistant applying on behalf of a principal.
    *   **Message**: Custom note from the applicant.

---

## A.7 Awards

### Route
`/admin/awards`

### Purpose
The configuration engine for the Awards ecosystem. This module allows admins to create, edit, and define the awards that users apply for in the **Award Submissions** module.

### Data Fields (Configuration)
When creating or editing an award, the following fields are managed:
*   **Identity**:
    *   **Award Name**: The public-facing title.
    *   **Award Focus**: Target sector/demographic (e.g., "Healthcare Innovation").
    *   **Organiser**: Host entity name.
*   **Timing**:
    *   **Award Month**: A dropdown selector (January - December) for event scheduling.
*   **Digital Assets**:
    *   **CTA Text**: Custom text for the "Apply Now" button (e.g., "Nominate Yourself").
    *   **Social Links**: Official Website, LinkedIn, and Instagram for the event.
*   **Event Details**:
    *   **Chief Guest**: VIP guest name.
    *   **Celebrity Guest**: Star appearance name.
    *   **Description**: Full text description of the award criteria and prestige.

### Bulk Operations
*   **Bulk Upload**: Admins can upload a `.csv` file to create hundreds of award categories instantly. This uses the `multipart/form-data` protocol.
*   **Template Download**: A pre-formatted CSV template prevents data errors during bulk uploads.

---

## A.8 Blog Management

### Route
`/admin/blogs`

### Purpose
A full-featured **Content Management System (CMS)** for the platform’s official news, updates, and editorial content. It supports rich text editing and media embedding.

### Dashboard Stats
Top-level metrics provide an instant overview:
*   **Total Blogs**: Count of all entries.
*   **With Images**: Count of posts with header images (Visual health check).
*   **Categorized**: Count of posts with assigned categories (Organization health check).

### The Editor (Quill Rich Text)
The module integrates the **Quill** editor, providing a Word-like experience:
*   **Formatting**: Headers (H1-H3), Bold, Italic, Underline, Strike.
*   **Structure**: Ordered (1,2,3) and Bulleted lists, Indentation, RTL (Right-to-Left) support.
*   **Media**: Embed Links, Images, and Videos directly into the body.
*   **Advanced**: Tables, Code Blocks, and Blockquotes.

### Data Fields
*   **Header Info**: Title, Category (e.g., "Press Release"), and Image URL.
*   **Publishing**: **Publish Date** selector (Defaults to today).
*   **Content**: The HTML body generated by the Quill editor.

### Features
*   **Bulk Delete**: Select multiple rows and delete in batches to clean up test data.
*   **Data Export**:
    *   **Filtered Data**: Download only what matches current search terms.
    *   **All Data**: Full database backup.

---

## A.9 Career Management

### Route
`/admin/career-management`

### Purpose
A job board management system allowing the platform to post vacancies or manage listings from partners. It features a strict approval workflow for quality control.

### Stats Dashboard
*   **Total**: All listings.
*   **Pending**: Needing review.
*   **Approved**: Live or ready to go.
*   **Rejected**: Failed standards.
*   **Active**: Currently visible to candidates.

### Data Fields (Job Posting)
*   **Core Details**: Job Title (Required), Company Name.
*   **Logistics**: Location (City/Remote), Job Type (`Full-time`, `Part-time`, etc.).
*   **Financial**: Salary (USD). Stored as a number, displayed as currency (e.g., `$75,000`).
*   **Deep Dive**: **Job Description** text area (Max 2000 characters).
*   **Admin Control**:
    *   **Status**: Dropdown to manually set `Active`, `Pending`, `Approved`, or `Rejected`.

### Bulk Workflow Actions
Select multiple jobs using the checkboxes to trigger:
*   **Bulk Approve**: Instantly validates multiple listings.
*   **Bulk Reject**: Triggers a **Prompt** asking for a "Rejection Reason". This reason is recorded and likely sent to the submitter.

### Filtering & Search
*   **Granular Filters**: Filter by Status, Job Type, Company, Location, and Created Date Range.
*   **Smart Search**: Unified search matches against Title, Company, *or* Location.

---

## A.10 Contact Management

### Route
`/admin/contact-management`

### Purpose
A lightweight **CRM (Customer Relationship Management)** tool to triage incoming inquiries from the "Contact Us" page. It categorizes leads and tracks resolution status.

### Workflow & Triage
The dashboard provides a "Inbox" style view with quick indicators:
*   **Status Badges**:
    *   **Unread** (Yellow): Needs attention.
    *   **Pending** (Blue): In progress.
    *   **Resolved** (Green): Completed.
    *   **Closed** (Gray): Archived.
*   **Priority Badges**:
    *   **Low** (Green) / **Medium** (Yellow) / **High** (Red) / **Urgent** (Dark Red).

### Data Fields
*   **Contact Profile**: Name & Email.
*   **Intent Classification** (Query Type):
    *   *Current Customer* / *Potential Customer*
    *   *Current Vendor* / *Potential Vendor*
    *   *Suggestions/Feedback*
    *   *Journalist/Reporter*
    *   *Commercial/Sales/Partnership*
*   **Message Body**: The full text of the inquiry.
*   **Metadata**: Submission Date.

### Features
*   **Slide-Out Details Panel**: Clicking **View** slides out a panel from the right, allowing specific focus on one lead without losing context of the list.
*   **Quick Status Update**: Admins can change Status and Priority directly from the table dropdowns for rapid triage.
*   **Export**: Full CSV download for importing leads into external CRM tools (Salesforce, HubSpot, etc.).

---

## A.11 Event Enquiries

### Route
`/admin/event-enquiries`

### Purpose
This module tracks incoming partnership and media enquiries specifically related to events. It serves as a lead generation funnel for event monetization and collaboration.

### Dashboard Stats
*   **Total Enquiries**: Aggregate count.
*   **New**: Enquiries that have not yet been opened.
*   **Viewed**: Enquiries that have been inspected by an admin.

### Data Fields
*   **Event Context**:
    *   **Event Name**: The specific event the user is inquiring about.
    *   **Event Type**: The category of the event.
*   **Contact Person**:
    *   **Name & Email**: Direct contact details.
    *   **Location**: City and Country of the inquirer.
*   **Status**:
    *   `New`: Highlighted (often with a yellow background) to indicate urgency.
    *   `Viewed`: Indicates lead has been processed.

### Features
*   **Auto-Status Update**: Clicking **View** automatically toggles the status from `New` to `Viewed`, ensuring no lead is ignored.
*   **Export**: Dedicated **Download CSV** button to hand off leads to the sales team.
*   **Sorting**: Sort by "Event Name" or "Submission Date" to prioritize hot leads.

---

## A.12 Event Management

### Route
`/admin/events`

### Purpose
The central command center for creating and managing physical or virtual events. This module is robust, handling everything from basic details to complex ticketing and custom registration forms.

### Data Fields (Event Config)
*   **Core Info**:
    *   **Title**: Event name (Required).
    *   **Dates**: Start Date, End Date, and specific **Registration Deadline**.
    *   **Location**: Venue, City, Country.
    *   **Organizer**: Admin or Partner name.
*   **Capacity & Access**:
    *   **Capacity**: Max attendees.
    *   **Is Free**: Boolean toggle.
    *   **Status**: `Active`, `Cancelled`, `Postponed`.
*   **Advanced Features**:
    *   **Custom Form Fields**: A JSON-based builder allowing admins to add specific questions for attendees (Text, Select, Checkbox).
    *   **Disclaimer Text**: Custom legal wording shown during checkout.
    *   **Feature Toggles**: Enable/Disable specific modules per event: *Sponsors, Media Partners, Speakers, Guests*.

### Ticket Management (Modal)
Admins can define multiple ticket tiers for a single event:
*   **Name**: e.g., "VIP", "Early Bird".
*   **Price**: Numeric value (0 for free tickets).
*   **Inventory**: `Quantity Available` and `Max Per User` limits.
*   **Sales Window**: `Sale Start` and `Sale End` dates to create urgency.

### Features
*   **Custom Form Builder**: Dynamic addition of fields (e.g., "Dietary Restrictions") without code changes.
*   **Disclaimer Management**: Create and order multiple legal disclaimers.
*   **Status Control**: Visual badges for `Active` (Green) vs `Cancelled` (Red).

---

## A.13 Group Management

### Route
`/admin/groups`

### Purpose
Manages user groups, potentially for community features or directory listings. It handles the organizational entities within the platform.

### Data Fields
*   **Identity**:
    *   **Group SN**: A system-generated Serial Number (Format: `GRP-{timestamp}`) for unique identification.
    *   **Group Name**: Display name.
*   **Location & Web**:
    *   **Location**: Physical base.
    *   **Links**: Website, LinkedIn, Instagram.

### Features
*   **Bulk Management System**:
    *   **CSV Upload**: Drag-and-drop zone to import groups in bulk.
    *   **Templates**: Downloadable `.csv` template to ensure correct formatting.
    *   **Bulk Actions**: Select multiple groups to **Delete** or **Change Status** (Draft, Pending, Approved, Rejected) in one go.
*   **Export**:
    *   **Filtered Export**: Download only the groups matching current search criteria.
    *   **Full Export**: Download the entire database.

---

## A.14 Paparazzi Management

### Route
`/admin/paparazzi`

### Purpose
A specialized module for managing photographer/videographer profiles ("Paparazzi") who sell media content. It includes detailed pricing configurations for various service types.

### Data Fields
*   **Social Profile**:
    *   **Platform**: Dropdown (Instagram, TikTok, YouTube, etc.).
    *   **Username & Page Name**: Identity on the platform.
    *   **Followers**: Numeric count for influence vetting.
    *   **Category**: e.g., "Fashion", "Travel".
*   **Pricing Matrix** (Service Menu):
    *   *Reel (No Tag, No Collab)*
    *   *Reel (With Tag, No Collab)*
    *   *Reel (With Tag & Collab)*
    *   *Story Charge*
    *   *Pin Post Weekly Charge*
*   **Constraints**:
    *   **Video Minutes Allowed**: Service limit definition.

### Workflows
*   **Rejection Workflow**: When rejecting a profile, a modal forces the admin to input a **Rejection Reason**, providing feedback to the applicant.
*   **Bulk Upload**: Supports large-scale onboarding via CSV.
*   **Pricing Control**: Admins can edit the rate card for any paparazzi profile directly.

---

## A.15 Podcaster Management

### Route
`/admin/podcasters`

### Purpose
Manages profiles of podcasters on the platform. Similar to Paparazzi, it serves as a directory management tool with strict approval processes.

### Dashboard Stats
*   **Total**: All submissions.
*   **Pending**: Awaiting moderation (Yellow badge).
*   **Approved**: Live profiles (Green badge).
*   **Rejected**: Denied profiles (Red badge).

### Data Fields
*   **Profile**:
    *   **Podcast Name**: Show title.
    *   **Host**: Presenter name.
    *   **Industry**: Focus area (e.g., "Tech", "Business").
*   **Status Metadata**:
    *   **Approved/Rejected By**: Tracks *which* admin made the decision.
    *   **Timestamps**: `Approved At` or `Rejected At`.

### Features
*   **Bulk Moderation**:
    *   **Bulk Approve**: Validates multiple podcasters instantly.
    *   **Bulk Reject**: Prompts for a single rejection reason applied to all selected items.
*   **CSV Integration**: Full support for Template Download, Bulk Upload, and Export.

---

## A.16 Power Lists

### Route
`/admin/powerlists`

### Purpose
Manages **Power Lists** (e.g., "Top 100 CEOs", "Most Influential Women"), handling nominations, rankings, and publication details. This module is vital for recognizing industry leaders and generating high-engagement content.

### Data Fields
*   **Nomination Details**:
    *   **Publication Context**: `Publication Name`, `Power List Name` (e.g., Forbes 30 Under 30), and `Last Power List URL` for reference.
    *   **Candidate Type**: `Company` or `Individual`.
    *   **Industry**: Sector classification (Technology, Finance, Healthcare, etc.).
    *   **Timing**: `Tentative Month` for the list release.
    *   **Region**: `Location Region` (e.g., MENA, Global).
*   **Status & Visibility**:
    *   **Status**: `Pending`, `Approved`, `Rejected`.
    *   **Is Active**: Toggle to control visibility in public listings.

### Features
*   **Sequential SN Generation**: Automatically generates a unique Serial Number for each nomination or list entry.
*   **Image Management**: Upload and preview candidate or list cover images.
*   **Bulk Actions**:
    *   **Bulk Status Update**: Approve multiple nominations at once.
    *   **Bulk Delete**: Clean up invalid entries.
*   **Export**: Full or filtered CSV export for editorial review.

---

## A.17 Press Pack Management

### Route
`/admin/press-packs`

### Purpose
Administers **Press Packs** (Electronic Press Kits - EPKs) distributed to media outlets. This tool manages the assets and distribution logic for PR campaigns.

### Data Fields
*   **Package Info**:
    *   **Distribution Package**: Name of the tiered service (e.g., "Standard", "Premium").
    *   **Region & Industry**: Target demographics for the press release.
*   **Performance Metrics**:
    *   **Indexed**: Boolean flag indicating if the press pack is indexed by search engines.
    *   **DA/DR**: Domain Authority and Domain Rating metrics for SEO value assessment.
    *   **Language**: Language of the content.

### Features
*   **Asset Management**: While the primary view focuses on metadata, the system supports linking downloadable assets.
*   **Bulk Operations**:
    *   **Upload**: Import multiple press pack definitions via CSV.
    *   **Export**: Download data for reporting.
*   **Stats Dashboard**:
    *   **Total**: Aggregate count.
    *   **Active vs Inactive**: Operational status.
    *   **Indexed**: SEO performance tracking.

---

## A.18 Publications

### Route
`/admin/publications`

### Purpose
The comprehensive database of media outlets (newspapers, magazines, blogs) where content can be published. This is a core inventory management tool for the marketplace.

### Data Fields
*   **Identity & Group**:
    *   **Publication Name** & **SN**: Unique identifiers.
    *   **Group**: Associates the publication with a parent media group.
    *   **Website**: URL and related `Social Media Icons`.
*   **Metrics & SEO**:
    *   **Grade**: Internal rating (Tier 1, Tier 2, etc.).
    *   **DA/DR**: Domain Authority/Rating.
    *   **News Index**: Google News indexing status.
*   **Commercials**:
    *   **Price**: Cost for publishing.
    *   **TAT**: `Agreement TAT` (Contract time) and `Practical TAT` (Actual publishing time).
    *   **Sponsored**: Boolean flag for sponsored content.
*   **Content Rules**:
    *   **Words Limit**: Max word count.
    *   **Images**: Max number of images allowed.
    *   **Do-follow**: SEO link attribute.

### Features
*   **Bulk Edit**: Select multiple publications to update fields like Status or Price in bulk.
*   **Advanced Filtering**: Filter by `Price Range`, `DA/DR Range`, `Region`, `Industry`, `Language`, and `Sponsored` status.
*   **Export Options**:
    *   **All Data**: Full database dump.
    *   **Filtered Data**: Exports only the currently viewed subset.

---

## A.19 Published Works Management

### Route
`/admin/published-works`

### Purpose
Tracks the actual history of published articles for clients. It serves as a portfolio manager and verification tool for completed PR work.

### Data Fields
*   **Article Verification**:
    *   **Article Link**: Direct URL to the live piece.
    *   **Publication Context**: `Name` and `Website`.
    *   **Date**: `Article Date` and `Year`.
*   **Client Context**:
    *   **Company/Person Name**: The subject of the article.
    *   **Countries**: `Company Country` and `Individual Country`.
*   **Metadata**:
    *   **Tags**: Categorization keywords.
    *   **Is Featured**: Toggle to highlight top-tier coverage on the frontend.

### Features
*   **Auto-Fill Tool**:
    *   **Function**: Admins can paste an `Article Link` and click **Auto-Fill**.
    *   **Logic**: The system scrapes the URL to automatically populate the `Publication Name` and `Publication Website`, reducing data entry errors.
*   **Portfolio view**: Manages the display of "As Seen In" sections.

---

## A.20 Radio Management

### Route
`/admin/radios`

### Purpose
Manages the inventory of Radio Stations and FM channels available for advertising or interviews.

### Data Fields
*   **Station Identity**:
    *   **Radio Name** & **SN**: Unique identifiers.
    *   **Frequency**: e.g., "92.7 FM".
    *   **Owner Group**: Parent media company.
*   **Reach & Demographics**:
    *   **Language**: Broadcast language.
    *   **Emirate/State**: Geographic coverage.
    *   **Popular RJ**: Key influencer name associated with the station.
*   **Digital Presence**:
    *   **Website**: Official site.
    *   **Socials**: LinkedIn/Instagram links.
*   **Media**:
    *   **Image**: Station logo or banner (Max 500KB).

### Features
*   **Sequential SN**: Smart generation of `RAD-XXX` serial numbers.
*   **Image Handling**: validation for file size (500KB) and types (JPEG, PNG, WebP) with preview.
*   **Bulk Inventory Management**: Full support for CSV Import/Export to manage large networks of stations.
---

## A.21 Real Estate Management

### Route
`/admin/real-estates`

### Purpose
Manages real estate listings submitted to the platform. This module allows admins to review, approve, or reject property listings, ensuring quality control before they go live.

### Data Fields
*   **Listing Information**:
    *   **Title**: The main headline of the property listing.
    *   **Status**: Current state (`Pending`, `Approved`, `Rejected`).
    *   **Date**: Creation timestamp.
*   **Stats**:
    *   **Total Listings**: Aggregate count of all listings.
    *   **Pending**: Listings awaiting review.
    *   **Approved**: Live listings.
    *   **Rejected**: Listings turned down.

### Features
*   **Review Workflow**:
    *   **View Details**: Inspect full listing information including images.
    *   **Approve**: Publish the listing to the platform.
    *   **Reject**: Deny the listing with a mandatory reason.
*   **Bulk Operations**:
    *   **Bulk Approve/Reject**: Process multiple listings simultaneously.
    *   **Bulk Delete**: Remove multiple listings at once.
    *   **CSV Upload**: Bulk import listings using a template.
*   **Export**: Download listing data to CSV.
*   **Create Listing**: Admin interface to manually add new property listings.

---

## A.22 Reporter Management

### Route
`/admin/reporters`

### Purpose
Controls the roster of reporters and journalists. This module is essential for managing the workforce that contributes content, tracking their department, position, and approval status.

### Data Fields
*   **Reporter Profile**:
    *   **Name & Email**: primary contact info.
    *   **Publication**: The media outlet they are associated with.
    *   **Department**: e.g., Commercial, Procurement, Publishing.
    *   **Position**: e.g., Journalist, Reporter, Contributor.
*   **Status**:
    *   **State**: `Pending`, `Approved`, `Rejected`.
    *   **Dates**: `Created At` and `Updated At`.

### Features
*   **Advanced Filtering**: Filter by `Department`, `Position`, `Status`, and Date Range (`From`/`To`).
*   **Search**: Find reporters by name, email, or publication.
*   **Management Actions**:
    *   **Add Reporter**: Manual form to onboard new reporters.
    *   **Edit/Delete**: Modify existing profiles.
    *   **Approve/Reject**: Validation workflow with rejection reasons.
*   **Bulk Actions**: Select multiple reporters to Approve or Reject in batches.

---

## A.23 Roles & Permissions

### Route
`/admin/roles-permissions`

### Purpose
The central security module for defining **Access Control**. It allows super admins to create granular roles (e.g., "Editor", "Viewer") and assign specific permissions to them, ensuring users only access what they need.

### Data Fields
*   **Roles**:
    *   **Name**: Unique identifier (e.g., `super_admin`, `editor`).
    *   **Description**: Explanation of the role's scope.
    *   **Level**: Hierarchy level (used for inheritance or priority).
    *   **Permissions Count**: Number of access rights attached.
*   **Permissions**:
    *   **Resource**: The target entity (e.g., `articles`, `users`).
    *   **Action**: What can be done (e.g., `create`, `read`, `update`, `delete`).
    *   **Name**: Human-readable label.

### Features
*   **Dual-Tab Interface**: Separate views for managing **Roles** and **Permissions**.
*   **Granular Control**: Create custom permissions specifying exactly which resources and actions are allowed.
*   **Role Assignment**: Link a set of permissions to a new or existing role.
*   **Security Management**: Edit or Delete roles/permissions to update access policies dynamically.

---

## A.24 Theme Management

### Route
`/admin/themes`

### Purpose
Manages the marketplace of **Themes** (social media pages/profiles available for collaboration). This inventory system tracks follower counts, pricing, and platform details.

### Data Fields
*   **Identity**:
    *   **Page Name** & **Username**: Public identifiers.
    *   **Platform**: e.g., Instagram, TikTok, YouTube.
    *   **Category**: Niche (e.g., Lifestyle, Tech).
    *   **Location**: Geographic focus.
*   **Metrics**:
    *   **Followers**: Total audience size (formatted as K/M).
    *   **Status**: `Pending`, `Approved`, `Rejected`.
    *   **Is Active**: Visibility toggle.
*   **Pricing**:
    *   **Commercials**: Various price points for different collaboration types (Reels, Posts, etc.).

### Features
*   **Bulk Inventory Tools**:
    *   **Bulk Upload**: Import large datasets via CSV.
    *   **Download Template**: Get the correct CSV format.
    *   **Export**: Backup data to CSV.
*   **Review Process**: Approve or Reject theme submissions with reasons.
*   **Multi-Filter**: Drill down by Platform, Category, Location, and Status.
*   **Sorting**: Sort by Followers or Pricing to identify top assets.

---

## A.25 User Management

### Route
`/admin/users`

### Purpose
A directory of all registered users who have successfully logged into the platform. This view provides high-level user administration and monitoring.

### Data Fields
*   **User Identity**:
    *   **Name**: First and Last name.
    *   **Email**: Primary contact.
    *   **Role**: Assigned system role (e.g., Agency, Editor).
*   **Status Flags**:
    *   **Status**: `Active` or `Inactive`.
    *   **Verified**: Boolean check for email/identity verification.
*   **Activity**:
    *   **Registered At**: Signup date.
    *   **Last Login**: Timestamp of most recent access.

### Features
*   **Activity Filtering**: By default, shows only users with a valid `last_login`.
*   **Stats Dashboard**:
    *   **Total**: Count of logged-in users.
    *   **Active/Verified**: Breakdown by status.
    *   **Logged In Today**: Real-time engagement metric.
*   **Export**: Download the full user registry to CSV.
*   **Search**: Find users by name or email.

---

## A.26 Website Management

### Route
`/admin/websites`

### Purpose
The comprehensive database of **Media Websites**. This is a critical inventory module, tracking everything from SEO scores to owner contact details and compliance documents.

### Data Fields
*   **Media Profile**:
    *   **Name & URL**: Site identity.
    *   **Type**: e.g., News, Blog.
    *   **Location**: Regional, Specific (Country/State).
    *   **Languages & Categories**: Content scope.
*   **SEO & metrics**:
    *   **Scores**: DA (Domain Authority), DR (Domain Rating), PA (Page Authority).
    *   **Policies**: Do-follow links, Back-dating, External links allowed.
*   **Owner Details**:
    *   **Contact**: Name, Email, Phone, WhatsApp, Telegram.
*   **Documents**:
    *   **Compliance**: Links to Registration, Tax, Passport, and Bank Detail documents.

### Features
*   **Detailed View Modal**: Pop-up window displaying all granular details (Social links, Price, Owner info) without leaving the list view.
*   **Status Workflow**:
    *   **Approve/Reject**: Change status with an optional text reason.
*   **Bulk Actions**:
    *   **Bulk Status**: Apply state changes to multiple sites.
    *   **Bulk Delete**: Clean up inventory.
*   **Document Access**: Direct download links for verification documents.
*   **Export**: Full CSV dump of website data.

---

---

### 📰 Content & Publishing

| Module | Route | Functionality & Key Features |
|--------|-------|------------------------------|
| **Article Submissions** | `/admin/article-submissions` | **Review Queue**: Central hub for user/reporter submitted articles.<br>**Approval Workflow**: Accept, Reject, or Request Changes on submissions. |
| **Blog Management** | `/admin/blogs` | **Official Blog**: Create and edit platform news/blog posts.<br>**SEO Tools**: specific meta fields for blog visibility. |
| **Press Pack Management** | `/admin/press-packs` | **EPK Management**: Upload and organize Electronic Press Kits.<br>**Assets**: Manage downloadable assets for media use. |
| **Publications** | `/admin/publications` | **Digital Editions**: Manage PDF/Flipbook publications.<br>**Cover Images**: Upload covers and set publication dates. |
| **Published Works** | `/admin/published-works` | **Author Works**: Manage specific book/report listings.<br>**Attribution**: Link works to specific authors/users. |
| **Theme Management** | `/admin/themes` | **Marketplace**: Manage UI/UX themes available for download.<br>**Files**: Upload theme packages and previews. |

### 👥 User & Entity Management

| Module | Route | Functionality & Key Features |
|--------|-------|------------------------------|
| **Agency Management** | `/admin/agencies` | **Verification**: Verify agency credentials.<br>**Profiles**: Edit agency details and contact info. |
| **Estates Management** | `/admin/real-estates` | **Property Listings**: Oversee real estate posts.<br>**Professionals**: Manage real estate agent profiles. |
| **Group Management** | `/admin/groups` | **User Segments**: Create groups for targeted notifications.<br>**Bulk Actions**: Apply settings to user groups. |
| **Paparazzi Management** | `/admin/paparazzi` | **Media Gallery**: Manage paparazzi photo submissions.<br>**Orders**: Track orders for high-res media. |
| **Podcaster Management** | `/admin/podcasters` | **Audio Content**: Manage podcast episodes and series.<br>**Listen Links**: Update platform distribution links. |
| **Reporter Management** | `/admin/reporters` | **Accreditation**: Manage reporter status and access.<br>**Performance**: View submission history. |
| **User Management** | `/admin/users` | **Full User Database**: Search and edit any user.<br>**Status**: Suspend, ban, or activate accounts.<br>**Roles**: Assign admin roles via `/admin/roles-permissions`. |
| **Website Management** | `/admin/websites` | **Directory**: Manage external website listings.<br>**SEO**: Configure backlink/listing properties. |

### 📅 Events & Competitions

| Module | Route | Functionality & Key Features |
|--------|-------|------------------------------|
| **Award Submissions** | `/admin/award-submissions` | **Entries**: View and grade award nominations.<br>**Shortlisting**: Select finalists for awards. |
| **Awards** | `/admin/awards` | **Setup**: Create award categories and criteria.<br>**Events**: Link awards to specific galas/events. |
| **Event Enquiries** | `/admin/event-enquiries` | **Inbox**: Manage questions regarding specific events.<br>**Follow-up**: Track response status. |
| **Event Management** | `/admin/events` | **Calendar**: Create and schedule upcoming events.<br>**Ticketing**: Configure basic event details and links. |
| **Power Lists** | `/admin/power-lists` | **Curated Lists**: Create "Top 100" style lists.<br>**Ranking**: Manage entity positions within lists. |

### 🔧 System & Support

| Module | Route | Functionality & Key Features |
|--------|-------|------------------------------|
| **Career Management** | `/admin/careers` | **Job Board**: Post opening vacancies.<br>**Applications**: Review incoming job applications. |
| **Contact Management** | `/admin/contacts` | **Support Inbox**: View messages from the "Contact Us" page.<br>**Data Export**: Export contact leads. |
| **Roles & Permissions** | `/admin/roles-permissions` | **Access Control**: Define detailed access scopes (Read/Write) for each admin role.<br>**Security**: Audit role capabilities. |


---



# Part B: User-Facing Website

The User-Facing Website is the public portal of the VaaS Solutions platform. It is designed to be responsive, accessible, and rich in content, serving visitors, content creators, and registered users. This section provides an **in-depth breakdown** of every page accessible to users, including features, UI elements, and user workflows.

---

## B.1 Homepage (`/`)

### Purpose
The Homepage is the central landing area designed to showcase the platform's diverse content ecosystems at a glance. It uses a dynamic, block-based layout to highlight the latest updates from every major category.

### Page Structure (Top to Bottom)

1.  **UserHeader (Navigation Bar)**
    *   **Logo**: Clicking navigates back to the Homepage.
    *   **Menu Links**: Direct links to Events, Publications, Blogs, Podcasters.
    *   **Sign In / Sign Up Button**: Opens the **AuthModal** for user authentication.
    *   **Language Selector**: Dropdown to switch between 6 languages (English, Arabic, French, Hindi, Russian, Chinese).

2.  **TopHeader (Quick Links Bar)**
    *   A slim, fixed bar above the main navigation with quick-access links:
        *   Agency Registration
        *   Reporter Registration
        *   Podcasters
        *   Press Release Submission

3.  **Ticker (News Marquee)**
    *   A scrolling banner displaying breaking news headlines or platform announcements in real-time.

4.  **FeatureSlider (Hero Carousel)**
    *   A prominent, animated carousel highlighting top stories, featured articles, or major announcements.
    *   Powered by **Framer Motion** for smooth transitions.
    *   Auto-advances every 5 seconds; users can manually navigate with arrows.

5.  **Content Sections** (Each fetches data dynamically):
    *   **AboutSimplified**: A short introduction to the platform's mission.
    *   **PublicationsSimplified**: Preview cards of the latest digital magazine editions.
    *   **PaparazziSimplified**: A grid of recent event photography thumbnails.
    *   **EventsSimplified**: Upcoming event cards with dates and locations.
    *   **RadioSimplified**: Featured radio station cards.
    *   **ThemeSimplified**: Preview of downloadable social media themes.
    *   **RealEstateSimplified**: Highlighted property listings or agent profiles.
    *   **PowerListSimplified**: Teasers for "Top 100" ranking lists.
    *   **AwardsSimplified**: Promoted industry award competitions.

6.  **FAQ Section**
    *   Accordion-style frequently asked questions displayed inline.

7.  **UserFooter**
    *   **Site Map**: Links to all major sections (About, Blog, Events, Contact).
    *   **Social Media Icons**: Facebook, Twitter, Instagram, LinkedIn, YouTube.
    *   **Legal Links**: Terms & Conditions, Privacy Policy, Cookie Policy, Refund Policy.
    *   **Contact Information**: Company address and email.

### Technical Features
*   **SEO Component**: Injects dynamic `<title>` and `<meta>` tags.
*   **Schema Component**: Adds JSON-LD structured data for search engines (Organization schema).
*   **Skeleton Loading**: Shows placeholder animations while content loads.
*   **Floating Lines**: Animated background effect for visual appeal.

---

## B.2 About Us (`/about-us`)

### Purpose
Introduces the platform's mission, vision, values, and team.

### Key Sections
*   **Hero Banner**: Full-width image with tagline.
*   **Mission Statement**: Detailed explanation of the platform's purpose.
*   **Vision**: Future goals and aspirations.
*   **Core Values**: Principles guiding the company (e.g., Integrity, Innovation).
*   **Team Section**: Photos and bios of key team members.
*   **Call-to-Action**: Buttons to Contact Us or Register.

---

## B.3 Contact Us (`/contact-us`)

### Purpose
Allows visitors to send inquiries to the support team.

### Form Fields
*   **Name** (Required)
*   **Email** (Required, validated)
*   **Phone** (Optional)
*   **Subject** (Dropdown: General Inquiry, Support, Partnership, etc.)
*   **Message** (Required, textarea)
*   **reCAPTCHA** (Required, prevents spam)

### Submission Flow
1.  User fills out the form.
2.  **Google reCAPTCHA** validates the user is not a bot.
3.  On submit, data is sent to the backend API.
4.  **Brevo** (email service) sends a confirmation email to the user.
5.  Admins receive the inquiry in the **Contact Management** section.
6.  Success toast notification: "Your message has been sent!"

---

## B.4 FAQ (`/faq`)

### Purpose
Provides answers to common questions to reduce support requests.

### UI Elements
*   **Accordion List**: Questions are collapsible; clicking expands to reveal the answer.
*   **Categories**: Questions grouped by topic (Account, Billing, Content, etc.).
*   **Search**: Users can search for specific keywords.

---

## B.5 Legal Pages

All legal pages share a consistent layout: Hero section with title, followed by formatted text content.

| Route | Page | Content |
|-------|------|---------|
| `/terms-and-conditions` | **Terms & Conditions** | Full legal agreement governing platform use. Sections include Acceptance, User Responsibilities, Intellectual Property, Limitation of Liability. |
| `/privacy-policy` | **Privacy Policy** | GDPR-compliant disclosure on data collection, storage, and usage. Includes cookie information. |
| `/cookie-policy` | **Cookie Policy** | Detailed explanation of cookies used, their purpose, and how to manage consent. |
| `/refund-policy` | **Refund Policy** | Conditions under which refunds are granted for paid services or products. |
| `/csr` | **CSR** | Corporate Social Responsibility initiatives and community programs. |
| `/trademark-policy` | **Trademark Policy** | Guidelines for using the VaaS Solutions brand, logos, and trademarks. |
| `/data-protection` | **Data Protection** | GDPR compliance details, data subject rights, and DPO contact information. |
| `/reselling-agreement` | **Reselling Agreement** | Terms for affiliates and resellers partnering with the platform. |
| `/press-guidelines` | **Press Guidelines** | Rules for media outlets when quoting or referencing platform content. |
| `/brands-people` | **Brands & People** | Showcase of featured brands and influential people partnered with the platform. |
| `/media-partnerships` | **Media Partnerships** | Information on how media companies can collaborate with the platform. |

---

## B.6 Dashboard (`/dashboard`) - Login Required

### Purpose
The personal command center for authenticated users.

### Features
*   **Welcome Message**: "Welcome, [First Name]!"
*   **Quick Action Cards**:
    *   **Write Articles**: Link to `/submit-article`.
    *   **Read Premium**: Access to `/blogs`.
    *   **Stay Updated**: Notifications overview.
*   **Recent Activity**: Shows the user's latest submissions and interactions.
*   **Profile Summary**: Displays avatar, name, and role.

---

## B.7 User Profile (`/profile`) - Login Required

### Purpose
Allows users to manage their personal information and settings.

### Editable Fields
*   **First Name** / **Last Name**
*   **Bio / About Me** (Rich text)
*   **Avatar** (Image upload, stored on **AWS S3**)
*   **Phone Number** (Formatted input using **React Phone Number Input**)
*   **Email** (Display only, change requires verification)

### Settings
*   **Change Password**: Old password + New password confirmation.
*   **Notification Preferences**: Toggle for email notifications.
*   **Language Preference**: Dropdown to set default UI language.

---

## B.8 Blog Listing (`/blogs`) - Login Required

### Purpose
The core news engine where users browse articles.

### UI Elements
*   **Hero Section**: Featured article banner.
*   **Category Sidebar**: Filter by All, Business, Tech, Entertainment, Lifestyle, etc.
*   **Article Cards**:
    *   Cover Image
    *   Title (clickable, navigates to `/blog/:id`)
    *   Author Name
    *   Publication Date
    *   Read Time (calculated from word count)
    *   Excerpt (first 150 characters)
*   **Social Sharing Menu**: Hover reveals share buttons (Facebook, Twitter, LinkedIn, WhatsApp, Copy Link).
*   **Pagination**: Navigate between pages of results.
*   **Search Bar**: Find articles by keyword.

### Technical
*   Categories are fetched from the backend and counts are dynamically updated.
*   Uses **Framer Motion** for card animations on scroll.

---

## B.9 Blog Detail (`/blog/:id`) - Login Required

### Purpose
Full article reading experience.

### Layout
*   **Hero Image**: Full-width cover image.
*   **Title**: H1 heading.
*   **Author Attribution**: Photo, Name, and Date.
*   **Content Body**: Rich HTML content rendered safely.
*   **Tags**: Clickable chips linking to related articles.
*   **Share Buttons**: Fixed sidebar with social icons.
*   **Related Articles**: Recommended reads at the bottom.
*   **Comments Section** (if enabled): User can post and view comments.

---

## B.10 Publications Library (`/publications`) - Login Required

### Purpose
Digital newsstand of magazine editions.

### Features
*   **Grid/List View Toggle**: Switch between card grid and detailed list.
*   **Filter Panel**:
    *   **Region**: Global, UAE, India, etc.
    *   **Language**: English, Arabic, Hindi.
    *   **Focus/Theme**: Business, Lifestyle, etc.
    *   **TAT (Turnaround Time)**: Filter by delivery speed.
*   **Sort Options**: By Date, Price, DA Score, DR Score.
*   **Publication Cards**:
    *   **Cover Image**: Magazine thumbnail.
    *   **Title** & **Edition Date**.
    *   **DA/DR Scores**: Color-coded quality metrics.
    *   **Price Badge**.
    *   **"View Details" Button**: Navigates to `/publications/:id`.
    *   **Share Menu**: Social sharing options.

### Submission
*   Users cannot submit publications directly; this is Admin-only.

---

## B.11 Publication Detail (`/publications/:id`) - Login Required

### Purpose
Interactive viewer for a specific publication.

### Features
*   **Flipbook Viewer**: Powered by **React PageFlip** and **React PDF**.
    *   Users can flip through pages with animations.
    *   Zoom In/Out controls.
    *   Full-screen mode.
*   **Download Button**: Link to download the PDF (if allowed).
*   **Metadata Panel**: Edition date, publisher, page count.
*   **Share Buttons**: Social sharing.

---

## B.12 Podcasters Directory (`/podcasters`) - Login Required

### Purpose
Browse and discover voice creators on the platform.

### Features
*   **Grid Layout**: Cards for each podcaster.
*   **Filter Panel**:
    *   **Genre**: News, Entertainment, Education.
    *   **Language**: English, Hindi, Arabic.
    *   **Platform**: Spotify, Apple Podcasts.
*   **Podcaster Cards**:
    *   **Profile Image**.
    *   **Name** & **Show Title**.
    *   **Listen Links**: Icons linking to Spotify, Apple Podcasts.
    *   **Social Media**: Instagram, Twitter, YouTube.
    *   **"View Profile" Button**: Navigates to `/podcasters/:id`.
    *   **Share Menu**.
*   **Search Bar**: Find by name or show title.

---

## B.13 Podcaster Profile (`/podcasters/:id`) - Login Required

### Purpose
Individual podcaster page.

### Sections
*   **Hero Section**: Profile image, name, tagline.
*   **Bio**: Detailed about text.
*   **Episode List**: Embedded players or links to listen.
*   **Platform Links**: Spotify, Apple Podcasts, Google Podcasts.
*   **Social Media Links**: All connected profiles.
*   **Contact Button**: Initiate contact or collaboration.

---

## B.14 Radio Stations (`/radio`) - Login Required

### Purpose
Directory of partnered radio stations.

### Features
*   **Station Cards**:
    *   **Logo**.
    *   **Station Name** & **Frequency**.
    *   **Region/City**.
    *   **"Listen Live" Button** (external link).
    *   **Share Menu**.
*   **Filter by Region**.
*   **Search by Name**.

---

## B.15 Paparazzi Gallery (`/paparazzi`) - Login Required

### Purpose
Visual-first gallery of event photography.

### Features
*   **Grid/List View Toggle**.
*   **Filter Panel**:
    *   **Event Name**.
    *   **Location**.
    *   **Category** (Red Carpet, Celebrity, Event).
*   **Photo Cards**:
    *   **Thumbnail Image**.
    *   **Title**.
    *   **Photographer Name**.
    *   **View Count**.
    *   **Price** (for high-res purchase).
    *   **"View Details" Button**: Navigates to `/paparazzi/:id`.
    *   **Share Menu**.
*   **"+ Submit New" Button**: Navigates to `/paparazzi/submit` for logged-in photographers.

---

## B.16 Events Calendar (`/events`) - Login Required

### Purpose
Comprehensive list of summits, webinars, and galas.

### Features
*   **Event Cards**:
    *   **Event Type Icon** (Conference, Webinar, Gala - color-coded).
    *   **Title** & **Date**.
    *   **Location** (City, Venue).
    *   **Description Excerpt**.
    *   **"View Details" Button**: Navigates to `/events/:id`.
    *   **"Register Interest" Button**: Opens modal.
    *   **Share Menu**.
*   **Filter Panel**:
    *   **Event Type**: Conference, Webinar, Workshop.
    *   **Date Range**: From/To.
    *   **Location**.
*   **"Clear Filters" Button**.

---

## B.17 Event Detail (`/events/:id`) - Login Required

### Purpose
Full event information and registration.

### Sections
*   **Hero Banner**: Event image with title overlay.
*   **Key Details Card**: Date, Time, Location (with Map embed).
*   **Description**: Full event overview.
*   **Agenda**: Timetable of sessions.
*   **Speakers**: Photos and bios of presenters.
*   **Ticket/Registration**: Button linking to external ticketing or `/event-enquiry`.
*   **Share Buttons**.

---

## B.18 Themes Marketplace (`/themes`) - Login Required

### Purpose
Browse social media themes (influencer pages) available for collaboration.

### Features
*   **Grid Layout**.
*   **Filter Panel**:
    *   **Platform**: Instagram, TikTok, YouTube.
    *   **Category**: Lifestyle, Tech, Fashion.
    *   **Location**.
*   **Sort Options**: By Followers (High to Low), by Price.
*   **Theme Cards**:
    *   **Profile Image**.
    *   **Page Name** & **Username**.
    *   **Platform Icon**.
    *   **Follower Count** (formatted: 1.2M, 500K).
    *   **Price Badge**.
    *   **"View Profile" Button**: Navigates to `/themes/:id`.
    *   **Share Menu**.

---

## B.19 Submit Article (`/submit-article`) - Login Required

### Purpose
Rich-text form for users to submit news articles.

### Form Fields
*   **Title** (Required, auto-generates slug).
*   **Publication** (Dropdown, select from list).
*   **Category** (Dropdown: Business, Tech, etc.).
*   **Tags** (Comma-separated input).
*   **Cover Image** (File upload, max 500KB, JPEG/PNG/WebP).
*   **Content** (Rich text editor powered by **Quill**):
    *   Bold, Italic, Underline.
    *   Headings (H1-H6).
    *   Lists (Bullet, Numbered).
    *   Links.
    *   Image Embed.
    *   Blockquote.
*   **Meta Description** (For SEO).

### Submission Flow
1.  User fills out the form.
2.  Validation checks (title length, content minimum, image size).
3.  On submit, article is sent to backend with status "Pending".
4.  Admin reviews in **Article Submissions Management**.
5.  User receives notification on approval/rejection.

---

## B.20 AI Article Generator (`/ai-article-questionnaire`) - Login Required

### Purpose
Guided tool powered by **Google Gemini** to help users create articles.

### Workflow
1.  **Step 1: Topic Selection**
    *   User enters the main topic or headline.
2.  **Step 2: Tone Setting**
    *   Dropdown: Professional, Casual, Formal, Satirical.
3.  **Step 3: Key Facts**
    *   Textarea for user to input bullet points of facts.
4.  **Step 4: Generate**
    *   On click, frontend sends data to backend.
    *   Backend calls **Google Gemini API**.
    *   AI generates a structured article.
5.  **Step 5: Review & Edit** (at `/ai-article-generation/:id`)
    *   User reviews the draft.
    *   Quill editor allows modifications.
    *   Submit as a regular article.

---

## B.21 Agency & Reporter Registration

### Agency Registration (`/agency-registration`)
*   **Company Name** (Required)
*   **Type of Agency** (PR, Media Buying, etc.)
*   **Contact Person Name**
*   **Email** & **Phone**
*   **Address**
*   **Documents**: GSTIN Certificate, PAN Card (PDF upload to **AWS S3**).
*   **Website URL**

### Reporter Registration (`/reporter-registration`)
*   **Full Name** (Required)
*   **Email** (Required)
*   **Phone**
*   **Publication/Outlet** (Text or Dropdown)
*   **Department** (Commercial, Editorial, etc.)
*   **Position** (Journalist, Editor, Contributor)
*   **Bio** (Textarea)
*   **Sample Work Links** (URLs to published articles)
*   **Profile Image** (Upload)

Both registrations go to Admin for approval.

---

## B.22 Other Submission Forms

### Paparazzi Submission (`/paparazzi/submit`)
*   **Event Name** (Required)
*   **Event Date**
*   **Location**
*   **Photos** (Multiple file upload, max 5MB each).
*   **Description**.
*   **Photographer Name**.
*   **Contact Email**.

### Theme Submission (`/themes/submit`)
*   **Page Name** (Required)
*   **Username/Handle**
*   **Platform** (Instagram, TikTok, YouTube)
*   **Category**
*   **Follower Count**
*   **Profile Link**
*   **Email** & **Phone**
*   **Pricing Details** (Reel Price, Post Price, etc.)

### Website Submission (`/website-submission`)
*   **Website Name** (Required)
*   **URL** (Required)
*   **Type** (News, Blog, Magazine)
*   **Region** & **Languages**
*   **DA/DR Scores** (Optional)
*   **Contact Email**
*   **Owner Name**

---

## B.23 Support & Resources

| Route | Page | Description |
|-------|------|-------------|
| `/video-tutorials` | **Video Tutorials** | Embedded video library with step-by-step guides. Organized by topic. |
| `/how-to-guides` | **How-To Guides** | Text-based articles explaining common tasks. |
| `/download-center` | **Download Center** | Repository for downloadable templates, brand assets, and forms. |
| `/resource-library` | **Resource Library** | Aggregated collection of all support materials. |
| `/orders-delivered` | **Orders Delivered** | User's purchase history with download links for fulfilled orders. |
| `/affiliate-program` | **Affiliate Program** | Application form and information for becoming an affiliate partner. |

---

## B.24 User Interface Components

These are reusable components that appear across multiple pages:

| Component | Description |
|-----------|-------------|
| **UserHeader** | Main navigation bar. Contains logo, menu links, language selector, and Auth button. |
| **TopHeader** | Slim bar with quick links to Agency/Reporter registration. |
| **UserFooter** | Site map, social icons, legal links, and contact info. |
| **FeatureSlider** | Hero carousel on Homepage with auto-play and manual navigation. |
| **AuthModal** | Popup for Login, Registration, Forgot Password forms. |
| **SEO Component** | Injects dynamic meta tags for each page. |
| **Schema Component** | Adds JSON-LD structured data for SEO. |
| **Skeleton Loader** | Placeholder animations while content fetches. |
| **Share Menu** | Social sharing dropdown (Facebook, Twitter, LinkedIn, WhatsApp, Copy Link). |
| **Pagination** | Page navigation for list views. |
| **Filter Panel** | Collapsible sidebar for search/filter controls. |

---

## B.25 Access Control Summary

| Access Level | Pages |
|--------------|-------|
| **Public (No Login)** | Homepage, About Us, Contact Us, FAQ, Services Overview, How It Works, all Legal pages, Event Enquiry, Exhibition Form, User Cookies Data. |
| **Protected (Login Required)** | Dashboard, Profile, Blogs, Publications, Published Works, Podcasters, Radio, Paparazzi, Events, Awards, Power Lists, Real Estate, Themes, Press Packs, Careers, all Submission forms, AI Tools, Video Tutorials, How-To Guides, Download Center, Resource Library, Orders, Affiliate Program. |
| **Role-Specific** | Reporter Submissions Dashboard (`/reporter-submissions`) - only for users with **Reporter** role. Agency features - only for **Agency** users. |

---



## Appendix: Quick Reference Guide

### Key URLs

| Page | URL |
|------|-----|
| Website Home | https://vaas.solutions |
| Admin Login | https://vaas.solutions/admin/login |
| Admin Dashboard | https://vaas.solutions/admin/dashboard |
| User Dashboard | https://vaas.solutions/dashboard |
| Submit Article | https://vaas.solutions/submit-article |
| AI Article Generator | https://vaas.solutions/ai-article-questionnaire |

### Common Admin Tasks

| Task | Path |
|------|------|
| Create Blog Article | Admin → Blogs → Add New |
| Manage Events | Admin → Events → Event Management |
| Create New Event | Admin → Events → Event Creation |
| Add Publication | Admin → Publications → Add New |
| Manage Users | Admin → Users → User Management |
| Review Article Submissions | Admin → Article Submissions |
| Approve Reporter Registrations | Admin → Reporters |
| Manage Contacts | Admin → Contacts |
| View Orders | Admin → Orders |
| Manage Roles & Permissions | Admin → Roles & Permissions |

### Design Tokens

---

# Part D: Complete Design System Reference

This section provides the complete design system used throughout the VaaS Solutions platform. All values are defined as CSS custom properties in `index.css` and should be referenced consistently across the application.

---

## D.1 Color Palette

### Primary Brand Colors
| Token | Variable | Hex Value | Usage |
|-------|----------|-----------|-------|
| Primary | `--primary` | `#1976D2` | Main brand color, CTAs, links, active states |
| Primary Dark | `--primary-dark` | `#0D47A1` | Hover states, emphasis, headers |
| Primary Light | `--primary-light` | `#E3F2FD` | Backgrounds, highlights, selected states |

### Secondary Brand Colors
| Token | Variable | Hex Value | Usage |
|-------|----------|-----------|-------|
| Secondary | `--secondary` | `#00796B` | Accent color, secondary CTAs, tags |
| Secondary Dark | `--secondary-dark` | `#004D40` | Hover states for secondary elements |
| Secondary Light | `--secondary-light` | `#E0F2F1` | Secondary backgrounds, cards |

### Semantic/Feedback Colors
| Token | Variable | Hex Value | Usage |
|-------|----------|-----------|-------|
| Success | `--success` | `#4CAF50` | Success messages, confirmations, "approved" badges |
| Success Light | `--success-light` | `#E8F5E8` | Success background alerts |
| Warning | `--warning` | `#FF9800` | Warning messages, "pending" status |
| Warning Light | `--warning-light` | `#FFF3E0` | Warning background alerts |
| Error/Danger | `--error` | `#F44336` | Error messages, delete buttons, "rejected" badges |
| Error Light | `--error-light` | `#FFEBEE` | Error background alerts |
| Info/Purple | `--info` | `#9C27B0` | Informational messages, special highlights |
| Info Light | `--info-light` | `#F3E5F5` | Info background alerts |

### Neutral/Gray Scale
| Token | Variable | Hex Value | Usage |
|-------|----------|-----------|-------|
| Gray 900 | `--gray-900` | `#212121` | Primary text, headings |
| Gray 600 | `--gray-600` | `#757575` | Secondary text, labels, captions |
| Gray 400 | `--gray-400` | `#BDBDBD` | Placeholder text, disabled states |
| Gray 200 | `--gray-200` | `#E0E0E0` | Borders, dividers, input outlines |
| Gray 100 | `--gray-100` | `#F5F5F5` | Light backgrounds, table rows |
| Gray 50 | `--gray-50` | `#FAFAFA` | Page backgrounds, subtle sections |
| White | `--white` | `#FFFFFF` | Cards, modals, content backgrounds |

---

## D.2 Typography System

### Font Families
| Token | Variable | Fonts | Usage |
|-------|----------|-------|-------|
| Primary Font | `--font-primary` | `'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif` | Headings, buttons, navigation, UI elements |
| Secondary Font | `--font-secondary` | `'Open Sans', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif` | Body text, paragraphs, form inputs |
| Monospace Font | `--font-mono` | `'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace` | Code blocks, technical content |

### Font Size Scale
| Token | Variable | Size (rem) | Size (px) | Usage |
|-------|----------|------------|-----------|-------|
| XS | `--text-xs` | 0.75rem | 12px | Captions, badges, fine print |
| SM | `--text-sm` | 0.875rem | 14px | Small body, labels, button text |
| Base | `--text-base` | 1rem | 16px | Default body text, inputs |
| LG | `--text-lg` | 1.125rem | 18px | Large body, introductions |
| XL | `--text-xl` | 1.25rem | 20px | Heading 4, sub-headings |
| 2XL | `--text-2xl` | 1.5rem | 24px | Heading 3 |
| 3XL | `--text-3xl` | 1.875rem | 30px | Heading 2 |
| 4XL | `--text-4xl` | 2.25rem | 36px | Heading 1, hero titles |
| 5XL | `--text-5xl` | 3rem | 48px | Display, hero headlines |

### Typography Classes

#### Headings
| Class | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| `.heading-1` | Inter | 2rem (32px) | 700 (Bold) | 1.2 | Page titles, hero headlines |
| `.heading-2` | Inter | 1.75rem (28px) | 600 (SemiBold) | 1.2 | Section headers |
| `.heading-3` | Inter | 1.5rem (24px) | 600 (SemiBold) | 1.2 | Subsection headers |
| `.heading-4` | Inter | 1.25rem (20px) | 500 (Medium) | 1.2 | Card titles, sidebar items |

#### Body Text
| Class | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| `.body-large` | Open Sans | 1.125rem (18px) | 400 (Regular) | 1.6 | Introductions, lead paragraphs |
| `.body-regular` | Open Sans | 1rem (16px) | 400 (Regular) | 1.6 | Default body content |
| `.body-small` | Open Sans | 0.875rem (14px) | 400 (Regular) | 1.6 | Secondary text, metadata |
| `.caption` | Open Sans | 0.75rem (12px) | 400 (Regular) | 1.4 | Timestamps, fine print |
| `.button-text` | Inter | 0.875rem (14px) | 500 (Medium) | 1.4 | Button labels |

### Responsive Typography (Mobile ≤768px)
| Class | Desktop Size | Mobile Size |
|-------|--------------|-------------|
| `.heading-1` | 32px | 24px |
| `.heading-2` | 28px | 20px |

---

## D.3 Spacing Scale

| Token | Variable | Size (rem) | Size (px) | Usage |
|-------|----------|------------|-----------|-------|
| Space 1 | `--space-1` | 0.25rem | 4px | Tight spacing, icon gaps |
| Space 2 | `--space-2` | 0.5rem | 8px | Button padding, small gaps |
| Space 3 | `--space-3` | 0.75rem | 12px | Input padding, form gaps |
| Space 4 | `--space-4` | 1rem | 16px | Standard padding, card gaps |
| Space 5 | `--space-5` | 1.25rem | 20px | Medium sections |
| Space 6 | `--space-6` | 1.5rem | 24px | Large padding, section gaps |
| Space 8 | `--space-8` | 2rem | 32px | Major section breaks |
| Space 10 | `--space-10` | 2.5rem | 40px | Hero sections |
| Space 12 | `--space-12` | 3rem | 48px | Page margins |
| Space 16 | `--space-16` | 4rem | 64px | Large hero spacing |
| Space 20 | `--space-20` | 5rem | 80px | Full-page sections |
| Space 24 | `--space-24` | 6rem | 96px | Maximum section padding |

---

## D.4 Button Styles

### Primary Buttons (Filled)
| Class | Background | Text Color | Hover | Usage |
|-------|------------|------------|-------|-------|
| `.btn-primary` | `#1976D2` | White | `#0D47A1` | Main CTAs, submit forms |
| `.btn-success` | `#4CAF50` | White | `#388E3C` | Confirm, approve, save |
| `.btn-warning` | `#FF9800` | White | `#F57C00` | Caution actions |
| `.btn-danger` | `#F44336` | White | `#D32F2F` | Delete, remove, reject |
| `.btn-info` | `#9C27B0` | White | `#7B1FA2` | Informational actions |

### Secondary Button
| Class | Background | Border | Text Color | Hover |
|-------|------------|--------|------------|-------|
| `.btn-secondary` | White | `1px solid #1976D2` | `#1976D2` | `#E3F2FD` bg |

### Outline Buttons
| Class | Border Color | Text Color | Hover State |
|-------|--------------|------------|-------------|
| `.btn-outline-primary` | `#1976D2` | `#1976D2` | Filled primary |
| `.btn-outline-secondary` | `#00796B` | `#00796B` | Filled secondary |
| `.btn-outline-success` | `#4CAF50` | `#212121` | Filled success |
| `.btn-outline-warning` | `#FF9800` | `#212121` | Filled warning |
| `.btn-outline-danger` | `#F44336` | `#212121` | Filled error |
| `.btn-outline-info` | `#9C27B0` | `#212121` | Filled info |

### Button Specifications
- **Padding**: `8px 16px` (Space 2 × Space 4)
- **Border Radius**: `6px` (0.375rem)
- **Font Family**: Inter (--font-primary)
- **Font Size**: 14px (--text-sm)
- **Font Weight**: 500 (Medium)
- **Transition**: `all 0.2s ease`
- **Focus Ring**: `2px solid color-light`, offset `2px`

---

## D.5 Form Elements

### Input Fields
| Property | Value |
|----------|-------|
| Padding | `12px 16px` (Space 3 × Space 4) |
| Border | `1px solid #E0E0E0` (Gray 200) |
| Border Radius | `6px` (0.375rem) |
| Font Family | Open Sans (--font-secondary) |
| Font Size | 16px (--text-base) |
| Text Color | `#212121` (Gray 900) |
| Placeholder Color | `#BDBDBD` (Gray 400) |
| Focus Border | `#1976D2` (Primary) |
| Focus Shadow | `0 0 0 3px rgba(25, 118, 210, 0.1)` |

### Labels
| Property | Value |
|----------|-------|
| Font Family | Inter (--font-primary) |
| Font Size | 16px (--text-base) |
| Font Weight | 500 (Medium) |
| Color | `#212121` (Gray 900) |
| Margin Bottom | `8px` (Space 2) |

---

## D.6 Shadows & Elevation

| Level | Box Shadow | Usage |
|-------|------------|-------|
| None | `none` | Flat elements |
| SM | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle cards |
| Base | `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)` | Cards, dropdowns |
| MD | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` | Hover states |
| LG | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` | Modals |
| XL | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` | Dialogs, overlays |

---

## D.7 Border Radius

| Size | Value | Usage |
|------|-------|-------|
| None | `0` | Sharp edges |
| SM | `0.125rem` (2px) | Small badges |
| Base | `0.25rem` (4px) | Tags, chips |
| MD | `0.375rem` (6px) | Buttons, inputs, cards |
| LG | `0.5rem` (8px) | Large cards, modals |
| XL | `0.75rem` (12px) | Hero sections |
| 2XL | `1rem` (16px) | Rounded containers |
| Full | `9999px` | Pills, circular avatars |

---

## D.8 Z-Index Layers

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | `0` | Default content |
| Dropdown | `10` | Dropdown menus |
| Sticky | `20` | Sticky headers |
| Fixed | `30` | Fixed navigation |
| Modal Backdrop | `40` | Dark overlay |
| Modal | `50` | Modal dialogs |
| Popover | `60` | Tooltips, popovers |
| Toast | `70` | Notifications |
| Maximum | `1000` | Critical overlays |

---

## D.9 Animations

### Built-in Keyframes

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- **Class**: `.animate-fade-in`
- **Duration**: 0.8s ease-out

#### Fade In Up
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- **Class**: `.animate-fade-in-up`
- **Duration**: 0.6s ease-out

#### Blob Animation (Background Decoration)
```css
@keyframes blob {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
```
- **Class**: `.animate-blob`
- **Duration**: 7s infinite

#### Gradient Animation
```css
@keyframes animate-gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```
- **Class**: `.animate-gradient-x`
- **Duration**: 3s ease infinite

### Animation Delay Classes
- `.animation-delay-2000`: 2s delay
- `.animation-delay-4000`: 4s delay

---

## D.10 Breakpoints (Responsive Design)

| Breakpoint | Width | Usage |
|------------|-------|-------|
| SM | `640px` | Small phones |
| MD | `768px` | Tablets, large phones |
| LG | `1024px` | Small laptops |
| XL | `1280px` | Desktops |
| 2XL | `1536px` | Large desktops |

### Container Max Widths
| Size | Max Width |
|------|-----------|
| SM | `640px` |
| MD | `768px` |
| LG | `1024px` |
| XL | `1280px` |
| 2XL | `1536px` |
| Full | `100%` |

---

## D.11 Utility Classes

### Text Colors
- `.text-primary` — Primary blue
- `.text-secondary` — Secondary teal
- `.text-success` — Success green
- `.text-warning` — Warning orange
- `.text-error` — Error red
- `.text-info` — Info purple

### Background Colors
- `.bg-primary` — Primary blue
- `.bg-secondary` — Secondary teal
- `.bg-success` — Success green
- `.bg-success-light` — Light success
- `.bg-warning` — Warning orange
- `.bg-warning-light` — Light warning
- `.bg-error` — Error red
- `.bg-error-light` — Light error
- `.bg-info` — Info purple
- `.bg-info-light` — Light info

### Line Clamp (Text Truncation)
- `.line-clamp-2` — Truncate to 2 lines with ellipsis
- `.line-clamp-3` — Truncate to 3 lines with ellipsis

### Custom Scrollbar
- `.custom-scrollbar` — Thin, styled scrollbar (6px width, gray track)

---

## D.12 Alert Styles

| Class | Background | Border | Text Color |
|-------|------------|--------|------------|
| `.alert-success` | `#E8F5E8` | `#4CAF50` | `#4CAF50` |
| `.alert-error` | `#FFEBEE` | `#F44336` | `#F44336` |

**Specifications:**
- Padding: `12px 16px`
- Border Radius: `6px`
- Border: `1px solid`
- Margin Bottom: `16px`

---

## D.13 Icon System

### Icon Library
The platform uses **Lucide React** and **React Icons** for vector icons.

### Icon Sizes
| Size Name | Dimensions | Usage |
|-----------|------------|-------|
| XS | 12×12px | Inline with captions |
| SM | 16×16px | Buttons, compact UI |
| Base | 20×20px | Standard icons |
| MD | 24×24px | Navigation, prominent |
| LG | 32×32px | Feature highlights |
| XL | 48×48px | Hero sections, empty states |

### Common Icons Used
| Icon | Usage |
|------|-------|
| `pencil` | Edit actions |
| `trash` | Delete actions |
| `plus` | Add new items |
| `search` | Search functionality |
| `filter` | Filter panels |
| `eye` | View/preview |
| `download` | Download files |
| `upload` | Upload files |
| `share` | Share menu |
| `heart` | Favorites, likes |
| `bell` | Notifications |
| `user` | User profile |
| `settings` | Settings/preferences |
| `chevron-down` | Dropdowns |
| `arrow-left/right` | Navigation |
| `check` | Success, checkmarks |
| `x` | Close, cancel |
| `alert-triangle` | Warnings |
| `info` | Information |

---

---

# Part E: Maintenance & FAQs for VaaS Solutions Users

This section is designed for non-technical users of the **VaaS Solutions** platform (https://vaas.solutions) who want to ensure the website is running smoothly or troubleshoot minor issues themselves before contacting the technical team.

> **Platform Overview:** VaaS Solutions is a comprehensive media and content marketplace offering Publications, Podcasters, Radio Stations, Paparazzi Galleries, Events, Themes, and more. This guide covers common issues across all these modules.

---

## E.1 Layman's Guide to "Finding and Fixing" Things (VaaS Solutions Maintenance)

Sometimes the VaaS Solutions website might not behave as expected. Most "bugs" are actually simple sync issues or browser-related quirks. Here is a guide to maintaining and fixing common problems specific to how VaaS Solutions works.

### 1. Sitemap Updates After CRUD Operations
**Issue:** You added, updated, or deleted content but search engines aren't finding it.

- **How It Works:** VaaS Solutions automatically regenerates the `sitemap.xml` file whenever you perform **CRUD operations** (Create, Read, Update, Delete) in the Admin Panel. This is handled by the `seo-automation` PM2 process.
- **What Gets Updated:** New pages (articles, events, podcasters, publications, etc.) are added to the sitemap. Deleted pages are removed.
- **The Fix:** Changes are applied immediately to the database. The sitemap regeneration happens in the background. No manual action is needed.

---

### 2. The "Stuck Content" & Cache Issues
**Issue:** The site feels slow or shows old content after you've made updates.

- **Why It Happens:** Your browser or CDN may be caching old content.
- **How to Fix:** 
    - **Windows:** `Ctrl + F5` (Force refresh)
    - **Mac:** `Cmd + Shift + R`
    - **Full Clear:** Go to Browser Settings → Privacy → Clear Cached Images and Files
- **Server-Side:** VaaS Solutions uses Redis for caching. If data seems permanently stuck, the technical team may need to clear the Redis cache.

---

### 3. SEO, AEO & Link Sharing
**Issue:** Shared links don't show proper previews, or content isn't appearing correctly for search engines/AI engines.

**VaaS Solutions SEO/AEO Features:**
- ✅ **React Helmet Async** — Dynamic meta tags (title, description, keywords) per page
- ✅ **JSON-LD Structured Data** — Schema markup for rich snippets in search results
- ✅ **Open Graph Tags** — Proper previews when sharing on Facebook, LinkedIn, WhatsApp
- ✅ **Twitter Cards** — Optimized previews for Twitter/X sharing
- ✅ **Share Menu Integration** — Built-in share buttons work correctly with all major crawlers
- ❌ **No Google News** — This project is not integrated with Google News

**Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| No image in share preview | **SVG images are not supported** for social previews | Use PNG, JPG, or WebP images (not SVG) for cover images |
| Old image showing | Social platforms cache previews 24-48 hours | Use [Facebook Debugger](https://developers.facebook.com/tools/debug/) or [LinkedIn Inspector](https://www.linkedin.com/post-inspector/) to force refresh |
| Missing description | Meta description field is empty | Fill in the meta description in Admin Panel |
| Wrong title showing | Old cached data | Clear cache and use debugger tools |

> **Important:** If your cover image is an SVG file, social media platforms (Facebook, WhatsApp, LinkedIn, Twitter) will NOT display it in link previews. Always use raster images (PNG, JPG, WebP) for cover/featured images.

---

### 4. The "Wrong Door" Problem (Login Confusion)
**Issue:** You're entering correct credentials but getting "Invalid Credentials" error.

- **Common Reality:** User Portal and Admin Portal are **completely separate systems**.
- **The Fix:** 
    - **Regular Users:** Click "Sign In" on https://vaas.solutions header (opens Auth Modal)
    - **Admins:** Go directly to https://vaas.solutions/admin/login
    - These have **different databases** — Admin credentials won't work on User login and vice versa.

---

### 5. Managing "Pending" Content
**Issue:** Too many pending articles, submissions, or registrations piling up.

- **Best Practice:** Admins should review pending content daily in:
    - **Article Submissions** — User-submitted articles
    - **Reporter Management** — Reporter registration requests
    - **Agency Management** — Agency registration requests
    - **Award Submissions** — Award nomination entries
    - **Paparazzi Management** — Photo submissions
    - **Theme Management** — Theme submissions
- **The Fix:** Approve, reject, or contact submitters within 48 hours to maintain workflow.

---

### 6. The "Copy-Paste" Mess (Editor Styling)
**Issue:** Pasted text from Word/websites looks weird with wrong fonts, colors, or spacing.

- **Why It Happens:** Word processors add hidden HTML/CSS that conflicts with the Quill editor.
- **The Fix:** 
    - Paste as **plain text**: `Ctrl + Shift + V` (Windows) or `Cmd + Shift + V` (Mac)
    - Or highlight messy text and use **"Clear Formatting"** in the editor toolbar

---



### 7. Image Aspect Ratio Issues
**Issue:** Images look "cut off" on cards or listings.

- **Why It Happens:** Card thumbnails use fixed aspect ratios (typically 16:9 or 4:3). Vertical images get cropped.
- **The Fix:** 
    - Use **landscape (horizontal)** images for cover photos
    - Keep the main subject **centered** so cropping doesn't cut important parts
    - Recommended minimum: **1200×630 pixels** for optimal display

---

### 8. Missing OTP or Verification Email
**Issue:** Not receiving OTP or verification emails.

**Checklist:**
1. ✅ Check **Spam/Junk** folder first
2. ✅ Wait 2-3 minutes (some providers delay external emails)
3. ✅ Verify email address is typed correctly (no typos like `.con`)
4. ✅ For phone OTP, ensure correct country code is included

**Service Accounts:**
- **Email (Brevo):** `menastories71@gmail.com`
- **SMS OTP (Message Central):** `advocatevandan28@gmail.com`

---

### 9. Pagination & Search in Admin Panel
**Issue:** Can't find older content in Admin list tables.

- **How It Works:** Admin tables show **10-20 items per page** for performance.
- **The Fix:**
    - Use **pagination buttons** (1, 2, 3... or Next) at bottom of tables
    - Use the **Search Bar** for faster results
    - Check **Status Filters** — you might be viewing "Active Only"

---

### 10. Password & Login Issues
**Issue:** Password is definitely correct but login fails.

**Common Causes:**
- **Caps Lock** is on (passwords are case-sensitive)
- **Trailing space** was copied with the password
- Using **wrong login portal** (Admin vs User)

**The Fix:** Re-type password manually without copy-paste. Verify you're at the correct login URL.

---

> ### 🚨 CRITICAL: "Site Can't Be Reached" Emergency
>
> If https://vaas.solutions shows **"502 Bad Gateway"** or **"Site Can't Be Reached"** for more than 5 minutes:
>
> 1. **Check if it's just you:** Visit [downforeveryoneorjustme.com/vaas.solutions](https://downforeveryoneorjustme.com/vaas.solutions)
> 2. **Force refresh:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
> 3. **Try another browser:** Extensions can cause issues
> 4. **Contact Technical Team** with:
>    - Error message screenshot
>    - URL you were accessing
>    - Time and timezone
>    - Browser/device info
>
> **Technical team may need to:**
> - Restart PM2 processes: `pm2 restart news-marketplace-backend`
> - Check Nginx configuration
> - Verify MongoDB connection

---

> ### 🛠️ "Spinning Wheel" or Slow Dashboard Fix
> 
> If the Admin Dashboard shows an endless loading spinner:
>
> 1. **Log out** completely
> 2. **Close** the browser tab
> 3. **Clear cache** (`Ctrl + Shift + Delete`)
> 4. **Reopen** https://vaas.solutions/admin/login and log in again
>
> This forces a fresh session and re-fetches data from MongoDB.

---

### 11. SSL Certificate Warning
**Issue:** Visitors see "Your Connection is Not Private" warning.

- **Cause:** SSL certificate expired or misconfigured on Nginx.
- **Users:** Try a different browser or device.
- **Admins:** Contact technical team immediately — this requires server-level intervention.

---

### 12. Dashboard Statistics Showing "0"
**Issue:** Statistics cards show "0" or "NaN" even though content exists.

- **Cause:** Session expired or API fetch failed.
- **The Fix:**
    1. Log out of Admin Panel
    2. Close browser tab completely
    3. Reopen https://vaas.solutions/admin/login
    4. Log back in — this forces fresh data fetch from MongoDB

---

## E.2 Frequently Asked Questions (VaaS Solutions Master List)

Here are the answers to the questions that VaaS Solutions users, reporters, agencies, and admins ask most frequently. These FAQs are based on the actual project structure and deployment configuration.

---

### 💼 Admin Panel & Management

**Q: How do I access the VaaS Solutions Admin Panel?**
> *A: Navigate to https://vaas.solutions/admin/login and enter your admin credentials. The Admin Panel is separate from the user login system.*

**Q: What are all the Admin Panel modules available?**
> *A: The Admin Panel includes 26 modules:*
> - **Dashboard** — Overview statistics and quick actions
> - **Affiliate Enquiries** — Manage affiliate program applications
> - **Agency Management** — Approve/reject agency registrations
> - **AI Articles** — Review AI-generated content from Gemini
> - **Article Submissions** — Approve user-submitted articles
> - **Award Submissions** — Manage award nominations
> - **Awards** — Create and manage award programs
> - **Blog Management** — Create/edit/publish blog articles
> - **Career Management** — Post and manage job listings
> - **Contact Management** — View and respond to contact form submissions
> - **Event Enquiries** — Handle event-related inquiries
> - **Event Management** — Create and manage events
> - **Group Management** — Manage categories and tags
> - **Paparazzi Management** — Approve/manage event photos
> - **Podcaster Management** — Manage podcaster profiles
> - **Power Lists** — Create and manage power lists/rankings
> - **Press Pack Management** — Manage downloadable press materials
> - **Publications** — Manage digital magazines
> - **Published Works Management** — Manage published work entries
> - **Radio Management** — Manage radio station listings
> - **Real Estate Management** — Manage property listings
> - **Reporter Management** — Approve/manage reporter accounts
> - **Roles & Permissions** — Configure admin access levels
> - **Theme Management** — Manage social media themes
> - **User Management** — Manage registered users
> - **Website Management** — Manage website submissions

**Q: I made a change in the Admin Panel, why isn't it live?**
> *A: Changes are typically instant as VaaS Solutions uses a dynamic API-driven architecture. However, cached content may take 2-3 minutes to refresh. Try `Ctrl + F5` to force-refresh. The SEO automation PM2 process regenerates sitemaps automatically.*

**Q: How do I approve a Reporter or Agency registration?**
> *A: Go to Admin → Reporter Management or Agency Management, find the pending request with "Pending" status, review the submitted information/documents (GSTIN, PAN for agencies), and click "Approve" or "Reject."*

**Q: Can I bulk upload data?**
> *A: Yes! Publications, Themes, Events, Podcasters, and Radio stations support bulk upload via CSV/Excel files. Use the "Bulk Upload" button and download the sample template first.*

**Q: What is "Group Management" for?**
> *A: Group Management handles categories, subcategories, and tags used across the platform. Create groups here before assigning them to articles, events, or other content.*

---

### ✍️ Content & Publishing

**Q: How do I submit an article as a user?**
> *A: Navigate to https://vaas.solutions/submit-article (requires login). Fill in the title, select category, add tags, upload a cover image, write your content using the Quill editor, and submit for admin review.*

**Q: How does the AI Article Generator work?**
> *A: Navigate to https://vaas.solutions/ai-article-questionnaire (requires login). The tool asks structured questions:*
> 1. **Topic** — What is the article about?
> 2. **Tone** — Professional, casual, informative, etc.
> 3. **Key Facts** — Main points to cover
> 4. **Context** — Background information
>
> *The system uses Google Gemini AI to generate a professional draft. You can then edit it in the built-in editor before submitting.*

**Q: What document formats are supported for Publications?**
> *A: PDF files are supported for digital magazines. The platform uses React PDF and React PageFlip to render an interactive Flipbook reading experience.*

**Q: Can I edit content after publishing?**
> *A: Yes. Go to the respective Admin module (Blog Management, Event Management, etc.), find your content, and click "Edit". Changes are saved immediately to the database.*

**Q: What is a "Slug" and why does it matter?**
> *A: A slug is the URL-friendly identifier. Example: "My Amazing Event 2026" becomes `my-amazing-event-2026`. Slugs are auto-generated but can be customized. Good slugs help with SEO.*

---

### 🌐 User Experience & Multi-Language

**Q: Which languages does VaaS Solutions support?**
> *A: The platform supports 6 languages: **English, Arabic (RTL), French, Hindi, Russian, and Chinese**. The translation is powered by a dedicated PM2 translator process running on the VPS.*

**Q: How does the translation system work?**
> *A: VaaS Solutions uses a PM2 process named `translator` that runs `translator.py` (using deep-translator library). Content is translated on-demand and cached for performance. Language files are stored in `frontend/src/locales/`.*

**Q: Does the site work on mobile devices?**
> *A: Yes! The site is fully responsive. The frontend uses React with responsive Tailwind CSS. Mobile navigation uses a sliding sidebar overlay.*

**Q: How do I share content on social media?**
> *A: Every listing card has a Share Menu with options for Facebook, Twitter, LinkedIn, WhatsApp, Telegram, and Copy Link. Hover (desktop) or tap (mobile) the share icon.*

---

### 🔐 Authentication & Security

**Q: What's the difference between User login and Admin login?**
> *A: They are completely separate systems:*
> - **User Login**: Click "Sign In" on vaas.solutions header → Opens Auth Modal → Stored in `users` table
> - **Admin Login**: Go to vaas.solutions/admin/login → Separate credentials → Stored in `admins` table with role-based permissions

**Q: How do I reset my password?**
> *A: Click "Forgot Password" in the Auth Modal or Admin login. Enter your email and you'll receive a reset link via Brevo email service.*

**Q: Is the site protected against spam?**
> *A: Yes, Google reCAPTCHA Enterprise is integrated on:*
> - User Registration
> - Contact Us form
> - Reporter/Agency Registration
> - Article Submission
> - All public forms

**Q: What is OTP verification used for?**
> *A: One-Time Passwords via SMS (Message Central) and Email (Brevo) are used for:*
> - Phone number verification during registration
> - Two-factor authentication (2FA)
> - Password reset confirmation

---

### 📧 Email & Notifications

**Q: What types of emails does VaaS Solutions send?**
> *A: Automated emails via Brevo include:*
> - Welcome emails on registration
> - OTP codes for verification
> - Password reset links
> - Article approval/rejection notifications
> - Reporter/Agency approval notifications
> - Contact form confirmations
> - Event registration confirmations

**Q: Why didn't I receive an email?**
> *A: Check these steps:*
> 1. Check Spam/Junk folders
> 2. Verify email address is correct (check for typos)
> 3. Wait 2-5 minutes (some providers delay external emails)
> 4. Brevo emails come from the platform domain
>
> *Admins: Check Brevo dashboard at `menastories71@gmail.com` account for delivery status.*

---

### 🏢 VaaS Solutions Modules (User-Facing)

**Q: How do I submit photos to Paparazzi?**
> *A: Visit https://vaas.solutions/paparazzi/submit (login required). Upload photos, add event details, date, photographer name, and price. Photos go to Admin → Paparazzi Management for approval.*

**Q: How do I submit a Theme to the marketplace?**
> *A: Visit https://vaas.solutions/themes/submit (login required). Provide:*
> - Platform (Instagram, TikTok, YouTube, etc.)
> - Handle/Username
> - Follower count
> - Niche/Category
> - Pricing
>
> *Themes are reviewed in Admin → Theme Management.*

**Q: How do I access Publications (Flipbook)?**
> *A: Visit https://vaas.solutions/publications to browse. Click any publication to open the interactive Flipbook viewer with page-turn animations.*

**Q: How do I find Podcasters?**
> *A: Visit https://vaas.solutions/podcasters. Use filters for category, platform (Spotify, Apple, etc.), and language. Click any podcaster to view their full profile with episode links.*

**Q: How do I register for an Event?**
> *A: Visit https://vaas.solutions/events, find your event, and click "Register" or "Show Interest". Some events have external registration links.*

**Q: How do I browse Radio Stations?**
> *A: Visit https://vaas.solutions/radio. Filter by region, language, or genre. Click any station to view details and streaming links.*

**Q: How do I view Power Lists?**
> *A: Visit https://vaas.solutions/power-lists. Power Lists showcase influential individuals in various categories. Click to view the full list and profiles.*

**Q: How do I access Press Packs?**
> *A: Visit https://vaas.solutions/press-packs. Press Packs contain downloadable brand assets (logos, images, PDFs) for media use.*

---

### 🖥️ Technical & Infrastructure

**Q: What technology stack does VaaS Solutions use?**
> *A: The platform uses:*
> - **Frontend**: React 18+, Vite, Tailwind CSS, Framer Motion
> - **Backend**: Node.js, Express.js
> - **Database**: MongoDB (primary data), Redis (caching/sessions)
> - **Storage**: AWS S3 (media files)
> - **Server**: Nginx (reverse proxy), PM2 (process manager)
> - **Hosting**: VPS deployment

**Q: What PM2 processes run on the VPS?**
> *A: The following PM2 processes are configured:*
> - **news-marketplace-backend** — Main Node.js/Express API server
> - **translator** — Python translation service (deep-translator)
> - **seo-automation** — Sitemap generation and SEO tasks
>
> *Note: The frontend is served directly by Nginx from the Vite production build, not as a separate PM2 process.*

**Q: How do I restart a PM2 process if something is stuck?**
> *A: SSH into the VPS and run:*
> ```bash
> pm2 restart news-marketplace-backend    # Restart backend API
> pm2 restart translator                  # Restart translation service
> pm2 restart seo-automation              # Restart SEO automation
> pm2 restart all                         # Restart all processes
> pm2 logs news-marketplace-backend       # View backend logs
> pm2 status                              # Check all process statuses
> ```
> *Only authorized technical personnel should perform these actions.*

**Q: How does Nginx work with VaaS Solutions?**
> *A: Nginx serves as a reverse proxy:*
> - Routes `/api/*` requests to the Node.js backend
> - Serves the React frontend build for all other routes
> - Handles SSL/HTTPS termination
> - Manages gzip compression and caching headers

**Q: How is SEO handled?**
> *A: VaaS Solutions implements comprehensive SEO:*
> - **React Helmet Async** — Dynamic meta tags per page
> - **JSON-LD Schema** — Structured data for rich snippets
> - **Sitemap Automation** — PM2 process regenerates `sitemap.xml` automatically
> - **Open Graph Tags** — Proper previews when sharing links

---

### 🔧 Troubleshooting

**Q: The Admin Dashboard shows "0" for statistics. What's wrong?**
> *A: This is usually a session or API fetch issue:*
> 1. Log out completely
> 2. Clear browser cache (`Ctrl + Shift + Delete`)
> 3. Log back in at https://vaas.solutions/admin/login
> 4. If persistent, check PM2 backend logs for API errors

**Q: Images are not loading or showing broken.**
> *A: Check these:*
> 1. The image might not be uploaded to AWS S3
> 2. S3 bucket permissions might have changed
> 3. The image URL might be incorrect in the database
>
> *Admins: Check the S3 bucket at `menastories71@gmail.com` AWS account.*

**Q: The translation isn't working for certain languages.**
> *A: Check the translator PM2 process:*
> ```bash
> pm2 logs translator
> pm2 restart translator
> ```
> *The deep-translator library has rate limits; high traffic may cause delays.*

**Q: Social media link previews show old/wrong images.**
> *A: Social platforms cache link previews for 24-48 hours. Use:*
> - **Facebook**: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → Scrape Again
> - **LinkedIn**: [Post Inspector](https://www.linkedin.com/post-inspector/)
> - **Twitter**: Wait 2-4 hours for automatic refresh

---

## E.3 VaaS Solutions Infrastructure & Service Contacts

### Third-Party Service Accounts

| Service | Purpose | Account | Module/Usage |
|---------|---------|---------|--------------|
| **AWS S3** | Media Storage | `menastories71@gmail.com` | Publication covers, Paparazzi photos, Profile avatars, Press Pack assets, Theme images |
| **Redis Cloud** | Caching & Sessions | `menastories71@gmail.com` | User sessions, API response caching, Rate limiting, Real-time data |
| **Brevo** | Email Delivery | `menastories71@gmail.com` | OTP emails, Welcome emails, Password resets, Approval notifications, Contact confirmations |
| **Google Gemini AI** | AI Article Generation | `menastories71@gmail.com` | `/ai-article-questionnaire` tool |
| **Google reCAPTCHA** | Form Security | `menastories71@gmail.com` | All public forms (Login, Register, Contact, Submissions) |
| **Message Central** | SMS OTP | `advocatevandan28@gmail.com` | Phone verification, 2FA via SMS |

### VPS Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Web Server** | Nginx | Reverse proxy, SSL termination, static file serving |
| **Process Manager** | PM2 | Node.js app lifecycle, auto-restart, logs |
| **Backend** | Node.js + Express | API server, business logic |
| **Frontend** | React + Vite | Single-page application |
| **Database** | MongoDB | Primary data storage |
| **Cache** | Redis | Session management, API caching |

### PM2 Process List

| Process Name | Script | Purpose |
|--------------|--------|---------|
| `news-marketplace-backend` | `server.js` | Main API server handling all `/api/*` routes |
| `translator` | `translator.py` | Python service for multi-language translation |
| `seo-automation` | Custom script | Regenerates sitemap.xml and handles SEO tasks |

> **Note:** The frontend is not a PM2 process. Nginx serves the static React/Vite production build directly from the `dist` folder.

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 29, 2026 | Initial document created with Admin Panel overview |
| 2.0 | January 29, 2026 | Comprehensive rewrite: Full detail for all 26 Admin modules (A.1–A.26) |
| 3.0 | January 29, 2026 | Added complete User-Facing Website documentation (Part B) with 25 sections |
| 4.0 | January 29, 2026 | Added Third-Party Tools & Backend Services documentation |
| 5.0 | January 29, 2026 | Added Maintenance & FAQs (Part E) with 17 troubleshooting scenarios and Master FAQ list |
| 6.0 | January 29, 2026 | Added Complete Design System Reference (Part D) with colors, typography, spacing, buttons, forms, animations, breakpoints, and icons |
| 6.1 | January 29, 2026 | Updated Part E with VaaS Solutions-specific URLs, module references, and platform terminology |
| 6.2 | January 29, 2026 | Complete FAQ rewrite with all 26 Admin modules, PM2 processes (translator, seo-automation), Nginx configuration, VPS infrastructure, and MongoDB/Redis details |

---

*Document maintained by the VaaS Solutions Development Team.*
*Platform URL: https://vaas.solutions*
*Admin Portal: https://vaas.solutions/admin/login*
*For urgent technical issues, contact the development team directly.*

---

# 7. Third Party Tools & Libraries

The VaaS Solutions platform leverages a suite of modern, robust third-party libraries and tools to deliver a high-performance, secure, and interactive user experience.

## 7.1 Core Framework & Build
*   **React (v18+)**: The foundational JavaScript library for building the user interface. It enables a component-based architecture for modularity and reusability.
*   **Vite**: Next-generation frontend tooling that provides a lightning-fast development server and optimized production builds.

## 7.2 Styling & UI Components
*   **Tailwind CSS**: A utility-first CSS framework used for rapid UI development and ensuring consistent design tokens (colors, spacing) across the platform.
*   **Styled Components**: Used for creating isolated, scoped styles for complex components that require dynamic styling based on props.
*   **Lucide React & React Icons**: Provides the comprehensive set of vector icons used throughout the application (e.g., in the Sidebar, dashboards, and informational cards).
*   **Framer Motion**: Powering the smooth animations and transitions seen in the feature slider, page loads, and interactive elements.

## 7.3 Data Management & Integration
*   **Axios**: A promise-based HTTP client used to handle all communication between the frontend React application and the backend API. It manages request headers (like Auth tokens) and response error handling.
*   **React Router DOM**: Manages client-side navigation, allowing users to move between pages (e.g., from Dashboard to Articles) without a full page reload.
*   **Firebase**: Integrated for specific real-time features and secure cloud-based data handling where applicable.

## 7.4 Content & Utilities
*   **Quill (React Quill)**: The rich-text editor embedded in the "Submit Article" and "Blog Management" pages, allowing users to format text, add links, and style their content comfortably.
*   **React Helmet Async**: Essential for the platform's SEO strategy. It dynamically updates the `<head>` of the document (Title, Meta Descriptions, OG Tags) based on the current page content.
*   **React Google Recaptcha**: Protects the platform's public forms (Registration, Contact Us) from automated bot spam.
*   **React Hot Toast**: Displays the non-intrusive popup notifications (success/error messages) seen when performing actions like saving a profile or submitting a form.

## 7.5 Specialized Media Tools
*   **React PDF & React PageFlip**: These libraries power the "Publications" section, enabling the interactive Flipbook reading experience for digital magazines.
*   **Three.js**: Incorporated for rendering advanced 3D graphical elements where high-fidelity visualizers are required.
*   **React Phone Number Input**: Ensures accurate monitoring and formatting of international user contact numbers during registration.

## 7.6 Testing & Quality Assurance
*   **Vitest**: A blazing fast unit test framework powered by Vite, used to verify the logic of individual components and utilities.
*   **React Testing Library**: Ensures components render correctly and behave as expected from a user's perspective.


## 7.7 Backend & Infrastructure Services

This section details the critical backend services integrated into VaaS Solutions, including their specific purposes and the administrative accounts associated with them.

### **1. AWS S3 (Amazon Simple Storage Service)**
*   **Account**: `menastories71@gmail.com`
*   **Purpose**: Acts as the centralized cloud storage repository for the entire platform.
*   **Detailed Usage**:
    *   **Media Storage**: Stores all user-uploaded content such as profile pictures, cover images for publications, and gallery photos for paparazzi events.
    *   **Document Management**: Securely houses essential documents like Press Pack assets (PDFs, ZIPs) and compliance documents uploaded by companies during registration.
    *   **Optimization**: Provides high availability and durability, ensuring that assets are loaded quickly for users globally without burdening the application server.

### **2. Redis (Redis Cloud)**
*   **Account**: `menastories71@gmail.com`
*   **Purpose**: A high-performance, in-memory data store used to optimize application speed and manage state.
*   **Detailed Usage**:
    *   **Session Management**: Stores active user session data, allowing for quick authentication checks without hitting the primary database on every request.
    *   **Caching**: Caches frequently accessed data (like homepage configuration or common API responses) to reduce latency and improve page load times.
    *   **Rate Limiting**: Used to track API usage and prevent abuse (e.g., limiting the number of OTP requests a user can make in a minute).

### **3. Brevo (formerly Sendinblue)**
*   **Account**: `menastories71@gmail.com`
*   **Purpose**: The platform's dedicated operational email engine.
*   **Detailed Usage**:
    *   **Transactional Emails**: Automatically sends critical system emails such as OTPs for login, "Welcome" emails upon registration, and Password Reset links.
    *   **Notification System**: Handles administrative alerts (e.g., "New Reporter Application Received") and user updates (e.g., "Your Article has been Approved").
    *   **Reliability**: Ensures high deliverability rates so important communication doesn't land in spam folders.

### **4. Google Gemini AI**
*   **Account**: `menastories71@gmail.com`
*   **Purpose**: Integrates cutting-edge Generative AI into the content creation workflow.
*   **Detailed Usage**:
    *   **AI Article Questionnaire**: Powers the `/ai-article-questionnaire` tool. When a user inputs raw facts or a topic, Gemini processes this structured input to generate a coherent, professional news article draft.
    *   **Efficiency**: Reduces the barrier to entry for content creators by automating the initial drafting process.

### **5. Google reCAPTCHA Enterprise**
*   **Account**: `menastories71@gmail.com`
*   **Purpose**: Advanced security layer to distinguish human users from automated bots.
*   **Detailed Usage**:
    *   **Form Protection**: Secured integration on sensitive entry points like the **Login**, **Registration**, and **Contact Us** forms.
    *   **Risk Analysis**: Analyzes user behavior (mouse movements, clicks) to assign a risk score. Requests deemed "high risk" are blocked, preventing brute-force attacks and spam submissions.

### **6. Message Central**
*   **Account**: `advoactevandan28@gmail.com`
*   **Purpose**: A specialized SMS gateway provider for mobile number verification.
*   **Detailed Usage**:
    *   **OTP Delivery**: When a user registers or logs in with a mobile number, Message Central triggers the immediate delivery of a One-Time Password via SMS.
    *   **2FA**: Adds a layer of security by verifying immediate possession of the registered mobile device.
