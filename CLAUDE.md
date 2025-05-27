# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 5174 with auto-open
- `npm run build` - Type check with tsc and build for production
- `npm run preview` - Preview production build
- `tsc` - Type checking only

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Material-UI (MUI) with dark theme
- **State Management**: Redux Toolkit
- **Storage**: IndexedDB for client-side persistence
- **Routing**: React Router DOM

### Project Structure

This is a **Mass Vision** choreography management application with the following core domains:

#### Data Models (src/types/project.ts)
- **Project**: Main entity containing characters, scenes, and metadata
- **Character**: Individual performers with position/color/direction
- **Scene**: Collections of macros for choreography sequences  
- **Macro**: Script-based movement commands assigned to characters

#### State Management (src/store/)
- Redux store with separate slices for `project` and `character` management
- Centralized state for all project data and character positioning

#### Data Persistence (src/utils/IndexedDBManager.ts)
- Complete IndexedDB wrapper for offline project storage
- Handles CRUD operations for projects with proper error handling

#### Key Pages
- **TitlePage** (`/`) - Application entry point
- **ProjectListPage** (`/projects`) - Browse and manage projects
- **NewProjectPage** (`/projects/new`) - Create new choreography projects
- **MacroPage** (`/projects/:projectId`) - Main editing interface for choreography

### Important Notes

- **Type Conflicts**: There are duplicate type definitions in `src/types/project.ts` and `src/utils/IndexedDBManager.ts` that need reconciliation
- **Alias Configuration**: Uses `@/*` path mapping to `src/*` 
- **API Proxy**: Vite configured to proxy `/api` calls to `localhost:5173`
- **Japanese Content**: Interface and error messages are in Japanese