import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('Seeding Firestore tables directly from backend...');
  
  const uid = 'weatherguard_dummy_user_1';
  
  // 1. Create User Document (creates 'users' collection)
  await setDoc(doc(db, 'users', uid), {
    uid,
    name: 'WeatherGuard Seed User',
    email: 'test@weatherguard.local',
    primaryUserType: 'Weather Enthusiast',
    interests: ['Weather Monitoring', 'Disaster Awareness', 'Astronomy'],
    role: 'general',
    createdAt: Date.now(),
  });
  console.log('✅ Created users table!');

  // 2. Create Saved Location (creates 'savedLocations' subcollection)
  await setDoc(doc(db, 'users', uid, 'savedLocations', 'loc1'), {
    locationId: 'loc1',
    name: 'Home Observatory',
    lat: 20.29,
    lon: 85.82,
    placeLabel: 'Home',
    isDefault: true,
    alertEnabled: true
  });
  console.log('✅ Created savedLocations table!');

  // 3. Create Alert Rule (creates 'alertRules' subcollection)
  await setDoc(doc(db, 'users', uid, 'alertRules', 'rule1'), {
    ruleId: 'rule1',
    type: 'Rain',
    threshold: 70,
    radius: 50
  });
  console.log('✅ Created alertRules table!');

  console.log('All tables created successfully! Please refresh your Firebase Console page.');
  process.exit(0);
}

seed().catch(err => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
