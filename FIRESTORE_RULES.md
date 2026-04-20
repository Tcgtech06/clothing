# Firestore Security Rules

Update your Firestore security rules in Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select project: **vilvah**
3. Click **Firestore Database** → **Rules** tab
4. Replace with the rules below and click **Publish**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users - allow list for phone login lookup
    match /users/{userId} {
      allow read: if request.auth != null;
      allow list: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Products - public read, auth write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    // Orders - auth only
    match /orders/{orderId} {
      allow read, create, update, delete: if request.auth != null;
    }

    // Reviews - public read, auth write (own reviews only)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```
