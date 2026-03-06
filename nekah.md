# NEKAH - Advanced Maternal Health Platform

## Overview

NEKAH is a comprehensive maternal health application designed to support mothers throughout their pregnancy journey. It provides AI-powered health analysis, secure payment processing, live healthcare provider consultations, and real-time chat functionality. Key capabilities include mood tracking, AI-driven health analysis via camera capture, baby development tracking, AI-powered craving analysis, community support, emergency services, and paid consultations with certified maternal health specialists. The platform prioritizes a feminine design with soft colors and rounded aesthetics to create a complete healthcare ecosystem for expecting mothers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite.
- **Routing**: Wouter for client-side routing with hash-based navigation.
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with custom design tokens (pastel pinks, lavender, warm gold) and Poppins font.
- **State Management**: TanStack Query for server state; local React state for UI.

### Page Structure
- **Welcome Screen**: Animated entry point.
- **Home Page**: Main dashboard with feature tiles and carousels.
- **Feature Pages**: Dedicated screens for GlowTalk (mood tracking), BumpCheck (health analysis), Baby Tracker, Cravings analyzer, Community, Profile, Emergency services, and Doctor Eye (paid consultations).
- **Navigation**: Persistent bottom navigation bar with a floating emergency button.

### Data Storage Strategy
- **Local Storage Service**: Custom wrapper for browser localStorage for user data persistence.
- **AI Analysis Storage**: Real OpenAI API responses cached locally.
- **Healthcare Provider Data**: Live doctor network with real-time availability.
- **Payment Records**: Stripe payment intent tracking.
- **Chat Message History**: Real-time message storage.
- **User Profile Management**: Onboarding data stored locally.
- **Data Types**: Strongly typed interfaces for various models (UserProfile, MoodEntry, etc.).

### Key Features & Technical Implementations
- **BumpCheck Real-Time Solutions**: Provides immediate, actionable health solutions across seven categories (treatments, topicals, home remedies, etc.) with step-by-step protocols.
- **Profile Photo Management**: Full implementation of user profile photo upload, camera capture, file upload, Replit object storage integration, and real-time previews.
- **Advanced Medical Scan Analysis with AI**: Integrated OpenAI vision API for detailed X-ray/ultrasound interpretation, including fetal position, gender prediction, biometric measurements, and clinical recommendations.
- **Google Maps Exercise Tracking**: Integrated Google Maps API for GPS route tracking, distance measurement, and workout session recording with live positioning and polyline visualization.
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support, high contrast mode, keyboard navigation, reduced motion, and voice control integration.
- **Internationalization**: Multi-language support (16 languages) including RTL (Arabic), browser language auto-detection, and locale-aware formatting.
- **Progressive Web App (PWA)**: Full offline functionality with intelligent caching (Service Worker), background sync, push notifications, and connection status monitoring.
- **Mobile Optimization**: Complete mobile responsiveness with touch-friendly interfaces and optimized layouts.
- **Emergency Medical Response System**: Critical response for non-food cravings (pica), triggering immediate medical attention recommendations.
- **Comprehensive Profile Management**: Full profile editing, notification settings, privacy settings, and help/support system.
- **Real AI Health Analysis**: Integrated OpenAI API for genuine health assessment and AI-powered craving safety analysis based on clinical research.
- **WHO Medical Guidelines Integration**: Comprehensive clinical document integration from multiple medical sources for hospital-grade diagnostic accuracy.
- **Payment Processing**: Stripe integration for secure consultation payments.
- **Real-Time Consultation System**: Socket.IO powered live chat between patients and doctors with session management and secure payment verification.

### UI/UX Decisions
- Feminine design with soft color palette (pastel pinks, lavender, warm gold).
- Rounded aesthetics for a modern appearance.
- Professional visual interface with color-coded solution cards, progress indicators, and emergency warning systems for BumpCheck.
- Professional report generation for medical scan analysis.
- Advanced CSS animations and visual enhancements (e.g., animated glowing effects for baby development).
- Responsive design across all features.

## External Dependencies

### AI and Healthcare Services
- **OpenAI API**: For AI-powered health analysis, medical scan interpretation, and craving safety evaluation.
- **Stripe API**: For secure payment processing of healthcare consultations.
- **Socket.IO**: For real-time bidirectional communication in doctor-patient chat.

### UI and Styling
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### Development and Build Tools
- **Vite**: Frontend build tool.
- **TypeScript**: For type safety.

### Backend Services
- **Express.js**: Node.js web framework for API endpoints.
- **Drizzle ORM**: Database toolkit (configured for PostgreSQL).
- **Neon Database**: Serverless PostgreSQL provider.
- **Uppy**: File upload library (integrated with Google Cloud Storage for images).