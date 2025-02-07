# AIRPG: AI-Powered Research Paper Generator

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

### PDF Features
- Live PDF preview during editing
- Professional academic formatting
- Citation style enforcement
- Export functionality
- Tables and figures rendering

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Heroicons for UI icons
- Firebase Authentication
- PDF.js for PDF preview

### Backend
- Node.js Express server
- Firebase Firestore database
- OpenAI API for content generation
- Firebase Authentication
- PDF generation service

## Setup and Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd research-paper-assistant
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd research-paper-assistant
npm install

# Install backend dependencies
cd backend
npm install
```

3. Configure environment variables:

Frontend (.env):
```
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Backend (.env):
```
OPENAI_API_KEY=your-openai-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Start the development servers:

Frontend:
```bash
cd research-paper-assistant
npm run dev
```

Backend:
```bash
cd backend
npm start
```

## Usage Workflow

1. **User Authentication**
   - Sign up or sign in to access the system
   - Secure authentication through Firebase

2. **Paper Generation**
   - Click "Generate Paper" button
   - Enter research topic and paper title
   - Select citation style
   - Monitor real-time generation progress

3. **Paper Management**
   - View list of generated papers
   - Open papers for editing
   - Delete unwanted papers

4. **Editing and Preview**
   - Edit content in the text editor
   - See real-time PDF preview
   - Format content and manage citations
   - Download final PDF

## API Integration

### OpenAI API
- Used for generating research paper content
- Implements specific content requirements
- Handles academic writing style

### Firebase
- Authentication and user management
- Real-time database for paper storage
- Document and citation management

## Project Structure

```
research-paper-assistant/
├── src/
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and Firebase services
│   ├── styles/            # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── backend/
│   ├── server.js         # Express server
│   └── services/         # Backend services
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
