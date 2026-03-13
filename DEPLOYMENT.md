# Deployment Guide to Vercel

## Overview

Your IronTrack app has been converted to use Vercel serverless functions for the backend. This guide will help you deploy it successfully.

## Prerequisites

- GitHub account with your repository pushed
- Vercel account (free tier available at vercel.com)
- Turso database (free tier available at turso.tech)

## Step 1: Set Up Turso Database

1. Go to [turso.tech](https://turso.tech) and create a free account
2. Create a new database:
   - Click "Create a new database"
   - Name it something like "irontrack"
   - Choose a region close to you
3. Get your credentials:
   - Click on your database
   - Copy the **Database URL**
   - Generate an **Auth Token** (JWT)

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → "Project"
3. Select your irontrack repository
4. In the production environment settings, add these environment variables:
   ```
   TURSO_DATABASE_URL=your-database-url
   TURSO_AUTH_TOKEN=your-auth-token
   JWT_SECRET=your-secret-key-here
   GEMINI_API_KEY=your-gemini-key (optional)
   ```
5. Click "Deploy"

## Step 3: Verify Deployment

1. Once deployed, Vercel will give you a URL (e.g., `https://irontrack.vercel.app`)
2. Test the following:
   - Sign up with a new account
   - Log in
   - Add a workout
   - Check if data persists after refresh

## Troubleshooting

### Auth not working after deployment

- **Check in browser DevTools (F12) → Network tab** when attempting login
- Look for the `/api/auth/login` request
- If it shows 404, your API routes didn't deploy properly
- If it shows 500, check that all environment variables are set

### Database connection errors

- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correctly set in Vercel
- Test the database connection locally first with `npm run dev`
- Check that your Turso database is active

### CORS issues

- The API is now on the same domain (Vercel), so CORS shouldn't be an issue
- But if you see CORS errors, your environment variables may not be loaded correctly

## Environment Variables Reference

| Variable             | Description                                            | Example                       |
| -------------------- | ------------------------------------------------------ | ----------------------------- |
| `TURSO_DATABASE_URL` | Your Turso database connection string                  | `libsql://my-db-xxx.turso.io` |
| `TURSO_AUTH_TOKEN`   | Authentication token for Turso                         | `eyJ...`                      |
| `JWT_SECRET`         | Secret key for JWT tokens (use a strong random string) | `your-secret`                 |
| `GEMINI_API_KEY`     | Optional: Google Gemini API key for AI features        | `AIza...`                     |

## Local Development

To test locally before deploying:

1. Create a `.env` file in the root (copy from `.env.example`)
2. Fill in your actual values
3. Run `npm run dev`
4. The server will start on `http://localhost:3000`
5. Your API will be at `http://localhost:3000/api/*`

## API Endpoints

All endpoints now run as serverless functions:

### Auth

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token

### Workouts

- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Add new workout
- `PUT /api/workouts/[id]` - Update workout
- `DELETE /api/workouts/[id]` - Delete workout

### Stats

- `GET /api/stats` - Get personal records and stats

### Weight Tracking

- `GET /api/weight` - Get weight entries
- `POST /api/weight` - Log weight
- `DELETE /api/weight/[id]` - Delete weight entry

### Routines

- `GET /api/routines` - Get all routines
- `POST /api/routines` - Create routine
- `DELETE /api/routines/[id]` - Delete routine

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Test API endpoints with curl or Postman
3. Verify all environment variables are set correctly
4. Check browser console for client-side errors
