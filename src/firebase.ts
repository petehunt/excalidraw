import * as firebase from "firebase/app";
import "firebase/database";

const config = {
  apiKey: "AIzaSyAXEsrExZNTxcGGP_LxJVHIbZRwq4eeeS4",
  authDomain: "firedraw-df544.firebaseapp.com",
  databaseURL: "https://firedraw-df544.firebaseio.com",
  storageBucket: "bucket.appspot.com",
};
firebase.initializeApp(config);

// Get a reference to the database service
export const database = firebase.database();
export const ServerValue = firebase.database.ServerValue;
