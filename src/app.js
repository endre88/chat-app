import './scss/style.scss';
import config from './db_config.js';
import {initializeApp} from 'firebase/app'
import {getFirestore, collection, addDoc, Timestamp, query, orderBy,getDocs} from 'firebase/firestore'

const app= initializeApp(config)

const db=getFirestore(app)

async function sendMessage(message){
const docRef=await addDoc(collection(db,"messages"),message); //read data firebase
console.log('Document written witht ID: ', docRef.id)
}

function createMessage(){
    const message=document.querySelector('#message').value;
    const username= document.querySelector('#nickname').value; 
    const date=Timestamp.now();
    return {message:message,username,date};
}

/** dowloads all messages from databes and display them ordereb by date*/
async function displayAllMessages(){
  const q=query(collection(db,'messages'), orderBy('date', 'desc'));
const messages= await getDocs(q);
document.querySelector('#messages').innerHTML='';
messages.forEach((doc)=>{
  displayMessage(doc.data());
})
}

function displayMessage(message){
    const messageHTML=/*html*/`
        <div id="messages" class="messages">
          <div class="message">
            <i class="fas fa-user"></i>
            <div>
              <span class="username">${message.username}
                <time>just now</time>
              </span>
              <br />
              <span class="message-text">${message.message}</span>
            </div>
            <div class="message-edit-buttons">
              <i class="fas fa-trash-alt"></i>
              <i class="fas fa-pen"></i>
            </div>
          </div>
          `;
      document.querySelector('#messages').insertAdjacentHTML('beforeend', messageHTML);
}



document.querySelector('#send').addEventListener('click',()=>{
    const message=createMessage();
    if (message.message&&message.username) sendMessage(message);
})

window.addEventListener('DOMContentLoaded',()=> { displayAllMessages();})