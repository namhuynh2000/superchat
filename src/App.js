import './App.css';
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDrPQHJKD6LnFy0zuKuU5HDxmF8JiCQync",
  authDomain: "superchat-adde4.firebaseapp.com",
  projectId: "superchat-adde4",
  storageBucket: "superchat-adde4.appspot.com",
  messagingSenderId: "779447755494",
  appId: "1:779447755494:web:2bb1a317101fbf06e35127",
  measurementId: "G-VNKQ4BK5W1"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


function App() {
  const [user] = useAuthState(auth);
  console.log(user)

  return (
    <div className="App">
      <header>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  const user = auth.currentUser;
  return (user && (
    <button onClick={() => signOut(auth)}>Sign Out</button>
  )
  )
}



function ChatRoom() {
  const dummy = useRef();

  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(20));
  console.log("query", q);


  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  console.log(messages);

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <div>
        {messages && messages.map(msg => { return (<ChatMessage key={uuidv4()} message={msg} />) })}
        <div className='dummy' ref={dummy}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'>Add</button>
      </form>
    </>

  )
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div className={`message ${messageClass}`}>
      <img alt={uid} src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
