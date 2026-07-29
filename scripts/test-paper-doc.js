const admin = require('firebase-admin');

admin.initializeApp({
    projectId: 'studyvault-4ec70' // or whatever it uses, wait, maybe we can run this through tsx/ts-node using current project?
});

async function main() {
    const db = admin.firestore();
    const snapshot = await db.collection('papers').where('uploaderId', '==', 'FY1x0Pk0ZcO9UeW0aC89wB2rEis1').get();

    snapshot.forEach(doc => {
        console.log(doc.id, doc.data().title, doc.data().fileUrl, doc.data().storagePath, doc.data().fileName);
    });
}
main().catch(console.error);
