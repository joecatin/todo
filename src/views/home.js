/* eslint-disable linebreak-style */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { get } from '../components/project';
import { showProject } from './utils';
import './home.css';

initializeApp(firebaseConfig);
const db = getFirestore();

const Home = async () => {
  const home = document.createElement('div');
  home.id = 'home';

  const q = query(collection(db, 'projects'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    home.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const project = get(doc.id);
      project.then((project) => home.appendChild(showProject(project)));
    });
  });

  return home;
};

export default Home;
