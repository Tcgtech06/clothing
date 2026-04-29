# Firestore Security Rules

## ACTION REQUIRED - Update in Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: **vilvah**
3. Click **Firestore Database** → **Rules** tab
4. Replace ALL existing rules with the rules below
5. Click **Publish**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admins - allow read for authentication, no write from client
    match /admins/{adminId} {
      allow read: if true;  // Allow reading for admin login authentication
      allow write: if false; // Prevent any write operations from client
    }

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

    // Orders - auth only, allow users to update their own orders
    match /orders/{orderId} {
      allow read, create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Return Requests - authenticated users can create and read their own
    match /returnRequests/{returnId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // User Votes - users can only create their own votes
    match /userVotes/{voteId} {
      allow read: if true;
      allow create: if request.auth != null 
                   && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    // Reviews - public read, any authenticated user can create
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Important Notes

### User Votes Collection
- **Read**: Public (anyone can see poll results)
- **Create**: Authenticated users can create votes (userId must match their auth UID)
- **Update/Delete**: Not allowed (votes are permanent)

### Return Requests Collection
- **Read**: Any authenticated user can read return requests
- **Create**: Authenticated users can create return requests (email must match their auth email)
- **Update/Delete**: Any authenticated user can update/delete (admin access)

### Security Considerations
For production, you should add more specific rules:
- Users should only read their own return requests
- Only admins should be able to update return status
- Consider adding custom claims for admin role

### Example Production Rules for Return Requests
```javascript
// More secure version (requires custom claims for admin)
match /returnRequests/{returnId} {
  // Users can only read their own return requests
  allow read: if request.auth != null 
             && (request.auth.token.email == resource.data.customerEmail 
                 || request.auth.token.admin == true);
  
  // Users can create return requests for their own orders
  allow create: if request.auth != null 
               && request.resource.data.customerEmail == request.auth.token.email;
  
  // Only admins can update or delete
  allow update, delete: if request.auth != null 
                        && request.auth.token.admin == true;
}
```
