# Smart Campus Operations System - Frontend

This is the frontend application for the Smart Campus Operations System, built with [React](https://react.dev/) + [Vite](https://vitejs.dev/) and styled with [Tailwind CSS](https://tailwindcss.com/).

## Requirements
- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Folder Structure

To keep the codebase maintainable and scalable, we follow a specific directory structure inside the `src` folder. Please adhere to this structure when adding new code:

```text
src/
├── assets/       # Static assets like images, icons, and fonts
├── components/   # Reusable UI components (e.g., Buttons, Cards, Modals)
├── context/      # React Context providers for global state (e.g., AuthProvider, ThemeProvider)
├── hooks/        # Custom React hooks (e.g., useFetch, useAuth)
├── pages/        # Main route/page components (e.g., Home, Dashboard, Login)
├── services/     # API service functions for backend communication (e.g., api.js, authService.js)
├── utils/        # Generic utility/helper functions and constants (e.g., formatDate.js, validators.js)
├── App.jsx       # Main application layout and routing setup
└── index.css     # Global CSS and Tailwind directives
```

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production to the `dist` folder.
- `npm run preview` - Locally preview the production build.
- `npm run lint` - Runs ESLint to catch syntax and styling issues.
