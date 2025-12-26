# MeetEase Frontend

Frontend application for MeetEase - a meeting scheduling platform.

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **Material-UI** - UI components
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn, OR
- Docker (for containerized development)

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Docker Development

Build and run with Docker:

```bash
docker build -t meetease_fe -f ./local.Dockerfile .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules meetease_fe:latest
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Project Structure

```
src/
├── auth/              # Authentication utilities
├── components/        # Reusable UI components
├── layouts/          # Page layout wrappers
├── lib/              # API functions and queries
├── routes/           # Route components (file-based routing)
└── main.tsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run router:gen` - Generate route tree
- `npm run router:watch` - Watch and generate routes

## Documentation

For detailed documentation, see [FRONTEND_DOCUMENTATION.md](./FRONTEND_DOCUMENTATION.md)
