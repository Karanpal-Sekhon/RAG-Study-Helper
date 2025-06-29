# RAG Study Helper

A comprehensive AI-powered study assistant that uses Retrieval-Augmented Generation (RAG) to help students learn more effectively. The application provides a modern interface for uploading study materials, chatting with specialized AI agents, generating flashcards, and finding additional learning resources.

## 🌟 Features

- **🏗️ Workspace Management**: Organize study materials in dedicated workspaces
- **🤖 Multi-Agent AI System**: Specialized agents for different study tasks
- **📝 Document Processing**: Upload and process notes, PDFs, and videos
- **💬 Intelligent Chat**: Natural language interaction with AI agents
- **🎴 Flashcard Generation**: AI-powered flashcard creation from study materials
- **📚 Resource Recommendations**: Curated additional learning resources
- **🔐 Secure Authentication**: JWT-based user authentication and profiles
- **📱 Responsive Design**: Modern UI that works on desktop and mobile

## 🛠️ Tech Stack

### Backend
- **Django 4.x** - Web framework with REST API
- **Django REST Framework** - API development
- **LangChain & LangGraph** - AI agent orchestration
- **ChromaDB** - Vector database for document embeddings
- **OpenAI API** - Large language models (GPT-3.5/GPT-4)
- **SQLite/PostgreSQL** - Database storage
- **JWT Authentication** - Secure token-based auth

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS v3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library
- **Radix UI** - Accessible UI primitives
- **Axios** - HTTP client with interceptors
- **React Router DOM** - Client-side routing

### AI/ML Stack
- **OpenAI Models** - GPT-3.5-turbo, GPT-4 for chat and analysis
- **ChromaDB** - Vector storage and similarity search
- **Sentence Transformers** - Text embedding generation
- **LangChain** - Document processing and RAG pipelines
- **LangGraph** - Multi-agent workflow orchestration

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Python 3.9+** with pip
- **Node.js 16+** with npm
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Git** for version control
- **PostgreSQL** (optional, for production)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RAG-Study-Helper.git
cd RAG-Study-Helper
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Required for OpenAI API access
OPENAI_API_KEY=your_openai_api_key_here

# Django settings
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database settings (Optional - defaults to SQLite)
# DATABASE_URL=postgres://user:password@localhost:5432/database_name
```

#### Database Setup
```bash
# Create and apply database migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user (optional)
python manage.py createsuperuser
```

#### Start Backend Server
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

The `.env` file should contain:
```env
# API URL for backend connection
VITE_API_URL=http://localhost:8000
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Create a workspace and start uploading study materials
4. Begin chatting with AI agents for study assistance

## 📁 Project Structure

```
RAG-Study-Helper/
├── backend/                    # Django backend configuration
│   ├── settings.py            # Django settings
│   ├── urls.py               # Main URL routing
│   └── wsgi.py               # WSGI configuration
│
├── users/                     # User management app
│   ├── models.py             # User model with UUID and profile
│   ├── views.py              # Authentication views
│   └── serializers.py        # User data serialization
│
├── workspace/                 # Workspace and content management
│   ├── models.py             # Workspace, Notes, Videos models
│   ├── views.py              # CRUD operations for content
│   ├── vector_store_manager.py # ChromaDB integration
│   └── urls.py               # Workspace API endpoints
│
├── chat/                      # Chat and messaging system
│   ├── models.py             # ChatSession and ChatMessage models
│   ├── views.py              # Chat API endpoints
│   └── urls.py               # Chat routing
│
├── Agents/                    # AI agent system
│   ├── multi-agent.py        # Main agent orchestration
│   ├── agent_factory.py      # Agent factory pattern
│   ├── rag-qa-agent.py       # Q&A agent implementation
│   └── agent_managers/       # Agent lifecycle management
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── styles/          # Component styles
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS config
│
├── chroma_db/                 # Vector database storage
├── media/                     # User uploaded files
├── requirements.txt           # Python dependencies
├── manage.py                 # Django management script
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🛡️ Development Commands

### Backend Commands

```bash
# Start development server
python manage.py runserver

# Run tests
python manage.py test

# Run specific test
python manage.py test app_name.tests.TestClassName.test_method_name

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Shell access
python manage.py shell

# Check for issues
python manage.py check
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview

# Install new dependency
npm install package-name

# Update dependencies
npm update
```

## 🤖 Multi-Agent System

The application features a sophisticated multi-agent architecture powered by LangGraph:

### Agent Types

1. **RAG QA Agent** (`rag-qa-agent.py`)
   - Answers questions using your uploaded study materials
   - Retrieves relevant context from vector database
   - Provides citations and sources

2. **Flashcard Agent** (Planned)
   - Generates flashcards from notes and documents
   - Creates question-answer pairs
   - Adapts difficulty based on content

3. **Exam Agent** (Planned)
   - Creates practice exams from study materials
   - Generates multiple choice and essay questions
   - Provides detailed answer explanations

4. **Resource Agent** (Planned)
   - Recommends additional learning resources
   - Finds relevant videos, articles, and books
   - Curates external study materials

### Agent Architecture

```
User Query → Multi-Agent Orchestrator → Specialized Agent → Response
                     ↕
            Vector Database (ChromaDB)
                     ↕
               Study Materials
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for development and production
- **File Upload Validation**: Type and size restrictions
- **Environment Variables**: Sensitive data protection
- **UUID Primary Keys**: Enhanced security for database records
- **Input Sanitization**: Protection against malicious input

## 🎨 UI/UX Features

- **Modern Design**: Clean, gradient-based interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Glass Morphism**: Modern backdrop blur effects
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Dark Mode Ready**: Prepared for theme switching
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test workspace
python manage.py test chat

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing
```bash
# Manual testing workflow
npm run dev

# API integration testing
# (Use browser dev tools to monitor network requests)

# Code quality
npm run lint
```

## 📊 Performance Optimizations

### Backend
- **Database Indexing**: Optimized queries for large datasets
- **Caching**: Agent instance caching for better performance
- **Async Processing**: Non-blocking file processing
- **Vector Database**: Fast similarity search with ChromaDB

### Frontend
- **Code Splitting**: Lazy loading for optimal bundle size
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Lazy loading and compression
- **API Optimization**: Request debouncing and caching

## 🐛 Troubleshooting

### Common Issues

1. **ImportError: Couldn't import Django**
   ```bash
   # Ensure virtual environment is activated
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **OpenAI API Key Error**
   ```bash
   # Check .env file exists and contains valid API key
   cat .env
   # Verify API key format: sk-...
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Database Migration Issues**
   ```bash
   # Reset migrations (development only)
   find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
   find . -path "*/migrations/*.pyc" -delete
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **CORS Errors**
   - Ensure backend is running on port 8000
   - Check CORS settings in `backend/settings.py`
   - Verify frontend `.env` has correct API URL

### Debug Mode

Enable detailed error logging:
```python
# In backend/settings.py
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
```

## 📈 Production Deployment

### Environment Variables for Production

```env
# Production settings
DEBUG=False
SECRET_KEY=your_strong_secret_key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgres://user:password@localhost:5432/rag_study_helper

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Static files (for serving)
STATIC_ROOT=/path/to/static/files
MEDIA_ROOT=/path/to/media/files
```

### Deployment Steps

1. **Backend Deployment**
   ```bash
   # Install production dependencies
   pip install gunicorn whitenoise
   
   # Collect static files
   python manage.py collectstatic
   
   # Run with Gunicorn
   gunicorn backend.wsgi:application
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   
   # Serve static files (nginx, Apache, or CDN)
   ```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   # Backend tests
   python manage.py test
   
   # Frontend linting
   cd frontend && npm run lint
   ```
5. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add amazing feature that does X"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines

#### Python/Django
- Follow PEP 8 conventions
- Use docstrings for classes and functions
- Use type hints when possible
- Handle exceptions properly

#### JavaScript/React
- Use ESLint configuration provided
- Follow functional component patterns
- Use meaningful variable names
- Handle errors gracefully

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](https://github.com/your-username/RAG-Study-Helper/issues)
3. Create a new issue with detailed information:
   - OS and versions
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior

## 🙏 Acknowledgments

- **OpenAI** for providing powerful language models
- **LangChain & LangGraph** for agent orchestration framework
- **ChromaDB** for vector database capabilities
- **shadcn/ui** for beautiful React components
- **Tailwind CSS** for utility-first styling

---

**Built with ❤️ for students and educators worldwide**