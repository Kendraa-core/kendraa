# Kendraa - Royal Network for Healthcare Professionals

A premium professional networking platform designed specifically for healthcare professionals. Connect with peers, discover opportunities, and advance your medical career with Kendraa.

## 🚀 Features

### Core Functionality
- **Professional Networking**: Connect with healthcare professionals worldwide
- **Job Opportunities**: Discover and apply to healthcare positions
- **Messaging System**: HIPAA-compliant communication tools
- **Event Management**: Create and attend professional events
- **Profile Management**: Comprehensive professional profiles
- **Institution Support**: Dedicated features for healthcare institutions

### Technical Features
- **Real-time Messaging**: Instant communication between connected users
- **Search & Discovery**: Advanced search with filters
- **Notifications**: Real-time notifications for connections and messages
- **Responsive Design**: Optimized for all devices
- **Performance Optimized**: Fast loading times and smooth interactions

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database, Auth, Real-time)
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 8+
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/psmithul/thinkify-2.git
   cd linkedin-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Update your environment variables with the Supabase credentials

5. **Development**
   ```bash
   npm run dev
   ```

6. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   - Add your Supabase credentials in Vercel dashboard
   - Set `NEXT_PUBLIC_APP_URL` to your production domain

### Other Platforms

#### Netlify
```bash
npm run build
# Deploy the .next folder
```

#### Railway
```bash
# Connect your GitHub repository
# Railway will auto-detect Next.js and deploy
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Database Schema

The application uses the following main tables:
- `profiles` - User profiles
- `posts` - Social media posts
- `connections` - User connections
- `jobs` - Job listings
- `events` - Professional events
- `conversations` - Messaging conversations
- `messages` - Individual messages

## 📱 Usage

### For Healthcare Professionals

1. **Sign Up**: Create your professional profile
2. **Connect**: Find and connect with other professionals
3. **Network**: Join conversations and share insights
4. **Discover**: Find job opportunities and events
5. **Message**: Communicate with your connections

### For Healthcare Institutions

1. **Create Institution Profile**: Set up your organization
2. **Post Jobs**: Share career opportunities
3. **Host Events**: Create professional events
4. **Network**: Connect with healthcare professionals

## 🔒 Security

- **HIPAA Compliance**: Messaging system designed for healthcare privacy
- **Authentication**: Secure user authentication via Supabase
- **Data Protection**: Encrypted data transmission
- **Privacy Controls**: User-controlled privacy settings

## 🚀 Performance

### Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component optimization
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Strategic caching for better performance

### Monitoring
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Built-in performance metrics
- **Analytics**: Google Analytics integration ready

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Analytics

The application is ready for analytics integration:
- Google Analytics
- Mixpanel
- Hotjar
- Custom event tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@kendraa.com
- Documentation: [docs.kendraa.com](https://docs.kendraa.com)

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced search filters
- [ ] Video calling integration
- [ ] Mobile app development
- [ ] AI-powered recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Performance Improvements
- [ ] Service Worker implementation
- [ ] Advanced caching strategies
- [ ] CDN optimization
- [ ] Database query optimization

---

**Built with ❤️ for the healthcare community** 