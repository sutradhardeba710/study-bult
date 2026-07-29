import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

const env = {};
// Handle CRLF and LF, and spaces around =
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([^=]+?)\s*=\s*(.*)$/);
    if (match) {
        const key = match[1].trim();
        // Remove quotes
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
    }
});

// Debug: Check if we got the project ID
if (!env.VITE_FIREBASE_PROJECT_ID) {
    console.error('Error: VITE_FIREBASE_PROJECT_ID not found in .env.local');
    process.exit(1);
}

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

console.log('Connecting to Firebase project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLatestPaper() {
    try {
        const q = query(collection(db, 'papers'), orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('No papers found in the database.');
        } else {
            const doc = snapshot.docs[0];
            const data = doc.data();
            console.log('\n--- Latest Paper Upload ---');
            console.log('ID:', doc.id);
            console.log('Title:', data.title);
            console.log('File Name:', data.fileName);
            console.log('Uploader:', data.uploaderName);
            console.log('Created At:', data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A');
            console.log('Storage Path:', data.storagePath);
            console.log('File URL:', data.fileUrl);
            console.log('Thumbnail URL:', data.thumbnailUrl || 'NOT FOUND');
            console.log('---------------------------\n');
        }
    } catch (error) {
        console.error('Error fetching papers:', error);
    }
}

checkLatestPaper();
