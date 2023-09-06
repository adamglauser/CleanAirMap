import { FirebaseOptions, initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import dotenv from 'dotenv'

dotenv.config()
async function initFirebase() {
    console.log("Initializing firebase client API app")
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CLIENT_CONFIG ?? "{}");

    return initializeApp(firebaseConfig)
}

(async () => {
    const app = await initFirebase()
    const auth = getAuth(app)
    const userCredentials = JSON.parse(process.env.FIREBASE_CLIENT_USER ?? "{ email: undefined, password: undefined }")
    let { user } = await signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)

    user.getIdToken().then((token) => { console.log(`User token: ${token}`)})

    await signOut(auth)
})();