# Slane - The Minimalist Task Manager for Solo Builders

A clean, focused task management application designed specifically for solo builders, entrepreneurs, and developers who need to stay productive without the complexity of team-oriented tools.

## Overview

Slane is a modern, minimalist task manager built with Next.js 15 and powered by Supabase. It features AI-powered task assistance, intuitive drag-and-drop organization, and a distraction-free interface that helps you maintain flow state while managing your work.

## Features

### Core Task Management
- **Clean Interface**: Minimalist design focused on your tasks, not clutter
- **Drag & Drop**: Intuitive task reordering with visual feedback
- **Smart Filtering**: Quick access to all, todo, in-progress, and completed tasks
- **Priority Levels**: Organize tasks by low, medium, and high priority
- **Due Dates**: Set and track task deadlines with visual indicators
- **Task Status**: Todo, In Progress, Completed, and Cancelled states

### AI-Powered Features
- **Slane AI Assistant**: Built-in AI chat powered by Azure OpenAI
- **Intelligent Task Creation**: AI can create tasks from natural language
- **Task Analytics**: Get insights about your productivity and task patterns
- **Smart Suggestions**: AI-powered productivity recommendations

### User Experience
- **Command Palette**: Quick access to all features with keyboard shortcuts
- **Progressive Web App (PWA)**: Install and use like a native app
- **Mobile Optimized**: Fully responsive design for all devices
- **Keyboard Shortcuts**: Power user features for maximum efficiency
- **Real-time Sync**: Instant updates across all your devices

### Authentication & Security
- **Multiple Auth Methods**: Email/password and Google OAuth integration
- **Secure Sessions**: Supabase-powered authentication with PKCE flow
- **Rate Limiting**: Built-in protection against brute force attacks
- **CAPTCHA Protection**: hCaptcha integration after failed login attempts
- **Row-Level Security**: Database-level access controls

### Additional Features
- **User Preferences**: Customizable settings and preferences
- **Chat History**: Persistent AI conversation history
- **Export/Import**: Backup and restore your tasks
- **Privacy Focused**: Your data stays yours, no team sharing required

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **Radix UI**: Accessible, unstyled component primitives

### Backend & Database
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security**: Database-level access controls
- **Migrations**: Version-controlled database schema
- **Real-time Subscriptions**: Live updates for task changes

### AI & Integrations
- **Azure OpenAI**: GPT-powered AI assistant
- **hCaptcha**: Spam protection and bot detection
- **Vercel Analytics**: Privacy-focused analytics
- **Intercom**: Customer support integration

### Development Tools
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Automated code formatting
- **Husky**: Git hooks for quality assurance
- **TypeScript**: Strict type checking

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Azure OpenAI resource (for AI features)
- hCaptcha account (for security features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/slane.git
   cd slane
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```

4. **Configure Environment Variables**
   
   Edit `.env.local` with your credentials:
   
   **Supabase Configuration**
   - Get your URL and Anon Key from [Supabase Dashboard](https://app.supabase.com/)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   **Azure OpenAI Configuration (Optional)**
   - Create an Azure OpenAI resource in [Azure Portal](https://portal.azure.com/)
   ```env
   NEXT_PUBLIC_AZURE_ENDPOINT=https://your-resource-name.openai.azure.com/
   NEXT_PUBLIC_AZURE_API_KEY=your-azure-openai-api-key-here
   NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME=your-deployment-name
   NEXT_PUBLIC_AZURE_API_VERSION=2024-08-01-preview
   ```
   
   **hCaptcha Configuration (Optional)**
   - Get your site key from [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
   ```env
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key-here
   ```

5. **Database Setup**
   
   Run the included migrations in your Supabase project:
   ```bash
   # Apply migrations through Supabase CLI or Dashboard
   # Files are located in supabase/migrations/
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main tables:

- **tasks**: Core task data with user association
- **chat_conversations**: AI chat conversation grouping
- **chat_messages**: Individual AI chat messages
- **user_preferences**: User settings and customizations

All tables include Row Level Security policies for data protection.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript compiler check
- `npm run preview` - Build and preview production locally

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── tasks/             # Task management page
│   └── (auth)/            # Protected routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AIModal.tsx       # AI assistant interface
│   ├── TasksPageFull.tsx # Main task management UI
│   └── ...
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── hooks/                # Custom React hooks
│   ├── useTasks.ts       # Task management logic
│   ├── useAuthRedirect.ts# Authentication routing
│   └── ...
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Database client configuration
│   ├── aws-bedrock.ts    # AI service integration
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## Security Features

- **Row Level Security**: Database-level access controls
- **PKCE Flow**: Secure OAuth implementation
- **Rate Limiting**: Protection against brute force attacks
- **CAPTCHA Integration**: Bot detection and prevention
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Content Security Policy headers

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Progressive Web App features supported on compatible browsers.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Development Guidelines

- Follow TypeScript best practices
- Use the established component patterns
- Maintain test coverage for critical features
- Follow the existing code style (Prettier + ESLint)
- Update documentation for new features

## License

This project is private and proprietary. All rights reserved.

## Support

For support and questions:
- Visit [slane.app](https://slane.app)
- Use the in-app support chat
- Contact the development team

## Authors

- **Praneeth Narisetty** - Developer
- **Venkat** - Designer
- **Shiva Nagendra Babu Kore** - Developer

---

**Slane**
