# Frontend - RAG Study Helper

A modern React-based frontend for the RAG Study Helper application, providing an intuitive interface for AI-powered learning and study management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm preview
```

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api.js                # API client & HTTP interceptors
│   ├── constants.js          # Application constants
│   ├── main.jsx             # Application entry point
│   ├── App.jsx              # Main app component with routing
│   ├── index.css            # Global styles & CSS variables
│   │
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui component library
│   │   ├── ChatInterface.jsx        # AI chat interface
│   │   ├── ChatSessionSelector.jsx  # Chat session management
│   │   ├── NotesSection.jsx         # Notes management
│   │   ├── VideosSection.jsx        # Video management
│   │   ├── FlashcardsSection.jsx    # Flashcard generation
│   │   ├── ResourcesSection.jsx     # Learning resources
│   │   └── protectedroute.jsx       # Authentication wrapper
│   │
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Workspace dashboard
│   │   ├── Login.jsx       # Authentication page
│   │   ├── Workspace.jsx   # Main workspace interface
│   │   └── NotFound.jsx    # 404 error page
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useChat.js      # Chat functionality
│   │   ├── useUser.js      # User management
│   │   ├── useNotes.js     # Notes operations
│   │   └── useVideos.js    # Video operations
│   │
│   ├── lib/                # Utility functions
│   │   └── utils.js        # Tailwind class utilities
│   │
│   └── styles/             # Component-specific styles
│       ├── Button.css
│       ├── Chat.css
│       ├── Home.css
│       └── ...
│
├── package.json            # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── eslint.config.js       # ESLint configuration
└── components.json        # shadcn/ui configuration
```

## 🛠 Technology Stack

### Core Framework
- **React 18** - Modern React with functional components and hooks
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing

### UI & Styling
- **Tailwind CSS v3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful SVG icon library
- **tailwindcss-animate** - Animation utilities

### State Management & Data
- **Custom Hooks** - Centralized state management
- **Axios** - HTTP client with interceptors
- **JWT Decode** - Token handling

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🏗 Architecture Overview

### Component Architecture
```
App (Routing)
├── ProtectedRoute (Authentication)
├── Home (Workspace Dashboard)
└── Workspace (Main Interface)
    ├── ChatInterface (AI Chat)
    ├── NotesSection (Document Management)
    ├── VideosSection (Video Management)
    ├── FlashcardsSection (Study Tools)
    └── ResourcesSection (Learning Resources)
```

### Data Flow
```
API Layer (api.js) ↔ Custom Hooks ↔ React Components ↔ UI Components
```

### Authentication Flow
```
Login → JWT Storage → Protected Routes → API Interceptors → Auto-refresh
```

## 🎨 Design System

### Color Scheme
- **Primary**: Indigo/Purple gradients
- **Secondary**: Gray scale
- **Accent**: Blue/Purple combinations
- **Background**: White with gradient overlays

### Layout Patterns
- **Responsive Design**: Mobile-first approach
- **Glass Morphism**: Backdrop blur effects
- **Card-based Layout**: Consistent spacing and shadows
- **Gradient Accents**: Modern visual appeal

### Typography
- **Font Family**: System fonts for performance
- **Scale**: Tailwind's type scale (text-sm, text-base, etc.)
- **Weight**: Strategic use of font weights for hierarchy

## 🔧 Key Features

### 1. Authentication System
- **Login/Register**: Secure JWT-based authentication
- **Profile Images**: Upload and display user avatars
- **Protected Routes**: Automatic redirection for unauthorized users
- **Token Management**: Auto-refresh with interceptors

### 2. Workspace Management
- **Dashboard**: Visual workspace overview
- **CRUD Operations**: Create, read, update, delete workspaces
- **Navigation**: Seamless workspace switching

### 3. AI Chat Interface
- **Multi-Agent Integration**: Routes to specialized AI agents
- **Session Management**: Persistent chat sessions
- **Real-time Messaging**: Instant responses
- **Message History**: Full conversation persistence

### 4. Content Management
- **Notes System**: Text notes with file attachments
- **Video Management**: Upload and organize video content
- **File Handling**: Drag-and-drop, progress tracking
- **Search Functionality**: Quick content discovery

### 5. Study Tools
- **Flashcard Generation**: AI-powered flashcard creation
- **Resource Recommendations**: Curated learning materials
- **Progress Tracking**: Study session analytics

## 🎯 Component Details

### Core Components

#### `ChatInterface.jsx`
- Real-time chat with AI agents
- Message threading and history
- Typing indicators and loading states
- Agent type identification

#### `NotesSection.jsx`
- Text note creation and editing
- File upload with progress tracking
- Note organization and search
- File management (delete, download)

#### `VideosSection.jsx`
- Video file upload and storage
- Transcription processing
- Video metadata management
- Playback integration

#### `Home.jsx`
- Workspace dashboard
- Create/delete workspace operations
- User profile display
- Social media integration

#### `Workspace.jsx`
- Main application interface
- Tab-based navigation
- Session management
- User context display

### Custom Hooks

#### `useChat.js`
```javascript
const {
  sessions, currentSession, messages,
  isLoading, isSending, error,
  createNewSession, selectSession, sendMessage
} = useChat(workspaceId);
```

#### `useUser.js`
```javascript
const {
  user, isLoading, error,
  getUserInitials, getProfileImageUrl
} = useUser();
```

#### `useNotes.js`
```javascript
const {
  notes, isLoading, error,
  createNote, updateNote, deleteNote,
  uploadFiles, deleteFile
} = useNotes(workspaceId);
```

## 🌐 API Integration

### HTTP Client Setup
```javascript
// Automatic token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints
- **Authentication**: `/api/token/`, `/api/user/register/`
- **Workspaces**: `/api/workspaces/`, `/api/workspace/create`
- **Chat**: `/api/workspace/{id}/chat/sessions/`
- **Notes**: `/api/workspace/{id}/notes/`
- **Videos**: `/api/workspace/{id}/videos/`

## 🎨 Styling Guidelines

### Tailwind Configuration
```javascript
theme: {
  extend: {
    colors: {
      border: 'hsl(var(--border))',
      background: 'hsl(var(--background))',
      primary: 'hsl(var(--primary))',
      // ... CSS variables for theming
    }
  }
}
```

### Component Styling Patterns
```jsx
// Gradient backgrounds
className="bg-gradient-to-br from-indigo-50 via-white to-purple-50"

// Glass morphism
className="bg-white/80 backdrop-blur-md"

// Interactive states
className="hover:shadow-xl transition-all duration-200"

// Responsive design
className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
```

## 🔒 Security Features

### Token Management
- JWT access/refresh token pattern
- Automatic token refresh
- Secure storage in localStorage
- Token expiration handling

### Route Protection
- Protected route wrapper
- Automatic authentication checks
- Redirect to login when unauthorized
- Loading states during authentication

### File Upload Security
- File type validation
- Size limit enforcement
- Secure multipart/form-data handling
- Error handling for malicious files

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: md: (768px+)
- **Desktop**: lg: (1024px+)
- **Large**: xl: (1280px+)

### Mobile Optimizations
- Touch-friendly interfaces
- Optimized chat layouts
- Collapsible navigation
- Swipe gestures

## 🚀 Performance Optimizations

### Bundle Optimization
- Vite for fast builds
- Tree shaking for smaller bundles
- Code splitting for lazy loading
- Asset optimization

### Runtime Performance
- React 18 concurrent features
- Efficient re-rendering patterns
- Optimized API calls
- Image lazy loading

### Development Experience
- Hot module replacement
- Fast refresh
- Development server optimizations
- WSL2 file watching support

## 🧪 Development Workflow

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables:
   ```bash
   VITE_API_URL=http://localhost:8000
   ```
4. Start development server: `npm run dev`
5. Access at `http://localhost:5173`

### Code Style
- ESLint configuration for consistency
- Prettier formatting (recommended)
- Component naming conventions
- File organization standards

### Testing Strategy
- Manual testing workflows
- API integration testing
- UI component testing
- Cross-browser compatibility

## 🔧 Configuration Files

### `vite.config.js`
- React plugin configuration
- Path alias setup (`@` → `./src`)
- Development server settings
- WSL2 compatibility

### `tailwind.config.js`
- Custom color variables
- Animation configurations
- Responsive breakpoints
- Plugin integrations

### `package.json`
- Dependency management
- Build scripts
- Development tools
- Version constraints

## 🎯 Future Enhancements

### Planned Features
- Dark mode support
- Progressive Web App (PWA)
- Offline functionality
- Real-time collaboration
- Advanced search features
- Mobile app development

### Technical Improvements
- TypeScript migration
- Unit test coverage
- E2E testing setup
- Performance monitoring
- Error boundary implementation

## 🐛 Troubleshooting

### Common Issues
1. **Build Errors**: Check Node.js version (16+)
2. **API Connection**: Verify backend server is running
3. **Styles Not Loading**: Clear browser cache
4. **Token Issues**: Clear localStorage and re-login

### Development Tips
- Use browser DevTools for debugging
- Check Network tab for API issues
- Monitor Console for error messages
- Use React DevTools for component inspection

## 📞 Support

For technical issues or questions:
1. Check the troubleshooting section
2. Review error logs in browser console
3. Verify API connectivity
4. Check component state in React DevTools

---

*Built with ❤️ using React, Tailwind CSS, and modern web technologies*