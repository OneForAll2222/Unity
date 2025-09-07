# PayPal Integration Setup Guide

## What You Need From PayPal

### 1. PayPal Developer Account
- Go to https://developer.paypal.com
- Sign up or log in with your PayPal account
- This gives you access to PayPal's developer tools and sandbox environment

### 2. Create a PayPal App
1. In your PayPal Developer Dashboard, click "Create App"
2. Choose "Default Application" 
3. Select your business account (or create one)
4. Choose "Sandbox" for testing, "Live" for production
5. Select features you need (typically "Accept payments")

### 3. Get Your Credentials
After creating the app, you'll get:
- **Client ID** (public, can be used in frontend)
- **Client Secret** (private, only use in backend)

### 4. Environment Variables
Add these to your `.env` file:
```
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

For production, use your live credentials:
```
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
```

## Current Implementation Status

✅ **Already Implemented:**
- PayPal button UI component
- Payment processing flow
- Backend API routes (mock implementation)
- Error handling and user feedback
- Payment history tracking

🔧 **Needs Real PayPal Integration:**
The current implementation uses mock responses. To connect to real PayPal:

### 1. Install PayPal SDK
```bash
npm install @paypal/checkout-server-sdk
```

### 2. Update Backend Routes
Replace the mock implementation in `backend/trpc/routes/example/hi/route.ts` with real PayPal API calls.

### 3. Frontend PayPal SDK (Optional)
For better UX, you can use PayPal's frontend SDK:
```bash
npm install react-paypal-js
```

## Testing

### Sandbox Testing
- Use PayPal sandbox accounts for testing
- No real money is charged
- Test with sandbox buyer accounts

### Test Cards
PayPal provides test credit card numbers for sandbox testing.

## Production Checklist

- [ ] Switch from sandbox to live credentials
- [ ] Test with small real transactions
- [ ] Set up webhook endpoints for payment notifications
- [ ] Implement proper error logging
- [ ] Add payment reconciliation
- [ ] Set up PayPal business account verification

## Security Notes

- Never expose Client Secret in frontend code
- Always verify payments on your backend
- Use HTTPS in production
- Implement proper authentication for payment endpoints

## Current Payment Flow

1. User clicks "Pay with PayPal" button
2. App calls your backend to create payment
3. Backend creates PayPal payment (currently mocked)
4. User would be redirected to PayPal (currently simulated)
5. After payment, PayPal redirects back to your app
6. Backend verifies payment completion
7. App updates user's purchase status

The UI and flow are ready - you just need to replace the mock PayPal calls with real ones using your credentials.