# Vercel Deployment Guide

## Environment Variables Configuration

Your Vercel deployment needs the following environment variables to connect to your backend.

### Required Environment Variables

Go to your Vercel project settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://10d4b2e840c8.ngrok-free.app
NEXT_PUBLIC_WS_URL=wss://10d4b2e840c8.ngrok-free.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAfmVV0n1PenJU_ntMK4S9ZxK0P7WnipoM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=riseoffice-22ca4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=riseoffice-22ca4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=riseoffice-22ca4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=231906918177
NEXT_PUBLIC_FIREBASE_APP_ID=1:231906918177:web:6a47b29d63a40bdb600860
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://riseoffice-22ca4-default-rtdb.firebaseio.com
```

### Steps to Configure Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project: `automation-agent-nu`

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Select "Environment Variables" from the left sidebar

3. **Add Each Variable**
   - Click "Add New" button
   - Enter the variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - Enter the value (e.g., `https://10d4b2e840c8.ngrok-free.app`)
   - Select environment: Production, Preview, and Development
   - Click "Save"

4. **Redeploy**
   - After adding all variables, go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Select "Redeploy"
   - Check "Use existing Build Cache" (optional)
   - Click "Redeploy"

### Important Notes

⚠️ **ngrok URL Changes**:
- Free ngrok URLs change every time you restart ngrok
- If your ngrok URL changes, update the `NEXT_PUBLIC_API_URL` in Vercel and redeploy

⚠️ **Backend CORS**:
- Your backend `.env` already has Vercel URL in CORS_ORIGINS:
  ```
  CORS_ORIGINS=...,https://automation-agent-nu.vercel.app
  ```
- Make sure your backend is running and ngrok is active

### Backend Must Be Running

For the Vercel deployment to work:
1. ✅ Backend must be running on `localhost:8000`
2. ✅ ngrok must be active: `ngrok http 8000`
3. ✅ Backend CORS must include Vercel URL (already configured)

### Testing Your Deployment

After redeploying with environment variables:

1. Visit: https://automation-agent-nu.vercel.app/login
2. Try logging in with test credentials:
   - Admin: `admin@example.com` / `admin123`
   - User: `user@example.com` / `user12345`

### Troubleshooting

**Error: "Cannot connect to backend"**
- Check if backend is running: `curl http://localhost:8000/health`
- Check if ngrok is active: Visit `http://localhost:4040`
- Verify ngrok URL matches the one in Vercel environment variables

**Error: "CORS policy error"**
- Verify backend `.env` has Vercel URL in `CORS_ORIGINS`
- Restart backend after updating CORS: `cd backend && RESTART_BACKEND.bat`

**Error: "Environment variables not working"**
- Make sure all variables start with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check build logs for any errors

### Production Deployment (Future)

When deploying to production with a permanent backend URL:

1. Replace ngrok URL with your production backend URL
2. Update both Vercel environment variables and backend CORS
3. Consider using:
   - Railway, Render, or Heroku for backend hosting
   - Permanent domain for your backend API
   - Environment-specific configs (dev, staging, prod)

### Quick Commands

```bash
# Start backend
cd backend
RESTART_BACKEND.bat

# Start ngrok
cd backend
ngrok http 8000

# Check backend health
curl http://localhost:8000/health

# Check ngrok status
curl http://localhost:4040/api/tunnels
```
