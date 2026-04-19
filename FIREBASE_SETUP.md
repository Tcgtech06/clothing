# Firebase Setup Guide

## Error: "Missing or insufficient permissions"

This error occurs because Firestore security rules are not configured to allow read/write access.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vilvah**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules

Replace the existing rules with one of the following options:

#### Option A: Development Mode (Allow All - Use for Testing Only)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: This allows anyone to read/write your database. Only use for development/testing!

#### Option B: Production Mode (Recommended - With Authentication)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Orders collection - anyone can create, only owner can read
    match /orders/{orderId} {
      allow create: if true;
      allow read: if request.auth != null && 
                     resource.data.customerEmail == request.auth.token.email;
      allow update: if request.auth != null && 
                       request.auth.token.admin == true;
    }
    
    // Admin can read all orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     request.auth.token.admin == true;
    }
  }
}
```

#### Option C: Simple Production Mode (Email-based)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Orders collection
    match /orders/{orderId} {
      // Anyone can create orders
      allow create: if true;
      
      // Users can read their own orders by email
      allow read: if resource.data.customerEmail == request.resource.data.customerEmail;
      
      // Allow updates for order status (for admin panel)
      allow update: if true;
    }
  }
}
```

### Step 3: Publish the Rules
1. After pasting the rules, click **Publish** button
2. Wait for confirmation message

### Step 4: Test Your Application
1. Go back to your e-commerce site
2. Try placing an order
3. The order should now be saved successfully

## Current Setup

Your Firebase configuration is already in the code:
- **Project ID**: vilvah
- **Location**: `lib/firebase.ts`

## Troubleshooting

### If you still get permission errors:

1. **Check if rules are published**:
   - Go to Firebase Console → Firestore → Rules
   - Verify the rules are active

2. **Check collection name**:
   - Make sure you're using collection name: `orders`
   - Check in Firebase Console → Firestore → Data

3. **Clear browser cache**:
   - Clear cache and reload the page
   - Try in incognito/private mode

4. **Check Firebase project**:
   - Verify you're in the correct project (vilvah)
   - Check if Firestore is enabled

## For Production

For a production environment, you should:

1. **Enable Firebase Authentication**:
   - Go to Firebase Console → Authentication
   - Enable Email/Password or Google Sign-in
   - Update the app to use authentication

2. **Use Secure Rules**:
   - Implement proper authentication
   - Use Option B rules (with authentication)
   - Add admin role for admin panel access

3. **Add Indexes** (if needed):
   - Firebase will prompt you to create indexes
   - Click the link in the error message to auto-create

## Quick Fix for Testing

If you just want to test quickly, use **Option A** (Development Mode):

1. Go to Firebase Console
2. Firestore Database → Rules
3. Paste Option A rules
4. Click Publish
5. Test your app immediately

Remember to change to secure rules before going to production! 🔒

---

## Firebase Storage Setup (For Image Uploads)

### Storage Rules

1. Go to Firebase Console → **Storage** → **Rules**
2. Replace with:

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

3. Click **Publish**

### CORS Configuration (Required for Image Uploads)

If you get CORS errors when uploading images, you need to configure CORS:

#### Using Google Cloud Console (Easiest):

1. Go to https://console.cloud.google.com/
2. Select project: **vilvah**
3. Click **Cloud Shell** icon (>_) in top right
4. Run these commands:

```bash
# Create CORS config
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

# Apply CORS
gsutil cors set cors.json gs://vilvah.firebasestorage.app

# Verify
gsutil cors get gs://vilvah.firebasestorage.app
```

5. Wait 2-3 minutes for changes to propagate
6. Try uploading images again

### Common Storage Errors:

**Error: "CORS policy blocked"**
- Solution: Configure CORS using the steps above

**Error: "storage/unauthorized"**
- Solution: Update Storage Rules (see above)

**Error: "Failed to upload"**
- Check file size (max 5MB)
- Check file type (must be image)
- Check browser console for specific error
