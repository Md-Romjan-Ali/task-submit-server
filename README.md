# Task Server - Deployment Fix Guide

## Issues Found & Fixed

### ❌ Problem 1: Incorrect Vercel Configuration
**What was wrong:**
- The `vercel.json` was pointing to the TypeScript source file (`src/index.ts`)
- Vercel expects the compiled JavaScript output, not TypeScript source

**Fix:**
```json
// Before (WRONG)
"src": "src/index.ts"

// After (CORRECT)
"src": "dist/index.js"
```

### ❌ Problem 2: Express `app.listen()` Not Compatible with Vercel
**What was wrong:**
- The server was using `app.listen(PORT)` which is designed for traditional Node.js servers
- Vercel's serverless environment doesn't support listening on ports
- The app needs to be exported as a module for Vercel to use it

**Fix:**
```javascript
// Before (WRONG)
app.listen(PORT, () => {
    console.log('this isdder side')
})

// After (CORRECT)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

export default app  // Export for Vercel serverless
```

### ❌ Problem 3: Missing Dependency
**What was wrong:**
- `jsonwebtoken` was in `devDependencies` but should be in `dependencies` (if being used in production)

**Fix:**
- Moved `jsonwebtoken` from `devDependencies` to `dependencies`

### ❌ Problem 4: Missing Build Script for Vercel
**What was wrong:**
- Vercel needs explicit build instructions

**Fix:**
```json
"vercel-build": "tsc"  // Added to scripts
```

## How to Deploy

### Prerequisites
Make sure you have:
- `.env` file with `MONGODB_URI` and `PORT` (optional) variables
- MongoDB connection string properly configured

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build locally to test:
   ```bash
   npm run build
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Local Development
Run the development server:
```bash
npm run dev
```

This uses `tsx` to watch and recompile TypeScript files as you change them.

## Project Structure
```
task-server/
├── src/
│   └── index.ts          # Express server with MongoDB integration
├── dist/                 # Compiled JavaScript (generated on build)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vercel.json          # Vercel deployment configuration
└── README.md            # This file
```

## Environment Variables
Create a `.env` file in the root directory:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## Available API Endpoints
- `GET /` - Health check
- `GET /api/getuser` - Get all users
- `POST /api/posttask` - Submit a task
- `GET /api/getsubmit` - Get all task submissions
- `GET /api/getsubmitbyemail` - Get submissions by email

## Troubleshooting
If deployment still fails:
1. Check that `.env` variables are set in Vercel project settings
2. Ensure MongoDB connection string is valid
3. Run `npm run build` locally to check for TypeScript errors
4. Check Vercel deployment logs for detailed error messages

