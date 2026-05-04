# Firebase Cloud Messaging Setup - Terminal Commands

## Your VAPID Key (Already Added)
```
BPL-rJODSb6phARIC3tnKmYdnABSOyo8bIs-HP5mJeMaKv4AVPWynM8XDUnnM_CH5FS1nX9EDQM5twMJvaJ5XEQ
```

## Step 1: Add VAPID Key to .env.local

Open `.env.local` file and add this line:
```
NEXT_PUBLIC_VAPID_KEY=BPL-rJODSb6phARIC3tnKmYdnABSOyo8bIs-HP5mJeMaKv4AVPWynM8XDUnnM_CH5FS1nX9EDQM5twMJvaJ5XEQ
```

## Step 2: Install Firebase CLI

Run this command in your terminal:
```bash
npm install -g firebase-tools
```

## Step 3: Login to Firebase

```bash
firebase login
```

This will open a browser window. Login with your Google account that has access to the Firebase project.

## Step 4: Initialize Firebase Functions

```bash
firebase init functions
```

When prompted, select:
- **Use an existing project** → Select **vilvah**
- **Language**: JavaScript
- **ESLint**: Yes
- **Install dependencies**: Yes

This creates a `functions` folder.

## Step 5: Install Dependencies in Functions Folder

```bash
cd functions
npm install firebase-admin firebase-functions
cd ..
```

## Step 6: Create the Cloud Function

The Cloud Function code is already prepared in `FCM_SETUP_GUIDE.md`.

Copy the code from `FCM_SETUP_GUIDE.md` (Step 6) and paste it into `functions/index.js`

## Step 7: Deploy Functions to Firebase

```bash
firebase deploy --only functions
```

This will take 2-3 minutes. You'll see:
```
✔  functions[sendOrderStatusNotification]: Successful create operation.
✔  functions[sendNewOrderNotification]: Successful create operation.
```

## Step 8: Update Firestore Rules

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **vilvah**
3. Go to **Firestore Database** → **Rules**
4. Add these rules:

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

5. Click **Publish**

## Step 9: Test the Setup

1. **Build and run your app:**
```bash
npm run build
npm run dev
```

2. **Open app on mobile** (or desktop)

3. **Grant notification permission** when prompted

4. **Check Firestore** - you should see:
   - Collection: `userFCMTokens` with your email
   - Your FCM token stored

5. **Close the app completely** (close Chrome tab)

6. **Update order status from admin panel**

7. **You should receive push notification!** 🎉

## Troubleshooting

### "firebase: command not found"
```bash
npm install -g firebase-tools
```

### "Permission denied"
Run terminal as administrator (Windows) or use `sudo` (Mac/Linux)

### "No project found"
```bash
firebase use --add
```
Then select **vilvah** project

### "Functions not deploying"
Check `functions/package.json` - make sure it has:
```json
{
  "engines": {
    "node": "18"
  }
}
```

### "VAPID key not working"
Make sure `.env.local` has the key and restart dev server:
```bash
npm run dev
```

## Verify Everything Works

1. **Check Functions in Firebase Console:**
   - Go to Firebase Console → Functions
   - You should see 2 functions:
     - `sendOrderStatusNotification`
     - `sendNewOrderNotification`

2. **Check Firestore Collections:**
   - `userFCMTokens` - should have user tokens
   - `adminFCMTokens` - should have admin tokens

3. **Check Function Logs:**
   - Firebase Console → Functions → Logs
   - You'll see logs when functions trigger

## Cost

- **Firebase Functions**: FREE (2M invocations/month)
- **Firebase Cloud Messaging**: FREE (unlimited)
- **Total**: $0/month ✅

## Next Steps

After setup is complete:
1. Test on mobile device
2. Test with app completely closed
3. Monitor Firebase Console → Functions → Logs
4. Deploy to production

## Need Help?

If you get stuck, check:
1. Firebase Console → Functions → Logs (for errors)
2. Browser Console (F12) → Check for errors
3. Firestore → Check if tokens are being stored

Everything should work after following these steps! 🚀
