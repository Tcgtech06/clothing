import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderData } = body;

    // Format order details for WhatsApp
    const productList = orderData.products.join('\n');

    const message = `🛍️ *NEW ORDER RECEIVED*\n\n` +
      `📦 *Order ID:* #${orderId.substring(0, 12).toUpperCase()}\n\n` +
      `👤 *Customer Details:*\n` +
      `Name: ${orderData.customerName}\n` +
      `Phone: ${orderData.customerPhone}\n` +
      `Email: ${orderData.customerEmail}\n\n` +
      `📍 *Shipping Address:*\n${orderData.shippingAddress}\n\n` +
      `🛒 *Order Items:*\n${productList}\n\n` +
      `💰 *Total Amount:* ₹${orderData.total.toLocaleString('en-IN')}\n` +
      `💳 *Payment Method:* ${orderData.paymentMethod}\n` +
      `✅ *Payment Status:* ${orderData.paymentStatus === 'paid' ? 'Paid' : 'Pending (COD)'}\n\n` +
      `⏰ *Order Time:* ${new Date().toLocaleString('en-IN')}`;

    // WhatsApp number
    const whatsappNumber = '919791962802';

    // Option 1: Using Twilio (Recommended - requires Twilio account)
    // Uncomment and configure when you have Twilio credentials
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWhatsAppNumber,
          To: `whatsapp:+${whatsappNumber}`,
          Body: message,
        }),
      }
    );

    const twilioData = await twilioResponse.json();
    
    if (!twilioResponse.ok) {
      throw new Error(twilioData.message || 'Failed to send WhatsApp message');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp notification sent successfully',
      messageId: twilioData.sid 
    });
    */

    // Option 2: Using WhatsApp Business API (requires approved business account)
    // Uncomment and configure when you have WhatsApp Business API access
    /*
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
    
    const whatsappResponse = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: whatsappNumber,
        type: 'text',
        text: {
          body: message
        }
      }),
    });

    const whatsappData = await whatsappResponse.json();
    
    if (!whatsappResponse.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp notification sent successfully',
      messageId: whatsappData.messages[0].id 
    });
    */

    // Option 3: Using a third-party service like WATI, Interakt, or similar
    // Replace with your service's API endpoint and credentials
    /*
    const apiUrl = process.env.WHATSAPP_SERVICE_URL;
    const apiKey = process.env.WHATSAPP_SERVICE_API_KEY;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: whatsappNumber,
        message: message,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp notification sent successfully' 
    });
    */

    // Temporary: Log the message (for development/testing)
    console.log('=== WhatsApp Message to be sent ===');
    console.log(`To: ${whatsappNumber}`);
    console.log(`Message:\n${message}`);
    console.log('===================================');

    // Return success (you need to implement one of the above options for actual sending)
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp notification logged (configure API for actual sending)',
      note: 'Please configure Twilio, WhatsApp Business API, or third-party service to send messages'
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send WhatsApp notification' 
      },
      { status: 500 }
    );
  }
}
