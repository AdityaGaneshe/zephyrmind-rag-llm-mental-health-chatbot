# ZephyrMind — Stress Management App

## Overview
A comprehensive stress management web application featuring:
- **Chatbot Counselor** ("Serene") — rule-based stress counseling with adaptive responses
- **Weekly Stress Dashboard** — interactive area chart tracking stress levels over 7 days
- **Tasks** — evidence-based activities filtered by stress level and category
- **Videos** — curated YouTube video library with in-app playback, filterable by stress level

## Architecture
- **Frontend**: React + TypeScript + Vite (port 5173)
- **Backend**: Express.js (port 5000)
- **Data**: In-memory storage (MemStorage) with pre-seeded stress entries, tasks, and videos
- **Routing**: wouter
- **State**: TanStack Query v5
- **UI**: shadcn/ui + Recharts + Tailwind CSS

## Key Files
- `client/src/App.tsx` — root with SidebarProvider, routing
- `client/src/components/app-sidebar.tsx` — navigation sidebar
- `client/src/pages/Dashboard.tsx` — stress tracker with weekly chart
- `client/src/pages/Chatbot.tsx` — Serene counselor chat interface
- `client/src/pages/Tasks.tsx` — filterable task list with completions
- `client/src/pages/Videos.tsx` — video library with YouTube embed modal
- `server/counselor.ts` — chatbot response generation logic
- `server/storage.ts` — MemStorage with seed data for tasks and videos
- `server/routes.ts` — all REST API endpoints

## Color Theme
Calming lavender/blue therapeutic palette. Primary: `hsl(265, 60%, 55%)` (purple).

## API Routes
- `GET/POST/DELETE /api/stress-entries` — stress tracking
- `GET/POST/DELETE /api/chat/:sessionId` — chatbot messages
- `GET /api/tasks?level=N` — tasks, optional stress level filter
- `GET/POST/DELETE /api/task-completions` — task completion tracking
- `GET /api/videos?level=N` — videos, optional stress level filter

## Running
`npm run dev` — starts both Express and Vite servers
