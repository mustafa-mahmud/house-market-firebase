// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDNaaVReZyNNBdCM3s_oalYNEaYIlxSddM',
  authDomain: 'house-marketplace-6609d.firebaseapp.com',
  projectId: 'house-marketplace-6609d',
  storageBucket: 'house-marketplace-6609d.appspot.com',
  messagingSenderId: '231458866980',
  appId: '1:231458866980:web:36df615c7cb1f739de95b1',
  measurementId: 'G-9MQ17671R3',
};

// Initialize Firebase
initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore();
