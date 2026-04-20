# Firestore Security Rules

## Current Issue
The login is failing with "Missing or insufficient permissions" when trying to search for users by phone number. This is because Firestore security rules are blocking the query.

## Solution
Update your Firestore security rules in Firebase Console:

### Steps:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **vilvah**
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Replace the existing rules with the rules below
6. Click **Publish**

### Firestore Security Rules (Copy and Paste):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - allow queries for phone/email lookup during login
    match /users/{userId} {
      // Allow reading user data if authenticated
      allow read: if request.auth != null;
      // Allow querying by phone number for login (unauthenticated)
      allow list: if true;
      // Allow writing only to own user document
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection - anyone can read, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Orders collection - users can read/write their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### What These Rules Do:

1. **Users Collection**:
   - Anyone can list/query user documents (needed for phone number login lookup)
   - Any authenticated user can read individual user documents
   - Users can only write to their own user document (userId must match their auth.uid)

2. **Products Collection**:
   - Anyone can read products (even without login)
   - Only authenticated users can create/update/delete products

3. **Orders Collection**:
   - Only authenticated users can read/write orders
   - Users can access all orders (for admin dashboard)

### After Publishing Rules:
- Phone number login will work correctly
- Signup will work correctly
- User data will be saved to Firestore
- No more "Missing or insufficient permissions" error

### Alternative (Development Only - NOT RECOMMENDED FOR PRODUCTION):
If you want to test quickly, you can use these permissive rules (ONLY FOR DEVELOPMENT):

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

**WARNING**: The alternative rules above allow anyone to read/write all data. Only use for testing!
