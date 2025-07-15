// Script to add sample meta data to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQ5NqH5_v8R1mc9VXTXrFwyzVofafpV28",
  authDomain: "studyvault-4ec70.firebaseapp.com",
  projectId: "studyvault-4ec70",
  storageBucket: "studyvault-4ec70.firebasestorage.app",
  messagingSenderId: "138709067049",
  appId: "1:138709067049:web:c455d2e31e4226f7e3c338"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const sampleData = {
  colleges: [
    { name: 'Delhi University' },
    { name: 'Mumbai University' },
    { name: 'Calcutta University' },
    { name: 'Madras University' },
    { name: 'Pune University' },
    { name: 'Other' }
  ],
  semesters: [
    { name: '1st Semester' },
    { name: '2nd Semester' },
    { name: '3rd Semester' },
    { name: '4th Semester' },
    { name: '5th Semester' },
    { name: '6th Semester' },
    { name: '7th Semester' },
    { name: '8th Semester' }
  ],
  courses: [
    { name: 'Computer Science Engineering' },
    { name: 'Electrical Engineering' },
    { name: 'Mechanical Engineering' },
    { name: 'Civil Engineering' },
    { name: 'Information Technology' },
    { name: 'Electronics & Communication' },
    { name: 'Other' }
  ]
};

// Function to add meta data if it doesn't exist
const addMetaData = async () => {
  try {
    console.log('Checking existing meta data...');
    
    for (const [type, items] of Object.entries(sampleData)) {
      // Check if collection exists and has items
      const snapshot = await getDocs(collection(db, type));
      
      if (snapshot.empty) {
        console.log(`No ${type} found, adding sample data...`);
        
        // Add sample data
        for (const item of items) {
          await addDoc(collection(db, type), item);
          console.log(`Added ${item.name} to ${type}`);
        }
      } else {
        console.log(`${type} collection already has ${snapshot.size} items`);
      }
    }
    
    console.log('Meta data check complete!');
  } catch (error) {
    console.error('Error adding meta data:', error);
  }
};

// Run the function
addMetaData(); 