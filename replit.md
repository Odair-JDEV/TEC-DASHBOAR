# Field Service Manager

## Overview
A field service management application built with React, TypeScript, Vite, and Tailwind CSS. The app helps manage technicians ("Técnicos") and their schedules/agendas for field service work.

## Tech Stack
- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand, TanStack React Query
- **Routing**: React Router DOM v6
- **UI Components**: Radix UI primitives

## Project Structure
```
src/
├── components/    # React components including UI primitives
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
├── test/          # Test files
└── types/         # TypeScript type definitions
```

## Development
- Run `npm run dev` to start the development server on port 5000
- Run `npm run build` to create a production build
- Run `npm test` to run tests

## Deployment
Configured for static deployment - builds to `dist/` directory.
