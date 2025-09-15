import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAR9dq1akl2v_aEQmA0h9ucDm_yPAXB2N4',
  authDomain: 'awesomeeds.firebaseapp.com',
  projectId: 'awesomeeds',
  storageBucket: 'awesomeeds.firebasestorage.app',
  messagingSenderId: '842763416031',
  appId: '1:842763416031:web:9b8c3c3a0a1a50a464146a',
  measurementId: 'G-RKS5P9P34F',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);


