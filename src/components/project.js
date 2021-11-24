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
import {
  getFirestore, collection, addDoc, deleteDoc,
  doc, getDoc, updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { sort } from '../others/utils';

initializeApp(firebaseConfig);
const db = getFirestore();

const findItemindex = (items, id) => items.findIndex((item) => item.id === id);

const withGetter = (dataObject) => ({
  get: (key) => dataObject[key],
});

const withSetter = (dataObject) => ({
  set: async (key, value) => {
    dataObject[key] = value;
    const { id, ...project } = dataObject;
    await updateDoc(doc(db, 'projects', id), project);
  },
});

const withGeneralHandler = (dataObject) => ({
  toString: () => {
    let project = `id: ${dataObject.id}, title: ${dataObject.title}, todos: `;
    for (let i = 0; i < dataObject.todos.length - 1; i++) {
      project = project + dataObject.todos[i].title + ', ';
    }
    project = project + dataObject.todos[dataObject.todos.length - 1].title + '.';
    return project;
  },
});

const withTodosHandler = (dataObject) => ({
  sort: (by, desc = true) => sort(dataObject.todos, by, desc),
  add: (todo) => dataObject.todos.push(todo),
  delete: (id) => {
    const i = findItemindex(dataObject.todos, id);
    dataObject.todos.splice(i, 1);
  },
});

export const Project = ({ title, description, dueDate, priority, status, id = '', todos = [] }) => {
  const _instance = {};
  const _data = { title, description, dueDate, priority, status, id, todos };
  return Object.assign(
    _instance,
    withGetter(_data),
    withSetter(_data),
    withGeneralHandler(_data),
    withTodosHandler(_data),
  );
};

const projectConverter = {
  toFirestore: (project) => ({
    title: project.get('title'),
    description: project.get('description'),
    dueDate: project.get('dueDate'),
    priority: project.get('priority'),
    status: project.get('status'),
    todos: project.get('todos'),
  }),
  fromFirestore: (snapshot, options) => {
    const data = { id: snapshot.id, ...snapshot.data(options) };
    return Project(data);
  },
};

export const get = async (id) => {
  const ref = doc(db, 'projects', id).withConverter(projectConverter);
  const docSnap = await getDoc(ref);

  return docSnap.data();
};

export const remove = async (projectID, todoID = null) => {
  if (todoID === null) await deleteDoc(doc(db, 'projects', projectID));
  else {
    const project = get(projectID);
    project.then((project) => project.delete(todoID));
  }
};

export const add = async (project, todo = null) => {
  if (todo === null) {
    const ref = collection(db, 'projects').withConverter(projectConverter);
    // console.log(project.get('dueDate'));
    await addDoc(ref, project);
  } else {
    project.add(todo);
  }
};
