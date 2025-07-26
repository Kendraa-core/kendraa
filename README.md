# Kendraa - Professional Network for Healthcare

Kendraa is a modern professional networking platform specifically designed for healthcare professionals, institutions, and organizations. Built with Next.js 14, Supabase, and Tailwind CSS, it offers a premium and elegant user experience.

## Features

### User Management
- Secure authentication with email/password
- Automatic profile creation on signup
- Detailed professional profiles with resume-like details
- Profile picture and banner image support

### Professional Networking
- Connect with other healthcare professionals
- Send and manage connection requests
- View mutual connections
- Follow organizations and institutions

### Organizations & Institutions
- Create and manage organization pages
- Multiple admin roles (owner, admin, editor)
- Organization verification system
- Post updates and announcements
- Track followers and employees

### Posts & Engagement
- Create and share professional posts
- Support for text and image content
- Like and comment on posts
- Real-time notifications

### Modern UI/UX
- Responsive design for all devices
- Smooth animations with Framer Motion
- Premium, elegant interface
- Optimized loading performance

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Data Fetching**: Server Components, SWR
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/psmithul/kendraa.git
   cd kendraa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project details.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 