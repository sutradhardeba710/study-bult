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
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([^=]+?)\s*=\s*(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
    }
});

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

async function checkLogs() {
    try {
        const q = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(5));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('No logs found in system_logs.');
        } else {
            console.log('\n--- Recent System Logs ---');
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`[${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'N/A'}] ${data.type || 'Log'}`);
                console.log('Status:', data.status);
                if (data.error) console.log('Error:', data.error);
                if (data.stack) console.log('Stack:', data.stack);
                if (data.filePath) console.log('File:', data.filePath);
                console.log('---------------------------\n');
            });
        }
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

checkLogs();
