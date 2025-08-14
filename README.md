# Kendraa - Healthcare Professional Networking Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

A modern, secure networking platform designed specifically for healthcare professionals to connect, collaborate, and advance their careers.

## 🏥 About Kendraa

Kendraa is the premier networking platform for healthcare professionals, designed to foster collaboration, knowledge sharing, and career growth in the medical community. Our platform combines the power of social networking with specialized features designed specifically for healthcare professionals.

### Key Features

- **Professional Networking** - Connect with healthcare professionals worldwide
- **Knowledge Sharing** - Share research, clinical insights, and medical innovations
- **Career Opportunities** - Discover job opportunities and research collaborations
- **Medical Events** - Stay updated with conferences and continuing education
- **Secure Messaging** - HIPAA-compliant communication system
- **Professional Analytics** - Track your professional growth and network expansion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/psmithul/kendra.git
   cd kendra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**
   ```bash
   # Run the database setup script
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Heroicons** - Beautiful SVG icons

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Advanced data protection
- **Real-time subscriptions** - Live updates

### Security
- **HIPAA Compliance** - Healthcare data protection
- **End-to-End Encryption** - Secure communications
- **Multi-Factor Authentication** - Enhanced security
- **Regular Security Audits** - Continuous monitoring

## 📁 Project Structure

```
kendraa/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── about/             # About page
│   └── profile/           # Profile pages
├── components/            # Reusable React components
│   ├── common/           # Common UI components
│   ├── layout/           # Layout components
│   ├── post/             # Post-related components
│   └── ui/               # Base UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:setup` - Set up database schema

## 🎨 Design System

Kendraa uses a comprehensive medical-themed color palette:

- **Primary**: Modern Medical Teal (#14b8a6)
- **Secondary**: Health Green (#22c55e)
- **Accent**: Professional Gold (#eab308)
- **Neutral**: Clean grays for medical professionalism

## 🔒 Security & Privacy

- **HIPAA Compliance** - Healthcare data protection standards
- **End-to-End Encryption** - Secure communication channels
- **Multi-Factor Authentication** - Enhanced account security
- **Regular Security Audits** - Continuous security monitoring
- **Data Privacy** - Granular privacy controls

## 📊 Features

### For Healthcare Professionals
- Professional profile creation and management
- Network building and connection management
- Knowledge sharing and content creation
- Career opportunity discovery
- Medical event participation
- Secure messaging with colleagues

### For Healthcare Institutions
- Organization profile management
- Job posting and recruitment
- Event hosting and management
- Analytics and insights
- Brand building and networking

## 🤝 Contributing

We welcome contributions from the healthcare and developer communities! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Maintain code documentation
- Follow our design system
- Ensure HIPAA compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.kendraa.com](https://docs.kendraa.com)
- **Email**: support@kendraa.com
- **Status Page**: [status.kendraa.com](https://status.kendraa.com)

## 🌟 Acknowledgments

- Healthcare professionals worldwide for their feedback and insights
- The Next.js and Supabase communities for excellent tooling
- Medical professionals who contributed to our design and feature decisions

---

**Kendraa - Connecting Healthcare Professionals Worldwide**

*Built with ❤️ for the healthcare community* 