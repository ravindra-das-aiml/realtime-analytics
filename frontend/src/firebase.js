import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCyuSEYUY1lOD1Lytk5rKXer81IZYlug-Q",
 authDomain: "realtime-analytics-dashboard-jet.vercel.app",
  projectId: "realtime-analytics-a4a1f",
  storageBucket: "realtime-analytics-a4a1f.firebasestorage.app",
  messagingSenderId: "121748876970",
  appId: "1:121748876970:web:64f131210b53e8c2fbead3",
  measurementId: "G-N5X1CDZLTW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithRedirect(auth, googleProvider);    const user = result.user;
    return {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      token: await user.getIdToken()
    };
  } catch (error) {
    console.error("Google login error:", error);
    return null;
  }
};