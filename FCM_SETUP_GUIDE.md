# Firebase Cloud Messaging (FCM) Setup Guide

## Step 1: Enable FCM in Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **vilvah**
3. Click on **Project Settings** (gear icon) → **Cloud Messaging** tab
4. You'll see **Cloud Messaging API (Legacy)** - this is already enabled by default

## Step 2: Get Your VAPID Key

1. In the same **Cloud Messaging** tab
2. Scroll down to **Web configuration**
3. Under **Web Push certificates**, click **Generate key pair**
4. Copy the **Key pair** (this is your VAPID public key)
5. Save it - you'll need it in Step 5

Example: `BKxxx...xxx` (long string)

## Step 3: Install Firebase CLI and Initialize Functions

Open your terminal in the project folder:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Functions
firebase init functions
```

When prompted:
- Select **JavaScript** (or TypeScript if you prefer)
- Install dependencies: **Yes**
- Use ESLint: **Yes** (optional)

This creates a `functions` folder in your project.

## Step 4: Install Required Dependencies

```bash
cd functions
npm install firebase-admin
npm install firebase-functions
cd ..
```

## Step 5: Update Environment Variables

Add your VAPID key to `.env.local`:

```env
# Add this line (replace with your actual VAPID key from Step 2)
NEXT_PUBLIC_VAPID_KEY=BKxxx...xxx
```

## Step 6: Create Cloud Function

Create/edit `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger when order status is updated
exports.sendOrderStatusNotification = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Check if status changed
    if (newData.status === oldData.status) {
      console.log('Status unchanged, skipping notification');
      return null;
    }
    
    console.log(`Order ${context.params.orderId} status changed: ${oldData.status} → ${newData.status}`);
    
    try {
      // Get user's FCM token from Firestore
      const userTokenDoc = await admin.firestore()
        .collection('userFCMTokens')
        .doc(newData.customerEmail)
        .get();
      
      if (!userTokenDoc.exists) {
        console.log('No FCM token found for user:', newData.customerEmail);
        return null;
      }
      
      const fcmToken = userTokenDoc.data().token;
      
      // Status messages
      const statusMessages = {
        'accepted': {
          title: '✅ Order Accepted by Admin',
          body: `Your order #${context.params.orderId.substring(0, 8).toUpperCase()} has been accepted and is being prepared`
        },
        'processing': {
          title: '⚙️ Order Processing',
          body: `Your order #${context.params.orderId.substring(0, 8).toUpperCase()} is being processed`
        },
        'shipped': {
          title: '🚚 Order Shipped',
          body: `Your order #${context.params.orderId.substring(0, 8).toUpperCase()} has been shipped and is on the way`
        },
        'nearby': {
          title: '📍 Order Nearby',
          body: `Your order #${context.params.orderId.substring(0, 8).toUpperCase()} is nearby for delivery`
        },
        'out-for-delivery': {
          title: '🚛 Out for Delivery',
          body: `Your order #${context.params.orderId.substring(0, 8).toUpperCase()} is out for delivery`
        },
        'delivered': {
          title: '✅ Order Delivered',
          body: `Your order #${context.params.orderId.substring(0, 8).toUpperCase()} has been delivered successfully`
        }
      };
      
      const notification = statusMessages[newData.status];
      
      if (!notification) {
        console.log('No notification message for status:', newData.status);
        return null;
      }
      
      // Send FCM notification
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/icon-192x192.png',
        },
        data: {
          orderId: context.params.orderId,
          status: newData.status,
          url: '/orders'
        },
        token: fcmToken
      };
      
      const response = await admin.messaging().send(message);
      console.log('Successfully sent notification:', response);
      
      // Also create in-app notification in Firestore
      await admin.firestore().collection('userNotifications').add({
        userId: userTokenDoc.data().userId,
        orderId: context.params.orderId,
        title: notification.title,
        message: notification.body,
        type: 'order',
        status: newData.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });
      
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

// Trigger when new order is created (for admin)
exports.sendNewOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    
    console.log('New order created:', context.params.orderId);
    
    try {
      // Get all admin FCM tokens
      const adminTokensSnapshot = await admin.firestore()
        .collection('adminFCMTokens')
        .get();
      
      if (adminTokensSnapshot.empty) {
        console.log('No admin FCM tokens found');
        return null;
      }
      
      const tokens = adminTokensSnapshot.docs.map(doc => doc.data().token);
      
      // Send notification to all admins
      const message = {
        notification: {
          title: '🛍️ New Order Received',
          body: `Order #${context.params.orderId.substring(0, 8).toUpperCase()} - ₹${orderData.total} from ${orderData.customerName}`,
          icon: '/icon-192x192.png',
        },
        data: {
          orderId: context.params.orderId,
          type: 'new-order',
          url: '/admin-dashboard-secret'
        }
      };
      
      // Send to all admin tokens
      const promises = tokens.map(token => 
        admin.messaging().send({ ...message, token })
      );
      
      await Promise.all(promises);
      console.log('Successfully sent notifications to admins');
      
      // Create admin notification in Firestore
      await admin.firestore().collection('adminNotifications').add({
        title: '🛍️ New Order Received',
        message: `Order #${context.params.orderId.substring(0, 8).toUpperCase()} - ₹${orderData.total} from ${orderData.customerName}`,
        type: 'order',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });
      
      return null;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return null;
    }
  });
```

## Step 7: Deploy Cloud Functions

```bash
# Deploy functions to Firebase
firebase deploy --only functions
```

This will take 2-3 minutes. You'll see:
```
✔  functions: Finished running predeploy script.
✔  functions[sendOrderStatusNotification]: Successful create operation.
✔  functions[sendNewOrderNotification]: Successful create operation.
```

## Step 8: Update Client Code to Request FCM Token

Now we need to update the client to get FCM tokens and store them.

I'll create the updated files in the next step.

## Step 9: Update Firestore Rules

Add these rules to allow storing FCM tokens:

```javascript
// User FCM Tokens
match /userFCMTokens/{email} {
  allow read, write: if request.auth != null;
}

// Admin FCM Tokens
match /adminFCMTokens/{tokenId} {
  allow read, write: if request.auth != null;
}
```

## Step 10: Test

1. Open your app on mobile
2. Grant notification permission
3. FCM token will be stored automatically
4. Close the app completely
5. Update order status from admin panel
6. You should receive push notification! 🎉

## Troubleshooting

### "No FCM token found"
- Make sure user granted notification permission
- Check if token is stored in Firestore `userFCMTokens` collection

### "Permission denied"
- Update Firestore rules (Step 9)
- Make sure user is authenticated

### "Function not triggering"
- Check Firebase Console → Functions → Logs
- Make sure functions are deployed successfully

### "Notification not showing"
- Check browser console for errors
- Make sure service worker is registered
- Check notification permission is granted

## Cost

- **Firebase Cloud Functions:** Free tier = 2M invocations/month
- **Firebase Cloud Messaging:** Completely FREE, unlimited
- **Firestore:** Free tier = 50K reads/day, 20K writes/day

For a small e-commerce app: **$0/month** ✅

## Next Steps

After completing this setup:
1. Test with your mobile device
2. Verify notifications work when app is closed
3. Monitor Firebase Console → Functions → Logs
4. Check Firestore for stored tokens

Need help? Check the logs in Firebase Console!
