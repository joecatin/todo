/* eslint-disable linebreak-style */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { showProjects } from './utils';
import showAddItem from './forms';
import '../styles/home.css';

initializeApp(firebaseConfig);
const db = getFirestore();

const Home = async () => {
  const home = document.createElement('div');
  home.id = 'home';

  const controls = document.createElement('div');
  controls.classList.add('home-controls');
  const add = document.createElement('div');
  add.textContent = 'add';
  add.removeEventListener('click', showProjects);
  add.addEventListener('click', () => showAddItem('project'));
  controls.appendChild(add);

  home.appendChild(controls);

  const projects = document.createElement('div');
  projects.id = 'projects';

  home.appendChild(projects);

  return home;
};

export default Home;
