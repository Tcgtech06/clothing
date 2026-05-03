# WhatsApp Order Notification Setup

This application sends automatic WhatsApp notifications when customers place orders. Currently, the system logs messages to the console. To enable actual WhatsApp message sending, you need to configure one of the following services:

## Option 1: Twilio WhatsApp API (Recommended - Easiest Setup)

### Steps:
1. **Create a Twilio Account**
   - Go to https://www.twilio.com/
   - Sign up for a free account (includes trial credits)

2. **Set up WhatsApp Sandbox (for testing)**
   - Go to Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to connect your WhatsApp to Twilio sandbox
   - Note: Sandbox is for testing only. For production, you need to apply for WhatsApp Business API approval

3. **Get Your Credentials**
   - Account SID: Found in Twilio Console Dashboard
   - Auth Token: Found in Twilio Console Dashboard
   - WhatsApp Number: Your Twilio WhatsApp number (e.g., whatsapp:+14155238886)

4. **Add Environment Variables**
   Create or update `.env.local` file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

5. **Install Twilio SDK** (optional, but recommended)
   ```bash
   npm install twilio
   ```

6. **Uncomment Twilio Code**
   - Open `app/api/send-whatsapp/route.ts`
   - Uncomment the "Option 1: Using Twilio" section
   - Comment out the temporary logging section

### Pricing:
- Free trial credits included
- After trial: ~$0.005 per message (very affordable)
- No monthly fees for pay-as-you-go

---

## Option 2: WhatsApp Business API (For Production)

### Steps:
1. **Apply for WhatsApp Business API**
   - Go to https://business.whatsapp.com/
   - Apply for API access (requires business verification)
   - Approval can take several days to weeks

2. **Get API Credentials**
   - Once approved, you'll receive:
     - API URL
     - Access Token
     - Phone Number ID

3. **Add Environment Variables**
   ```env
   WHATSAPP_API_URL=https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages
   WHATSAPP_API_TOKEN=your_access_token_here
   ```

4. **Uncomment WhatsApp Business API Code**
   - Open `app/api/send-whatsapp/route.ts`
   - Uncomment the "Option 2: Using WhatsApp Business API" section
   - Comment out the temporary logging section

### Pricing:
- Free for first 1,000 conversations per month
- After that: varies by country (India: ~₹0.40 per conversation)

---

## Option 3: Third-Party Services (Easiest for India)

### Popular Services in India:
1. **WATI** (https://www.wati.io/)
2. **Interakt** (https://www.interakt.shop/)
3. **AiSensy** (https://aisensy.com/)
4. **Gupshup** (https://www.gupshup.io/)

### Steps:
1. **Sign up for a service**
   - Choose one of the services above
   - Complete business verification
   - Get API credentials

2. **Add Environment Variables**
   ```env
   WHATSAPP_SERVICE_URL=your_service_api_url
   WHATSAPP_SERVICE_API_KEY=your_api_key
   ```

3. **Update API Code**
   - Open `app/api/send-whatsapp/route.ts`
   - Uncomment "Option 3: Using a third-party service"
   - Modify the API call according to your service's documentation
   - Comment out the temporary logging section

### Pricing:
- Varies by service
- Usually starts at ₹500-2000/month
- Includes message credits

---

## Current Status

**The system is currently in LOGGING MODE:**
- When an order is placed, the WhatsApp message is logged to the console
- No actual WhatsApp message is sent
- This allows you to test the order flow without WhatsApp setup

**To check logs:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Place a test order
4. You'll see the WhatsApp message that would be sent

---

## Testing

### After Configuration:
1. Place a test order on your website
2. Check if WhatsApp message is received on 9791962802
3. Verify all order details are correct in the message

### Troubleshooting:
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure API credentials are valid
- Check API service status/dashboard

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` file to git
- Keep API keys and tokens secret
- Use environment variables for all sensitive data
- Rotate API keys regularly

---

## Support

For issues or questions:
1. Check service documentation (Twilio, WhatsApp Business API, etc.)
2. Verify environment variables are loaded correctly
3. Check API endpoint logs in Vercel/Netlify dashboard
4. Contact your WhatsApp service provider support

---

## Recommended Setup for Production

**For small businesses (< 1000 orders/month):**
- Use Twilio WhatsApp API
- Simple setup, affordable pricing
- Good for getting started quickly

**For medium to large businesses:**
- Use WhatsApp Business API directly
- Better rates at scale
- More control and features

**For businesses in India:**
- Consider Indian third-party services (WATI, Interakt, etc.)
- Local support and easier setup
- Often includes additional features like chatbots
