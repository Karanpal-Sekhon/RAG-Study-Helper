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

## Code Migration and UI Development Guidelines

**CRITICAL: When migrating UI components from class-craft-chat-main:**
- ALWAYS use the actual code from `/class-craft-chat-main/class-craft-chat-main/src/` directory
- DO NOT recreate components from scratch - migrate the existing codebase
- Copy exact styling, animations, and component structure
- Maintain the same visual design and user experience
- Use the exact dependency versions that match the source codebase

**Frontend Stack Requirements:**
- Tailwind CSS v3.4.11 (NOT v4.x) - for CSS class compatibility
- tailwindcss-animate v1.0.7 - required for animations
- shadcn/ui components with Radix UI primitives
- React 18 with functional components and hooks
- PostCSS config: `tailwindcss: {}` (NOT `@tailwindcss/postcss: {}`)

**Testing Approach:**
- User will run `npm run dev` to test changes
- Never start development servers automatically
- Ask user to run commands when testing is needed
- Verify CSS rendering before proceeding to next phase

## Code Style Guidelines

Python:
- Follow PEP 8 conventions
- Use docstrings for classes and functions
- Use type hints when possible
- Name files/variables in snake_case, classes in PascalCase
- Handle exceptions with try/catch blocks and provide meaningful error messages

JavaScript/React:
- Use ESM imports (import/export)
- Follow JSX syntax for React components
- Use functional components with hooks
- Format code according to eslint rules (ecmaVersion 2020)
- Handle API errors with try/catch blocks
- Migrate components from class-craft-chat-main, don't recreate from scratch

Database:
- Use UUID for primary keys
- Include created_at timestamps
- Define __str__ methods for models