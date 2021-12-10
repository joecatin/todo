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
  addDoc, getFirestore, collection, deleteDoc, doc,
  getDocs, query, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { Projects } from './projects';
import { asyncForEach } from './utils'


initializeApp(firebaseConfig);
const db = getFirestore();
const col = 'todos';

const getProjects = async () => {
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

export const setProjectPropInFirestore = async (id, prop) => {
  const project = doc(db, col, id);

  await updateDoc(project, prop);

  return true;
};

export const setProjectPropsInFirestore = async (id, props) => {
  const batch = writeBatch(db);

  const project = doc(db, col, id);
  batch.update(project, props);

  await batch.commit();

  return true;
};

export const setTodoPropInFirestore = async (projectId, todoId, prop) => {
  const todo = doc(db, col, projectId, 'todos', todoId);

  await updateDoc(todo, prop);

  return true;
};

export const setTodoPropsInFirestore = async (projectId, todoId, props) => {
  const batch = writeBatch(db);

  const todo = doc(db, col, projectId, 'todos', todoId);
  batch.update(todo, props);

  await batch.commit();

  return true;
};

export const setTodosPropInFirestore = async (projectId, prop) => {
  const todos = collection(db, col, projectId, 'todos');

  const docs = await getDocs(todos);
  await asyncForEach(docs, async (doc) => await updateDoc(doc, prop));

  return true;
};

export const addTodoWithIdToFirestore = async (projectId, todoId, props) => {

  await setDoc(doc(db, col, projectId, 'todos', todoId), { ...props });

  return true;
};

export const projects = Projects(...await getProjects());