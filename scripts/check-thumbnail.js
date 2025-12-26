const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkLatestPaper() {
    try {
        const snapshot = await db.collection('papers')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log('No papers found.');
            return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        console.log('Latest Paper:', data.title);
        console.log('File Name:', data.fileName);
        console.log('Thumbnail URL:', data.thumbnailUrl);

        if (data.thumbnailUrl && data.thumbnailUrl.includes('storage.googleapis.com')) {
            console.log('SUCCESS: Thumbnail URL is present and valid.');
        } else {
            console.log('FAILURE: Thumbnail URL is missing or invalid.');
        }

    } catch (error) {
        console.error('Error fetching paper:', error);
    }
}

checkLatestPaper();
