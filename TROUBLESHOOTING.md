# Troubleshooting Guide

## Issue 1: Image Upload CORS Error

### Symptoms
- Console shows: "Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy"
- "Uploading image..." message stays forever
- Image doesn't upload

### Root Cause
Firebase Storage bucket doesn't have CORS configuration to allow requests from localhost:3000

### Solution (MUST DO THIS)

**Step 1: Go to Google Cloud Console**
1. Open: https://console.cloud.google.com/
2. Make sure you're in project **vilvah** (check dropdown at top)
3. Click the **Cloud Shell** icon (>_) in the top right corner

**Step 2: Run these commands in Cloud Shell**

```bash
# Create CORS configuration file
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
EOF

# Apply CORS to your storage bucket
gsutil cors set cors.json gs://vilvah.firebasestorage.app

# Verify it worked
gsutil cors get gs://vilvah.firebasestorage.app
```

**Step 3: Wait 2-3 minutes** for changes to propagate

**Step 4: Test image upload again**

---

## Issue 2: Order Placement Error

### Symptoms
- Orders not being created
- Error in console when placing order
- "Permission denied" or "Missing permissions" error

### Root Cause
Firestore security rules are blocking write access

### Solution

**Step 1: Update Firestore Rules**
1. Go to: https://console.firebase.google.com/
2. Select project: **vilvah**
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab
5. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**
7. Wait 1-2 minutes

**Step 2: Test order placement**

---

## Issue 3: Storage Rules Not Working

### Symptoms
- "storage/unauthorized" error
- Images can't be uploaded even after CORS fix

### Solution

**Update Storage Rules:**
1. Go to: https://console.firebase.google.com/
2. Select project: **vilvah**
3. Click **Storage** in left sidebar
4. Click **Rules** tab
5. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

6. Click **Publish**
7. Wait 1-2 minutes

---

## Complete Checklist

### For Image Upload to Work:
- [ ] Storage Rules updated (allow read, write: if true)
- [ ] CORS configured using gsutil command
- [ ] Waited 2-3 minutes after changes
- [ ] Cleared browser cache (Ctrl + Shift + Delete)
- [ ] Tried in incognito mode

### For Order Placement to Work:
- [ ] Firestore Rules updated (allow read, write: if true)
- [ ] Waited 1-2 minutes after changes
- [ ] Cleared browser cache
- [ ] Checked browser console for specific error

---

## Quick Verification

### Test 1: Check if Firestore is working
1. Go to: http://localhost:3000/checkout
2. Fill in shipping details
3. Click "Place Order"
4. Check browser console (F12)
5. If successful, you'll see: "Order created successfully: [order-id]"

### Test 2: Check if Storage is working
1. Go to: http://localhost:3000/admin-dashboard-secret
2. Click "Products" tab
3. Click "Add New Product"
4. Try uploading an image
5. Check browser console (F12)
6. If successful, you'll see: "Download URL: https://..."

---

## Still Not Working?

### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. Look for red error messages
4. Share the exact error message

### Common Errors and Solutions

**Error: "Failed to fetch"**
- Check internet connection
- Check if Firebase project is active
- Verify Firebase config in lib/firebase.ts

**Error: "Network request failed"**
- Check if you're online
- Try disabling VPN/proxy
- Check firewall settings

**Error: "quota exceeded"**
- You've hit Firebase free tier limits
- Upgrade to Blaze plan or wait 24 hours

**Error: "Invalid argument"**
- Check file size (must be < 5MB)
- Check file type (must be image/*)
- Try a different image file

---

## Alternative: Test on Production

Sometimes CORS issues only happen on localhost. Try deploying:

```bash
npm run build
git add .
git commit -m "Test deployment"
git push
```

Then test on your Netlify URL instead of localhost.

---

## Need More Help?

1. Open browser console (F12)
2. Try the action that's failing
3. Copy the EXACT error message
4. Share the error message for specific help
