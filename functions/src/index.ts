import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as webpush from "web-push";

admin.initializeApp();

// Trigger when order status is updated
export const sendOrderStatusNotification = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Check if status changed
    if (newData.status === oldData.status) {
      console.log("Status unchanged, skipping notification");
      return null;
    }

    const orderIdShort = context.params.orderId.substring(0, 8).toUpperCase();
    console.log(
      `Order ${orderIdShort} status: ${oldData.status} → ${newData.status}`
    );

    try {
      // Get user's FCM token from Firestore
      const userTokenDoc = await admin
        .firestore()
        .collection("userFCMTokens")
        .doc(newData.customerEmail)
        .get();

      if (!userTokenDoc.exists) {
        console.log("No FCM token found for user:", newData.customerEmail);
        return null;
      }

      const tokenData = userTokenDoc.data();
      if (!tokenData || !tokenData.subscription) {
        console.log("Invalid token data for user:", newData.customerEmail);
        return null;
      }

      // Status messages
      const statusMessages: {
        [key: string]: { title: string; body: string };
      } = {
        "accepted": {
          title: "✅ Order Accepted by Admin",
          body: `Your order #${orderIdShort} has been accepted`,
        },
        "processing": {
          title: "⚙️ Order Processing",
          body: `Your order #${orderIdShort} is being processed`,
        },
        "shipped": {
          title: "🚚 Order Shipped",
          body: `Your order #${orderIdShort} has been shipped`,
        },
        "nearby": {
          title: "📍 Order Nearby",
          body: `Your order #${orderIdShort} is nearby for delivery`,
        },
        "out-for-delivery": {
          title: "🚛 Out for Delivery",
          body: `Your order #${orderIdShort} is out for delivery`,
        },
        "delivered": {
          title: "✅ Order Delivered",
          body: `Your order #${orderIdShort} has been delivered`,
        },
      };

      const notification = statusMessages[newData.status];

      if (!notification) {
        console.log("No notification message for status:", newData.status);
        return null;
      }

      // VAPID keys
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ||
        "BPL-rJODSb6phARIC3tnKmYdnABSOyo8bIs-HP5mJeMaKv4AVPWynM8XDUnnM_CH5FS1nX9EDQM5twMJvaJ5XEQ";
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

      if (!vapidPrivateKey) {
        console.error("VAPID_PRIVATE_KEY not set");
      } else {
        webpush.setVapidDetails(
          "mailto:tcgtechnology01@gmail.com",
          vapidPublicKey,
          vapidPrivateKey
        );

        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          data: {
            orderId: context.params.orderId,
            status: newData.status,
            url: "/orders",
          },
        });

        try {
          await webpush.sendNotification(tokenData.subscription, payload);
          console.log("Successfully sent web push notification");
        } catch (error) {
          console.error("Error sending web push:", error);
        }
      }

      // Create in-app notification in Firestore
      await admin.firestore().collection("userNotifications").add({
        userId: tokenData.userId,
        orderId: context.params.orderId,
        title: notification.title,
        message: notification.body,
        type: "order",
        status: newData.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      console.log("In-app notification created");
      return null;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  });

// Trigger when new order is created (for admin)
export const sendNewOrderNotification = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderIdShort = context.params.orderId.substring(0, 8).toUpperCase();

    console.log("New order created:", orderIdShort);

    try {
      // Get all admin FCM tokens
      const adminTokensSnapshot = await admin
        .firestore()
        .collection("adminFCMTokens")
        .get();

      if (adminTokensSnapshot.empty) {
        console.log("No admin FCM tokens found");
      } else {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ||
          "BPL-rJODSb6phARIC3tnKmYdnABSOyo8bIs-HP5mJeMaKv4AVPWynM8XDUnnM_CH5FS1nX9EDQM5twMJvaJ5XEQ";
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

        if (vapidPrivateKey) {
          webpush.setVapidDetails(
            "mailto:tcgtechnology01@gmail.com",
            vapidPublicKey,
            vapidPrivateKey
          );

          const payload = JSON.stringify({
            title: "🛍️ New Order Received",
            body: `Order #${orderIdShort} - ₹${orderData.total} from ${orderData.customerName}`,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            data: {
              orderId: context.params.orderId,
              type: "new-order",
              url: "/admin-dashboard-secret",
            },
          });

          // Send to all admin tokens
          const promises = adminTokensSnapshot.docs.map((doc) => {
            const tokenData = doc.data();
            if (tokenData.subscription) {
              return webpush
                .sendNotification(tokenData.subscription, payload)
                .catch((error: Error) => {
                  console.error("Error sending to admin:", error);
                });
            }
            return Promise.resolve();
          });

          await Promise.all(promises);
          console.log("Successfully sent notifications to admins");
        }
      }

      // Create admin notification in Firestore
      await admin.firestore().collection("adminNotifications").add({
        title: "🛍️ New Order Received",
        message: `Order #${orderIdShort} - ₹${orderData.total} from ${orderData.customerName}`,
        type: "order",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      console.log("Admin in-app notification created");
      return null;
    } catch (error) {
      console.error("Error sending admin notification:", error);
      return null;
    }
  });
