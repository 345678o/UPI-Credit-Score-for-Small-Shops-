---
name: Build Project
description: Workflow to install dependencies and build the project
---

# Build Project

This workflow explains how to build the Next.js project.

## Steps

1. Install Node version 24 using nvm:
```bash
// turbo
nvm install 24
nvm use 24
```

2. Install dependencies:
```bash
// turbo
npm install
```

3. Typecheck the project:
```bash
// turbo
npm run typecheck
```

4. Build the project for production:
```bash
// turbo
npm run build
```
