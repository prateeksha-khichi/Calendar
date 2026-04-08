# Interactive Wall Calendar (Next.js)

A premium, design-focused interactive wall calendar built for a frontend engineering challenge. This project emphasizes a physical-object aesthetic, combining sophisticated typography with a clean, editorial layout.

## 🚀 Getting Started

To run this application locally, follow these steps:

1. **Install Dependencies**
   ```bash
   npm install
   ```
   *Note: Standard Next.js 14 and React 18 dependencies.*

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Visual Design Philosophy

- **Physicality**: The calendar features a custom CSS-rendered spiral binding with 3D gradients and soft shadows, mimicking a real object hanging on a wall.
- **Typography**: Paired "Playfair Display" for high-impact headings with "DM Sans" for crisp, legible body text and dates.
- **Editorial Palette**: Off-white paper background (`#F7F4EF`), deep charcoal text, and cobalt blue accents for a premium, studio-grade feel.
- **Dynamic Immersion**: Each month features a unique, curated mountain/landscape photograph from Unsplash, with smooth transitions and a bold, overlapping month badge.

## ✨ Key Features

- **Date Range Selection**: Intelligent two-click selection with a "pill" connecting the range. A summary bar provides immediate feedback on the selected duration.
- **Smart Notes**: Month-specific notes that persist via `localStorage`. Features a debounced auto-save system with a visual "Saved" indicator.
- **Global Holidays**: Hardcoded markers for major Indian and International holidays (Republic Day, Holi, Diwali, etc.) with interactive tooltips.
- **Responsive Layout**: Magazine-style two-panel layout on desktop that stacks naturally into a focused vertical experience on mobile.
- **Aesthetic Refinement**: Subtle rotations (0.3deg), paper noise textures, and micro-animations for interactions (hover scales, button rotations).

## 🛠️ Technical Details

- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules for scoped, performant styles (Zero Tailwind, Zero UI Libraries)
- **Date Logic**: Pure Vanilla JavaScript `Date` API (Zero external date libraries)
- **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- **Persistence**: `localStorage` with month-key indexing

## 📂 Project Structure

- `app/`: Next.js App Router root (Layouts, Global Styles, Main Page)
- `components/`: Pure React components and their CSS Modules
- `public/`: Static assets and icons
- `next.config.js`: Next.js configuration

---
*Created with care for the Frontend Engineering Internship Challenge.*
