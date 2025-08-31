# 🏛️ Treaty - AI-Powered Contract Analysis Platform

> **Intelligent contract analysis powered by AI to help you identify risks, opportunities, and negotiation points in seconds.**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🚀 Overview

Treaty is a modern, AI-powered contract analysis platform that helps legal professionals, businesses, and individuals quickly analyze contracts for risks, opportunities, and negotiation points. Built with Next.js 14 and powered by Google's Gemini AI, Treaty provides instant insights into contract documents with a beautiful, responsive interface.

### ✨ Key Benefits

- **⚡ Instant Analysis**: Get comprehensive contract insights in seconds
- **🤖 AI-Powered**: Leverages Google Gemini for intelligent analysis
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🔒 Secure**: Enterprise-grade security with Supabase authentication
- **📊 Visual Insights**: Clear risk scoring and opportunity identification
- **🌙 Modern UI**: Beautiful interface with dark/light theme support

## 🎯 Features

### 🔍 Contract Analysis
- **50+ Contract Types**: Supports employment, NDA, MSA, SaaS, consulting, and many more
- **Risk Assessment**: AI-powered risk identification with severity levels (High/Medium/Low)
- **Opportunity Detection**: Identifies favorable terms and negotiation leverage points
- **Clause Extraction**: Automatically extracts and analyzes key contract clauses
- **Score Calculation**: Comprehensive risk scoring system with visual donut charts

### 📱 User Experience
- **Responsive Design**: Optimized for all devices and screen sizes
- **Theme Toggle**: Dark and light mode support
- **Real-time Feedback**: Live password strength validation
- **Progress Indicators**: Visual feedback during analysis
- **Error Handling**: Graceful error handling with user-friendly messages

### 🔐 Security & Authentication
- **Supabase Auth**: Secure user authentication and session management
- **Email Verification**: Required email verification for new accounts
- **Strong Password Policy**: Enforces strong password requirements
- **Session Management**: Automatic token refresh and secure session handling
- **Protected Routes**: Secure access to dashboard and analysis results

### 📊 Dashboard & Results
- **Contract Management**: Upload, analyze, and manage multiple contracts
- **Analysis History**: Track all your contract analyses
- **Detailed Reports**: Comprehensive analysis with actionable insights
- **Export Options**: Save and share analysis results
- **Search & Filter**: Easy navigation through your contract library

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Backend & AI
- **Google Gemini AI**: Advanced AI contract analysis
- **Supabase**: Database, authentication, and storage
- **PostgreSQL**: Reliable database system
- **Edge Functions**: Serverless backend processing

### UI Components
- **Shadcn/ui**: High-quality, accessible UI components
- **Lucide Icons**: Beautiful, consistent iconography
- **Recharts**: Interactive charts and data visualization
- **Sonner**: Elegant toast notifications

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality
- **TypeScript**: Static type checking

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (LTS version recommended)
- **npm** or **yarn** package manager
- **Supabase account** for backend services
- **Google AI API key** for Gemini integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/treaty.git
   cd treaty
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_gemini_api_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=url
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/`
   - Configure authentication settings

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to url

## 📁 Project Structure

```
treaty/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (actions)/          # Server actions
│   │   ├── (protected)/        # Protected routes
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── results/            # Analysis results
│   │   ├── signin/             # Authentication
│   │   ├── privacy/            # Privacy policy
│   │   ├── terms/              # Terms of service
│   │   └── contact/            # Contact page
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── marketing/          # Landing page components
│   │   ├── results/            # Results page components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── supabase-*.ts       # Supabase clients
│   │   └── analysis-schema.ts  # AI analysis schemas
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
│   ├── logos/                  # Company logos
│   └── images/                 # Other images
├── supabase/                   # Database migrations
└── package.json                # Dependencies and scripts
```

## 🔌 API Integration

### Google Gemini AI

The platform integrates with Google's Gemini AI for intelligent contract analysis:

```typescript
// Example AI analysis request
const analysis = await analyzeWithGemini({
  contractText: documentContent,
  contractType: "Employment Agreement"
})
```

**Supported Contract Types:**
- Employment & HR contracts
- Business agreements (MSA, SOW, etc.)
- Legal documents (NDA, contracts, etc.)
- Financial agreements
- Service contracts
- And 40+ more types

### Supabase Integration

- **Authentication**: User management and session handling
- **Database**: Contract storage and analysis results
- **Storage**: Document file management
- **Real-time**: Live updates and notifications

## 🔐 Authentication

### Features
- **Email/Password**: Traditional authentication
- **Email Verification**: Required for new accounts
- **Session Management**: Automatic token refresh
- **Protected Routes**: Secure access control
- **Password Strength**: Enforced strong passwords

### Security Measures
- JWT token-based authentication
- Secure password hashing
- CSRF protection
- Rate limiting
- Input validation and sanitization

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Other Platforms

- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment
- **AWS**: Scalable cloud deployment

### Environment Variables

Ensure all required environment variables are set in your production environment:

```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_AI_API_KEY
NEXT_PUBLIC_APP_URL
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all tests pass
- Update documentation as needed
- Follow the existing code style


## 📞 Support & Contact

- **Email**: [syedmuhammadalihassan2002@hotmail.com](mailto:syedmuhammadalihassan2002@hotmail.com)

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent contract analysis
- **Supabase** for backend infrastructure
- **Next.js Team** for the amazing framework
- **Shadcn/ui** for beautiful UI components
- **Open Source Community** for inspiration and tools

---

**Made with ❤️ by Syed Muhammad Ali Hassan **

*Transform your contract analysis workflow with AI-powered insights.*
