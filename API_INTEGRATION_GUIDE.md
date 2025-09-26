# API Integration Guide

This guide will help you integrate all the necessary API keys and services for your app to work properly.

## 🔑 Required API Keys

### 1. Stripe Payment Integration

**Status**: ✅ Code Ready - Need Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable Key** (starts with `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_live_`)
4. Update your `.env` file:
   ```env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
   STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
   ```

**Products Already Configured**:
- Weekly Pro: $7.99/week (price_1SAVRi2E9Vjhwnrc8x87h85p)
- Yearly Pro: $39.99/year (price_1SAVT22E9VjhwnrcvSLU9sbS)

### 2. AI Integration (Choose One or Both)

**Option A: OpenAI (Recommended)**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Update your `.env` file:
   ```env
   OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_KEY_HERE
   ```

**Option B: Google Gemini (Fallback)**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Update your `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSyYOUR_ACTUAL_GEMINI_KEY_HERE
   ```

**Note**: The system will try OpenAI first, then fallback to Gemini if OpenAI fails.

### 3. PayPal Integration (Optional)

**Status**: ✅ Code Ready - Optional

1. Go to [PayPal Developer](https://developer.paypal.com/developer/applications/)
2. Create a new app
3. Get your Client ID and Secret
4. Update your `.env` file:
   ```env
   EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
   EXPO_PUBLIC_PAYPAL_MODE=live
   ```

## 🚀 Deployment Configuration

### For Production Deployment:

1. **Update API Base URL**:
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL=https://your-actual-domain.com
   ```

2. **Verify All Keys Are Live Keys**:
   - Stripe: `pk_live_...` and `sk_live_...`
   - PayPal: Set mode to `live`

## 🧪 Testing Your Integration

1. **Run the API Test Screen**:
   - Navigate to `/api-test` in your app
   - This will test all your API connections
   - Green checkmarks = working
   - Red X = needs configuration

2. **Test Payments**:
   - Navigate to `/payment-test` in your app
   - Try a test payment with Stripe

3. **Test AI Chat**:
   - Navigate to any specialist chat
   - Send a message to test AI integration

## 📋 Pre-Launch Checklist

### ✅ API Keys Configured
- [ ] Stripe Publishable Key (pk_live_...)
- [ ] Stripe Secret Key (sk_live_...)
- [ ] OpenAI API Key (sk-proj-...) OR Gemini API Key (AIzaSy...)
- [ ] PayPal Client ID (optional)
- [ ] Production API Base URL

### ✅ Testing Complete
- [ ] API Test Screen shows all green
- [ ] Payment test successful
- [ ] AI chat working
- [ ] All app features functional

### ✅ Production Ready
- [ ] All keys are LIVE keys (not test keys)
- [ ] API Base URL points to production server
- [ ] App tested on real devices
- [ ] Payment flow tested with real payment methods

## 🔧 Troubleshooting

### Common Issues:

1. **"API key not configured" error**:
   - Check your `.env` file has the correct key format
   - Restart your development server after changing `.env`
   - Make sure keys don't contain "YOUR_ACTUAL" placeholder text

2. **Payment failures**:
   - Verify you're using live Stripe keys for production
   - Check Stripe Dashboard for error details
   - Ensure webhook endpoints are configured (if using webhooks)

3. **AI not responding**:
   - Check API key is valid and has credits
   - Verify network connectivity
   - Check console logs for specific error messages

4. **tRPC connection errors**:
   - Verify API_BASE_URL is correct
   - Check if backend server is running
   - Ensure CORS is configured properly

## 📞 Support

If you encounter issues:
1. Check the API Test Screen first
2. Review console logs for error details
3. Verify all environment variables are set correctly
4. Test with a fresh restart of your development server

---

**Next Steps**: Update your `.env` file with your actual API keys, then run the API test to verify everything is working!