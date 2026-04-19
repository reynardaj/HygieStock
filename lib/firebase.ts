import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Try to get a non-existent doc to test connection
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firebase connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client appears to be offline.");
    }
    // Other errors are expected if the collection doesn't exist or rules deny access, 
    // but 'offline' specifically indicates a config/network issue.
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

export default app;
