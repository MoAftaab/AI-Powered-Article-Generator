# Research Paper Assistant

An AI-powered research paper generation and management system that helps users create, edit, and format academic papers with real-time preview and collaborative features.

## Features

### Paper Generation
- AI-powered research paper generation based on user-provided topics
- Structured paper sections following academic standards
- Support for multiple citation styles (APA, MLA, Chicago, IEEE)
- Real-time generation progress tracking
- Smart content generation with specified section lengths

### Document Management
- Paper organization with title and abstract previews
- Real-time editing capabilities
- Section-based content organization
- Delete and manage existing papers
- Back-navigation and progress preservation

### Editor Features
- Split-view interface with PDF preview
- Real-time content updates
- Citation management
- Tables and figures support
- Content formatting tools

## Getting Started

### Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/MoAftaab/GenAIScholar-AI-Research-Paper-Generator-.git
cd GenAIScholar-AI-Research-Paper-Generator
```

2. Create `.env` file in the root directory:
```env
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

3. Build and run with Docker:
```bash
# Build and start containers
docker-compose up --build

# Stop containers
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:80
- Backend API: http://localhost:3001

### Manual Setup

1. Install dependencies:
```bash
# Frontend dependencies
cd research-paper-assistant
npm install

# Backend dependencies
cd backend
npm install
```

2. Configure environment variables:

Frontend (.env):
```env
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Backend (.env):
```env
OPENAI_API_KEY=your-openai-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

3. Start development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Firebase Authentication
- PDF.js for PDF preview

### Backend
- Node.js Express server
- Firebase Firestore database
- OpenAI API integration
- PDF generation service

## Docker Components

### Frontend Container
- Node.js 18 Alpine for build
- Nginx for serving static files
- Environment variables injection
- Hot-reload for development

### Backend Container
- Node.js 18 Alpine
- Volume mounting for development
- Environment variables management
- API endpoint exposure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Developer

Developed by [MOHD AFTAAB](https://github.com/MoAftaab)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
