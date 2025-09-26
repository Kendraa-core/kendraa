# Kendraa 🏥

**Royal Network for Healthcare Professionals**

A comprehensive healthcare professional networking platform that connects medical professionals, institutions, and organizations worldwide. Built with Next.js, Supabase, and modern web technologies.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## 🌟 Overview

Kendraa is a specialized social network designed exclusively for healthcare professionals, medical institutions, and healthcare organizations. Our platform facilitates meaningful connections, knowledge sharing, career advancement, and professional collaboration within the medical community.

## ✨ Key Features

### 👤 **User Management & Authentication**
- **Dual Account Types**: Individual professionals and institutional accounts
- **Secure Authentication**: Email/password with OTP verification
- **Profile Types**: Medical professionals, researchers, institutions, hospitals
- **Password Recovery**: Secure reset via email
- **Account Verification**: Professional credential verification system

### 🏥 **Professional Profiles**

#### Individual Profiles
- **Medical Credentials**: Licenses, certifications, specializations
- **Professional Experience**: Work history, positions, achievements  
- **Education Background**: Medical school, residency, fellowships
- **Research Interests**: Publications, ongoing research, collaborations
- **Specializations**: 23+ medical specialties supported
- **Profile Analytics**: Views, connections, engagement metrics

#### Institution Profiles  
- **Organization Information**: Type, size, establishment year
- **Location & Contact**: Address, phone, email, website
- **Specialties & Services**: Medical departments and services offered
- **Accreditation**: Certifications and regulatory approvals
- **Verification Status**: Verified institution badges
- **About Section**: Mission, vision, and institutional overview

### 🤝 **Networking & Connections**
- **Professional Networking**: Connect with healthcare professionals globally
- **Institution Following**: Follow hospitals, research centers, organizations  
- **Connection Management**: Organize and manage professional relationships
- **Network Analytics**: Track network growth and engagement
- **Suggested Connections**: AI-powered professional recommendations
- **Following System**: Stay updated with colleagues and institutions

### 📱 **Social Features**

#### Posts & Content Sharing
- **Rich Text Posts**: Share insights, research, professional updates
- **Media Support**: Images, documents, and attachments
- **Post Analytics**: Views, engagement, reach metrics
- **Content Categories**: Medical insights, research, career updates

#### Advanced Reactions System
- **6 Reaction Types**: Like, Love, Celebrate, Support, Insightful, Curious
- **Emotional Engagement**: Express professional appreciation and support
- **Reaction Analytics**: Track post performance and engagement

#### Comments & Discussions
- **Threaded Comments**: Nested discussions on posts
- **Comment Reactions**: React to individual comments
- **Professional Discourse**: Moderated medical discussions
- **Reply System**: Engage in meaningful conversations

### 💼 **Career & Opportunities**

#### Job Board
- **Job Posting**: Institutions can post medical positions
- **Advanced Filters**: Location, specialty, experience level, job type
- **Application Management**: Apply with cover letter and resume
- **Job Types**: Full-time, part-time, contract, internship, volunteer
- **Salary Information**: Compensation ranges and benefits
- **Application Tracking**: Track application status and responses

#### Job Features
- **Medical Specializations**: 23+ specialties supported
- **Work Arrangements**: On-site, remote, hybrid options
- **Experience Levels**: Entry to executive level positions
- **Benefits Package**: Comprehensive benefits information
- **Application Deadline**: Time-sensitive applications
- **Contact Information**: Direct employer contact details

### 📅 **Events Management**
- **Event Creation**: Medical conferences, workshops, seminars
- **Event Categories**: CME, research, networking, educational
- **Registration System**: Event sign-up and management
- **Event Analytics**: Attendance tracking and engagement
- **Past Events**: Archive of completed events
- **Event Filtering**: By date, type, location, specialty
- **My Events**: Personal event management dashboard

### 🔍 **Search & Discovery**
- **Global Search**: Find professionals, institutions, content
- **Advanced Filters**: Specialty, location, experience, institution type
- **Smart Suggestions**: AI-powered recommendations
- **Search Analytics**: Track popular searches and trends

### 📊 **Analytics & Insights**
- **Profile Analytics**: Views, connections, engagement metrics
- **Post Performance**: Detailed post analytics and reach
- **Network Growth**: Track professional network expansion
- **Engagement Metrics**: Reactions, comments, shares, saves
- **Institution Analytics**: Organizational performance metrics

### 📱 **Mobile Experience**
- **Responsive Design**: Optimized for all devices
- **Mobile-First**: Dedicated mobile interface at `/mob`
- **Mobile Navigation**: Bottom navigation for easy access
- **Touch Optimized**: Mobile-friendly interactions
- **Offline Support**: Basic offline functionality
- **Mobile Headers**: Contextual mobile headers

#### Mobile Features
- **Mobile Feed**: Optimized content consumption
- **Mobile Jobs**: Job browsing and applications
- **Mobile Events**: Event discovery and registration  
- **Mobile Network**: Professional networking on-the-go
- **Mobile Settings**: Account management
- **Mobile Profiles**: Profile viewing and editing

### 🔔 **Notifications System**
- **Real-time Notifications**: Instant updates on activities
- **Notification Categories**: Connections, posts, jobs, events
- **Email Notifications**: Important updates via email
- **Push Notifications**: Mobile app notifications
- **Notification Preferences**: Customizable notification settings

### ⚙️ **Settings & Preferences**
- **Account Settings**: Profile management and preferences
- **Privacy Controls**: Visibility and privacy settings
- **Notification Settings**: Customize notification preferences
- **Security Settings**: Password and security management
- **Data Management**: Export and delete account data

### 🎨 **Design System**
- **Modern UI/UX**: Clean, professional healthcare-focused design
- **Brand Colors**: Consistent blue (#007fff) theme throughout
- **Responsive Components**: Mobile-first design approach
- **Accessibility**: WCAG compliant design standards
- **Dark Mode Support**: Professional dark theme option
- **Animation System**: Smooth transitions and micro-interactions

### 🔒 **Security & Privacy**
- **HIPAA Compliant**: Healthcare data protection standards
- **Secure Messaging**: Private professional communications
- **Data Encryption**: End-to-end encryption for sensitive data
- **Privacy Controls**: Granular privacy settings
- **Professional Verification**: Identity and credential verification
- **Secure File Sharing**: Protected document sharing

## 🛠️ **Technical Stack**

### Frontend
- **Framework**: Next.js 15.4.3 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.3.0
- **UI Components**: Custom component library
- **Icons**: Heroicons 2.0
- **Animations**: Framer Motion 12.23
- **State Management**: React Context API

### Backend & Database  
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for files and media
- **Real-time**: Supabase real-time subscriptions
- **API**: Next.js API routes with TypeScript

### Development Tools
- **Package Manager**: npm 8.0+
- **Code Quality**: ESLint, TypeScript strict mode
- **Bundling**: Next.js built-in bundler
- **Development**: Hot reload, TypeScript checking
- **Deployment**: Vercel, Netlify support

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/psmithul/kendra.git
   cd kendraa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   ```bash
   npm run setup-storage
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run type-check       # TypeScript type checking
npm run lint            # ESLint code linting

# Production
npm run build           # Build for production
npm run start           # Start production server
npm run build:production # Production build with optimizations

# Deployment
npm run deploy:prepare  # Prepare for deployment
npm run deploy:vercel   # Deploy to Vercel
npm run deploy:netlify  # Deploy to Netlify
```

## 📱 **Mobile Access**

Kendraa provides a dedicated mobile experience:

- **Mobile URL**: `/mob` for individuals, `/mob/institution` for institutions
- **Auto-detection**: Automatic mobile device detection and redirection
- **Native Feel**: App-like mobile interface with bottom navigation
- **Offline Support**: Basic offline functionality for mobile users

## 🏥 **User Types & Onboarding**

### Individual Professionals
- **Target Users**: Doctors, nurses, researchers, medical students
- **Onboarding**: Professional profile setup with credentials
- **Features**: Networking, job applications, content sharing
- **Verification**: Medical license and credential verification

### Healthcare Institutions
- **Target Users**: Hospitals, clinics, research centers, universities
- **Onboarding**: Institutional profile setup and verification
- **Features**: Job posting, event hosting, professional recruitment
- **Verification**: Institutional accreditation verification

## 🌍 **Supported Specialties**

Kendraa supports 23+ medical specialties:
- Cardiology, Neurology, Oncology, Pediatrics
- Psychiatry, Surgery, Emergency Medicine
- Family Medicine, Internal Medicine, Radiology
- Anesthesiology, Pathology, Dermatology
- Ophthalmology, Orthopedics, OB/GYN
- And many more...

## 📈 **Analytics & Reporting**

### Profile Analytics
- Profile views and visitor demographics
- Connection growth and network analysis
- Content engagement metrics

### Post Analytics  
- Post reach and impressions
- Reaction breakdown and engagement rates
- Comment and share analytics

### Institution Analytics
- Organizational profile performance
- Job posting effectiveness
- Event attendance and engagement

## 🔧 **API Documentation**

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication  
- `POST /api/auth/signout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Profile Management
- `GET /api/profiles/:id` - Get profile data
- `PUT /api/profiles/:id` - Update profile
- `GET /api/profiles/:id/analytics` - Profile analytics

### Social Features
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/react` - React to post
- `POST /api/posts/:id/comment` - Comment on post

## 🤝 **Contributing**

We welcome contributions from the healthcare and developer communities!

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and ESLint standards
4. Add comprehensive tests
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting standards
- **Naming**: Descriptive variable and function names
- **Comments**: JSDoc for complex functions

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### Getting Help
- **Documentation**: Check our comprehensive docs
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join our healthcare professional community
- **Email**: Contact our support team

### Help Center
Available at `/help` with comprehensive guides for:
- Getting started with your medical profile
- Privacy settings and data protection
- Networking and professional connections
- Account management and settings

## 🔮 **Roadmap**

### Version History
- **v0.1.0**: Initial release with core features
- **Future**: Enhanced mobile experience, AI features

---

**Built with ❤️ by the Kendraa Team**

*Connecting healthcare professionals worldwide, one connection at a time.*


---

*For more information, visit [kendraa.com](https://kendraa.com)*
