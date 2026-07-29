const urlStr1 = "https://firebasestorage.googleapis.com/v0/b/study-volte-4ec70.appspot.com/o/papers%2FUSER%2FFILE.pdf?alt=media";
const urlStr2 = "https://firebasestorage.googleapis.com/v0/b/studyvault-4ec70.firebasestorage.app/o/papers%2FUSER%2F4th-sem_unlocked?alt=media";
const urlStr3 = "https://studyvault-4ec70.firebasestorage.app/papers/USER/4th-sem_unlocked?alt=media";

function extract(fileUrl) {
    try {
        let storagePath = null;
        const urlObj = new URL(fileUrl);
        const pathName = urlObj.pathname;
        const decodedPath = decodeURIComponent(pathName);
        const match = decodedPath.match(/\/o\/(.+)$/);
        if (match && match[1]) {
            storagePath = match[1];
        }
        console.log({ fileUrl, pathName, decodedPath, storagePath });
    } catch (e) {
        console.error(e);
    }
}

extract(urlStr1);
extract(urlStr2);
extract(urlStr3);

