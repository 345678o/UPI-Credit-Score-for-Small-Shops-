---
name: Preview Project
description: Workflow to start the development server for previewing
---

# Preview Project

This workflow explains how to run the project in development mode for live preview.

## Steps

1. Install Node version 24 using nvm:
```bash
// turbo
nvm install 24
nvm use 24
```

2. Start the development server:
```bash
npm run dev -- --hostname 0.0.0.0
```

3. View in browser:
Open the printed URL in your browser or use the IDE preview tab.
