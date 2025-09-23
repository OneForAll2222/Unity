# API Setup Guide

Your APIs are not working because of configuration issues. Here's how to fix them:

## 🔧 Quick Fix Steps

### 1. **Set up your API Base URL**
In your `.env` file, update this line:
```bash
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

**For development:**
- If running locally: `http://localhost:3000`
- If using tunnel: Use your tunnel URL (e.g., `https://abc123.ngrok.io`)

### 2. **Configure AI API Keys**
Uncomment and set your API keys in `.env`:

```bash
# For OpenAI (recommended)
OPENAI_API_KEY=sk-your-actual-openai-key-here

# OR for Google Gemini (alternative)
GEMINI_API_KEY=your-actual-gemini-key-here
```

### 3. **Start Your Backend Server**
Your backend needs to be running for APIs to work:

```bash
# In your project directory
bun start
```

This should start both your frontend and backend.

### 4. **Test Your APIs**
Navigate to `/api-test` in your app to run diagnostics and see what's working.

## 🚨 Common Issues

### Backend Not Running
**Error:** "Connection failed" or "Network error"
**Solution:** Make sure you run `bun start` to start the backend server

### Wrong API Base URL
**Error:** "API Health Check failed"
**Solution:** Check that `EXPO_PUBLIC_RORK_API_BASE_URL` matches your actual server URL

### Missing API Keys
**Error:** "API key not configured"
**Solution:** Add your OpenAI or Gemini API key to the `.env` file

### Environment Variables Not Loading
**Error:** Variables show as undefined
**Solution:** 
1. Restart your development server after changing `.env`
2. Make sure `.env` is in your project root
3. Use `EXPO_PUBLIC_` prefix for client-side variables

## 🔍 Debugging

1. **Check the API Test Page:** Go to `/api-test` in your app
2. **Check Console Logs:** Look for error messages in your terminal
3. **Verify Environment:** Make sure all required environment variables are set
4. **Test Backend Directly:** Visit `http://localhost:3000/api` in your browser

## 📝 Environment Variables Checklist

- [ ] `EXPO_PUBLIC_RORK_API_BASE_URL` - Your API server URL
- [ ] `OPENAI_API_KEY` or `GEMINI_API_KEY` - AI service key
- [ ] `ADMIN_PASSWORD` - Admin panel access
- [ ] `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payments (if using)
- [ ] `STRIPE_SECRET_KEY` - Stripe backend (if using)

## 🎯 Next Steps

1. Update your `.env` file with the correct values
2. Restart your development server: `bun start`
3. Test the APIs using the `/api-test` page
4. Once APIs are working, your chat and other features will work

Need help? Check the console logs for specific error messages.