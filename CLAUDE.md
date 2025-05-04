# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Development Commands

Backend:
- Run server: `python manage.py runserver`
- Run tests: `pytest` or `python manage.py test`
- Run single test: `python manage.py test app_name.tests.TestClassName.test_method_name`
- Make migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`

Frontend:
- Start dev server: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Lint: `cd frontend && npm run lint`

## Code Style Guidelines

Python:
- Follow PEP 8 conventions
- Use docstrings for classes and functions
- Use type hints when possible
- Name files/variables in snake_case, classes in PascalCase
- Handle exceptions with try/except blocks and provide meaningful error messages

JavaScript/React:
- Use ESM imports (import/export)
- Follow JSX syntax for React components
- Use functional components with hooks
- Format code according to eslint rules (ecmaVersion 2020)
- Handle API errors with try/catch blocks

Database:
- Use UUID for primary keys
- Include created_at timestamps
- Define __str__ methods for models