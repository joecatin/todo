/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { Project } from '../components/project';
import Todo from '../components/todo';

initializeApp(firebaseConfig);
const db = getFirestore();

export const makeID = () => {
  let id = Math.random().toString(36).substring(2, 12);
  id += Math.random().toString(36).substring(2, 12);
  return id;
};

const removeElementsByClass = (className) => {
  const elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
};

export const sort = (arrayOfObjects, by, desc = true) => {
  switch (desc) {
    case true: { arrayOfObjects.sort((a, b) => a[by] - b[by]); break; }
    case false: { arrayOfObjects.sort((a, b) => b[by] - a[by]); break; }
    default: console.log('sort: something went wrong.');
  }
};

export const getProjects = async (constraints) => {
  const projects = [];

  const q = query(collection(db, 'todos'), constraints);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const projectID = doc.id;
      const colRef = collection(db, `todos/${projectID}/todos`);
      const project = Project({ id: projectID, ...doc.data() });
      getDocs(colRef).then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          const todo = Todo({ ...projectID, id: doc.id, ...doc.data() });
          project.add(todo);
        });
      });
      projects.push(project);
    });
  });

  return projects;
};
