# RAG Study Helper

A comprehensive study assistant that uses Retrieval-Augmented Generation (RAG) to help students learn more effectively. The application allows users to upload study materials, ask questions, generate flashcards, create practice exams, and find additional learning resources through AI-powered agents.

## Features

- Upload and organize study materials (notes, videos) in workspaces
- Chat with AI agents to get help with your studies
- Generate flashcards from your notes
- Create practice exams based on your materials
- Find additional learning resources on your study topics
- User authentication and personalized workspace management

## Tech Stack

- **Backend**: Django, Django REST Framework, LangChain, LangGraph
- **Frontend**: React, Vite, Axios
- **Database**: SQLite (development), PostgreSQL (production)
- **AI/ML**: OpenAI models (GPT-3.5/GPT-4), ChromaDB vector database
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites

- Python 3.9+ and pip
- Node.js 16+ and npm
- OpenAI API key
- PostgreSQL (for production)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/RAG-Study-Helper.git
   cd RAG-Study-Helper
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser (admin):
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Development Commands

### Backend

- Run server: `python manage.py runserver`
- Run tests: `python manage.py test`
- Create migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`

### Frontend

- Start development server: `npm run dev`
- Build for production: `npm run build`
- Lint code: `npm run lint`

## Agent System

The application uses a multi-agent system powered by LangGraph:

- **RAG QA Agent**: Answers questions based on your study materials
- **Flashcard Agent**: Generates flashcards from your notes
- **Exam Agent**: Creates practice exams with questions and answers
- **Resource Agent**: Recommends additional learning resources

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.