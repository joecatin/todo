/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */

import { initializeApp } from 'firebase/app';
import {
  addDoc, getFirestore, collection, deleteDoc, doc, getDoc,
  getDocs, query, writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { Projects } from './projects';


initializeApp(firebaseConfig);
const db = getFirestore();
const col = 'todos';

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const getItems = async (type) => {
  switch (type) {
    case 'project': { const projects = await getProjects(); return projects; }
    case 'todo': { const todos = await getTodos(); return todos; }
    default: console.log('getItems: something went wrong.');
  }
};

export const getProjectProp = async (id, key) => {
  const docRef = doc(db, col, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) { return docSnap.data()[key]; }

  console.log('getProjectProp: no such document!');
  return false;
};

export const getProjectsProp = async (key) => {
  const projects = await fetchProjects();

  const props = [];
  projects.forEach((project) => props.push(project[key]));

  return props;
};

export const getTodosProp = async (projectId, key) => {
  const todos = await fetchProjectTodos(projectId);

  const props = [];
  todos.forEach((todo) => props.push(todo[key]));

  return props;
};

export const getProjects = async () => {
  const projects = await fetchProjects();

  await asyncForEach(projects, async (project) => {
    const todos = await fetchProjectTodos(project.id, project.title);
    project.todos = todos;
  });

  return projects;
};

const getTodos = async () => {
  const projects = await fetchProjects();
  const todos = [];

  await asyncForEach(projects, async (project) => {
    const projectTodos = await fetchProjectTodos(project.id, project.title);
    projectTodos.forEach((todo) => todos.push({ ...todo }));
  });

  return todos;
};

const fetchProjectTodos = async (projectId, projectTitle) => {
  const colRef = collection(db, `${col}/${projectId}/todos`);
  const todos = [];
  await getDocs(colRef).then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      todos.push({ type: 'todo', projectId, projectTitle, id: doc.id, ...doc.data() });
    });
  });
  return todos;
};

export const fetchProjects = async () => {
  const colRef = collection(db, col);
  const projects = [];
  await getDocs(colRef).then((snapshot) => {
    snapshot.forEach((doc) => {
      projects.push({ type: 'project', id: doc.id, ...doc.data(), todos: [] });
    });
  });
  return projects;
};

export const deleteTodoFromFirestore = async (projectId, todoId) => {
  await deleteDoc(doc(db, col, projectId, 'todos', todoId));
  return todoId;
};

export const deleteProjectFromFirestore = async (projectId) => {
  const q = query(collection(db, col, projectId, 'todos'));
  const todos = await getDocs(q);
  todos.forEach(async (todo) => {
    await deleteDoc(doc(db, col, projectId, 'todos', todo.id));
  });
  await deleteDoc(doc(db, col, projectId));

  return projectId;
};

export const addItemToFirestore = async (type, projectId = null, props) => {
  const colRef = (type === 'project') ? collection(db, col) : collection(db, col, projectId, 'todos');
  const docRef = await addDoc(colRef, { ...props });

  return docRef.id;
};

export const setProjectProps = async (id, props) => {
  const batch = writeBatch(db);

  const project = doc(db, col, id);
  batch.update(project, props);

  await batch.commit();
};

export const projects = Projects(...await getProjects());