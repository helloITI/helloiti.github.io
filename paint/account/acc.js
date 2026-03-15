import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
setPersistence,
browserSessionPersistence,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-check.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyBVpaaiwzHah24ugYMXPS8F5l_oWi5sdLI",
authDomain: "draw-e5ea1.firebaseapp.com",
databaseURL: "https://draw-e5ea1-default-rtdb.europe-west1.firebasedatabase.app",
projectId: "draw-e5ea1",
storageBucket: "draw-e5ea1.appspot.com",
messagingSenderId: "749520633273",
appId: "1:749520633273:web:7150347948e8fcf37c8a68"
};

const app = initializeApp(firebaseConfig);

const siteKey = "YOUR_RECAPTCHA_V3_SITE_KEY_HERE";

const appCheck = initializeAppCheck(app,{
provider:new ReCaptchaV3Provider(siteKey),
isTokenAutoRefreshEnabled:true
});

const auth=getAuth(app);
const db=getDatabase(app);

const suUsername=document.getElementById("suUsername");
const suPassword=document.getElementById("suPassword");
const suConfirmPassword=document.getElementById("suConfirmPassword");
const suShowPass=document.getElementById("suShowPass");
const signupMsg=document.getElementById("signupMsg");

const liUsername=document.getElementById("liUsername");
const liPassword=document.getElementById("liPassword");
const liShowPass=document.getElementById("liShowPass");
const loginMsg=document.getElementById("loginMsg");

const btnSignUp=document.getElementById("btnSignUp");
const btnLogin=document.getElementById("btnLogin");
const btnLogout=document.getElementById("btnLogout");

const accountCard=document.getElementById("accountCard");
const accountInfo=document.getElementById("accountInfo");

const loginCard=document.getElementById("loginCard");
const signupCard=document.getElementById("signupCard");

const showSignup=document.getElementById("showSignup");
const showLoginP=document.getElementById("showLogin");
const showLoginLink=document.getElementById("showLoginLink");

function usernameToEmail(username){
return username.trim().toLowerCase()+"@app.local";
}

suShowPass.onchange=()=>{
suPassword.type=suShowPass.checked?"text":"password";
suConfirmPassword.type=suShowPass.checked?"text":"password";
};

liShowPass.onchange=()=>{
liPassword.type=liShowPass.checked?"text":"password";
};

showSignup.onclick=()=>{
loginCard.style.display="none";
signupCard.style.display="flex";
showSignup.parentElement.style.display="none";
showLoginP.style.display="block";
document.querySelector("h2").textContent="※⁜ register your paint account! ⁜※";
};

showLoginLink.onclick=()=>{
signupCard.style.display="none";
loginCard.style.display="flex";
showSignup.parentElement.style.display="block";
showLoginP.style.display="none";
document.querySelector("h2").textContent="※⁜ log in your paint account! ⁜※";
};

btnSignUp.onclick=async()=>{
const username=suUsername.value.trim().toLowerCase();
const password=suPassword.value;
const confirmPassword=suConfirmPassword.value;

signupMsg.textContent="";

if(!username||!password||!confirmPassword){
signupMsg.textContent="Please fill out all fields.";
return;
}

if(password!==confirmPassword){
signupMsg.textContent="Passwords do not match.";
return;
}

const usernameRegex=/^[a-z0-9_]+$/;

if(username.length===0||username.length>20||!usernameRegex.test(username)){
signupMsg.textContent="※⁜ username must be 1-20 characters long and contain only lowercase letters, numbers, or underscores! ⁜※";
return;
}

try{

const emailAlias=usernameToEmail(username);

const cred=await createUserWithEmailAndPassword(auth,emailAlias,password);

const userUid=cred.user.uid;

await set(ref(db,"usernames/"+username),{uid:userUid});

await set(ref(db,"users/"+userUid),{username});

signupMsg.textContent="※⁜ successfully created your paint account! ⁜※ "+username;

}catch(err){

let errorMessage="an error has occurred...";

if(err.code&&err.code.startsWith("auth/")){

if(err.code==="auth/email-already-in-use"){
errorMessage="※⁜ this email (username alias) is already in use. Try logging in or use a different username. ⁜※";
}

else if(err.code==="auth/weak-password"){
errorMessage="※⁜ password is too weak. Please choose a stronger password. ⁜※";
}

else{
errorMessage="Authentication error: "+err.message;
}

}

else if(err.message&&err.message.includes("Permission denied")){
errorMessage="※⁜ username has already been taken! please choose another one. ⁜※";
}

else{
errorMessage="Unexpected error: "+err.message;
}

signupMsg.textContent="※⁜ "+errorMessage+" ⁜※";

console.error("Signup error:",err);

}

};

btnLogin.onclick=async()=>{

const username=liUsername.value.trim().toLowerCase();
const password=liPassword.value;

loginMsg.textContent="";

if(!username||!password){
loginMsg.textContent="※⁜ please enter your username and password! ⁜※";
return;
}

try{

await setPersistence(auth,browserSessionPersistence);

const emailAlias=usernameToEmail(username);

await signInWithEmailAndPassword(auth,emailAlias,password);

loginMsg.textContent="※⁜ successfully logged in your paint account! ⁜※";

}catch(err){

let errorMessage="an error has occurred...";

if(err.code==="auth/user-not-found"||err.code==="auth/wrong-password"){
errorMessage="※⁜ invalid username or password. ⁜※";
}

else if(err.code==="auth/invalid-email"){
errorMessage="※⁜ invalid email format. ⁜※";
}

loginMsg.textContent="※⁜ "+errorMessage+" ⁜※ error: "+err.message;

console.error("Login error:",err);

}

};

btnLogout.onclick=async()=>{
await signOut(auth);
signupMsg.textContent="";
loginMsg.textContent="";
};

onAuthStateChanged(auth,async(user)=>{

if(user){

const snap=await get(child(ref(db),"users/"+user.uid));

const uname=snap.exists()?snap.val().username:"(unknown)";

accountInfo.textContent="※⁜ welcome, "+uname+"! ⁜※";

accountCard.style.display="block";
loginCard.style.display="none";
signupCard.style.display="none";
showSignup.parentElement.style.display="none";
showLoginP.style.display="none";

document.querySelector("h2").style.display="none";

}

else{

accountCard.style.display="none";
loginCard.style.display="flex";
signupCard.style.display="none";
showSignup.parentElement.style.display="block";
showLoginP.style.display="none";

const h=document.querySelector("h2");
h.style.display="block";
h.textContent="※⁜ log in your paint account! ⁜※";

}

});

document.addEventListener("click",function playMusic(){

const audio=document.getElementById("bgm");

if(audio){
audio.play().catch(err=>console.log("Audio play failed:",err));
}

document.removeEventListener("click",playMusic);

},{once:true});
