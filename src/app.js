import './scss/style.scss';
import config from './db_config.js';
import {initializeApp} from 'firebase/app';
import {getFirestore, collection, addDoc, Timestamp, query, orderBy,getDocs, onSnapshot, doc, deleteDoc, updateDoc} from 'firebase/firestore'
import scrollIntoView from 'scroll-into-view-if-needed';

const app= initializeApp(config)

const db=getFirestore(app)

async function sendMessage(message){
const docRef=await addDoc(collection(db,"messages"),message); 
}

function createMessage(){
    const message=document.querySelector('#message').value;
    const username= document.querySelector('#nickname').value; 
    const date=Timestamp.fromDate(new Date());
    return {message,username,date}; 
}

/** dowloads all messages from databes and display them ordereb by date*/
async function displayAllMessages(){
  const q=query(collection(db,'messages'), orderBy('date', 'asc'));
  const messages= await getDocs(q);
  document.querySelector('#messages').innerHTML='';
  messages.forEach((doc)=>{
  displayMessage(doc.data(),doc.id);
})
}

function displayMessage(message,id){
    const messageHTML=/*html*/`
          <div class="message" data-id="${id}">
            <i class="fas fa-user"></i> 
            <div>
              <span class="username">${message.username}
                <time>${message.date.toDate().toLocaleString()}</time>
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
      scrollIntoView(document.querySelector('#messages'),{
        scrollMode:'if-needed',
        block:'end'
      });

      document.querySelector(`[data-id="${id}"] .fa-trash-alt`).addEventListener('click', ()=>
      {deleteMessage(id);});

      document.querySelector(`[data-id="${id}"] .fa-pen`).addEventListener('click', ()=>
      {displayEditMessage(id);});

}

function handleSubmit(){
  const message=createMessage();
  if (message.message&&message.username) {
  sendMessage(message);
  document.querySelector('#message').value=""; //Amint rányomtunk a send gombra legyen üres az üzenet mező
}
}

document.querySelector('#send').addEventListener('click', handleSubmit);


document.addEventListener('keyup', (event)=>{
  if (event.key==='Enter'){
    handleSubmit();
  }
});

onSnapshot(collection(db,'messages'),(snapshot)=>{
  snapshot.docChanges().forEach((change)=>{
    if (change.type ==='added'){
      displayMessage(change.doc.data(),change.doc.id);}
    if (change.type ==='modified'){
      //displayEditMessage(change.doc.id) ?? Nem értem, hogy miért nem kell
    }
    if (change.type ==='removed'){
      removeMessage(change.doc.id);
    }
  })
})

async function removeMessage(id){
  document.querySelector(`[data-id="${id}"]`).outerHTML="";
}

async function deleteMessage(id){
  const docRef = doc(db,'messages', id);
  await deleteDoc(docRef);
  //a firebase adatbázisból törli a bejegyzést törlendő ID-val
}

async function displayEditMessage(id){
  const editPopupHTML = /*html*/ `
  <div class="popup-container" id="popup">
    <div class="edit-message" id="edit-message" data-id="${id}">
      <div id="close-popup" class="button">
        Close <i class="fa fa-window-close" aria-hidden="true"></i>
      </div>
      <textarea id="edit" name="" cols="30" rows="10">${document
        .querySelector(`.message[data-id="${id}"] .message-text`)
        .textContent.trim()}</textarea>
      <div id="save-message" class="button">
        Save message<i class="fas fa-save"></i>
      </div>
    </div>
  </div>
`;
document.querySelector('#app').insertAdjacentHTML('beforeend', editPopupHTML);

//üzenet szöveg módosítás
document.querySelector('#save-message').addEventListener('click', ()=>{
  const modMessage= document.querySelector(`#edit`).value
  document.querySelector(`.message[data-id="${id}"] .message-text`).textContent = modMessage;
  document.querySelector('#popup').outerHTML="";
  modifyMessage(id, modMessage);
  
})
//popup bezárás
  document.querySelector("#edit-message #close-popup").addEventListener('click', ()=>{
  document.querySelector("#popup").outerHTML="";
})
}

async function modifyMessage(id,message){
  const docRef = doc(db,'messages', id);
  await updateDoc(docRef,{message});
}

window.addEventListener('DOMContentLoaded',()=> { displayAllMessages();})