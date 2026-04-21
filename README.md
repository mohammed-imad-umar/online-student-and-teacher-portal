# AI Student Teacher Portal (Frontend Only)

This version is fully frontend-only. All data is stored in browser `localStorage`, so no backend, database, or API keys are required.

## Features

- Local signup/login for student and teacher roles
- Dashboard, attendance, assignments, performance, forum, planner, tests, and live classes
- Basic offline AI teacher with 20 built-in questions and answers
- Smooth loading states and clean minimal UI

## Run Locally

```bash
cd client
npm install
npm run dev
```

## Demo Accounts

- `teacher@demo.com` / `123456`
- `student@demo.com` / `123456`

## Netlify Deployment

This project is ready for Netlify direct deployment (no backend service needed).

- Build settings are already in `netlify.toml`
- Base dir: `client`
- Build command: `npm run build`
- Publish dir: `dist`

## Credits

- Built by **batch 10 csm-b**
