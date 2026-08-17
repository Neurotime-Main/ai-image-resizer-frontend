# BannerAI — Frontend

Web client for **BannerAI**, an AI advertising-banner adaptation platform. Upload an existing
banner, add optional instructions, pick one or more target dimensions, and get professionally
adapted versions of the same advertisement — branding, product, copy, and visual identity intact.

Backend repo: [banner-adapter-backend](https://github.com/neurotimeback2-cell/banner-adapter-backend)

## Stack

React 18 · TypeScript · Vite · Ant Design 5 · Axios · React Router 6

Dark navy AI-studio aesthetic: subtle blue gradients, glass cards, rounded corners, generous
spacing, minimal animation.

## Features

- **Auth** — register / login, JWT stored client-side, authenticated users land on `/app`,
  unauthenticated ones are redirected to `/login`.
- **Chat-style history** — a sidebar of past adaptations grouped by date, each with a thumbnail.
  Opening one replays the uploaded banner, the instructions, the sizes chosen, and every generated
  image. Chats can be renamed or deleted.
- **Reuse the banner** — inside a chat, pick new sizes and generate again without re-uploading;
  each round is appended to the conversation.
- **Size picker** — eight presets always visible in one compact row, plus custom width × height.
- **Justified result gallery** — previews share a uniform height while each card's width follows
  its format's proportions, so cards line up in tidy rows and wrap onto further lines.
- **Preservation status** — each result identifies whether it used exact source pixels, an intact
  protected layout, or a visually validated AI reflow.
- **Profile page** — account stats plus editing of name, email, and password.

## Pages

| Route            | Description                          |
| ---------------- | ------------------------------------ |
| `/login`         | Login                                |
| `/register`      | Registration                         |
| `/app`           | New adaptation                       |
| `/app/c/:chatId` | An existing chat and its history     |
| `/app/profile`   | Profile settings                     |

## Getting started

Requires Node.js 18+ (developed on Node 22) and the backend running on port 4000.

```bash
npm install
npm run dev      # http://localhost:5173
```

The backend origin comes from `VITE_API_URL`:

| File               | Used by         | Value                                   |
| ------------------ | --------------- | --------------------------------------- |
| `.env.development` | `npm run dev`   | `http://localhost:4000`                 |
| `.env.production`  | `npm run build` | your deployed backend origin            |

All API calls and image URLs are resolved against it (`src/api/client.ts`); leave it empty when
the backend serves the frontend from the same origin.

Production build: `npm run build` → static bundle in `dist/`.
