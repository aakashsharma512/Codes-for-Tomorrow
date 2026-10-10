import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import path from "path";


const serviceAccount = require(path.resolve(__dirname, "../../serviceAccountKey.json"));
if(!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const Firestore = getFirestore();
export { FieldValue };