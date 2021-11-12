/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { format } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { get, remove } from '../components/project';
import Item from '../components/item';
import '../styles/project.css';
import '../styles/item.css';

initializeApp(firebaseConfig);
const db = getFirestore();

export const makeID = () => {
  let id = Math.random().toString(36).substring(2, 12);
  id += Math.random().toString(36).substring(2, 12);
  return id;
};

export const makeElement = (type, className, content) => {
  const element = document.createElement(type);
  element.classList.add(className);
  element.innerHTML = content;
  return element;
};

const addCollapsibility = (element) => {
  if (element.style.display === 'block') {
    element.style.display = 'none';
  } else {
    element.style.display = 'block';
  }
  return element;
};

const animateCollapsibility = (element) => {
  const parent = element.parentElement.closest('div[class$=content]');
  if (element.style.maxHeight) {
    element.style.maxHeight = null;
  } else {
    element.style.maxHeight = `${element.scrollHeight}px`;
    if (parent) {
      parent.style.maxHeight = `${parent.scrollHeight + element.scrollHeight}px`;
    }
  }
  return element;
};

const makeElementCollapsible = (element, type) => {
  element.classList.toggle(`${type}-active`);
  const content = element.nextElementSibling;
  addCollapsibility(content);
  animateCollapsibility(content);

  return element;
};

export const makeTitle = (text, type) => {
  const title = makeElement('button', `${type}-title`, text);
  title.addEventListener('click', () => {
    makeElementCollapsible(title, type);
  }, false);

  return title;
};

const makeDetails = (type, date, priority) => {
  const details = document.createElement('div');
  details.classList.add(`${type}-details`);
  date = format(date, 'yyyy-MM-dd');
  const dueDate = makeElement('div', `${type}-dueDate`, date);
  details.appendChild(dueDate);
  priority = makeElement('div', `${type}-priority`, priority);
  details.appendChild(priority);
  return details;
};

const deleteElement = (e, type) => {
  const project = e.target.parentElement.closest('div[class=project]');
  if (type === 'item') {
    const todo = e.target.parentElement.closest('div[class=item]');
    remove(project.id, todo.id);
  } else {
    remove(project.id);
  }
};

const makeControls = (type, status) => {
  const controls = document.createElement('div');
  controls.classList.add(`${type}-controls`);

  const clear = makeElement('div', `${type}-clear`, 'clear');
  controls.appendChild(clear);

  const statusElement = makeElement('div', `${type}-status`, status);
  controls.appendChild(statusElement);

  const del = makeElement('div', `${type}-delete`, 'delete');
  del.addEventListener('click', (e) => deleteElement(e, type));
  controls.appendChild(del);

  return controls;
};

export const showProject = (project) => {
  const view = document.createElement('div');
  view.id = project.get('id');
  view.classList.add('project');

  const title = makeTitle(project.get('title'), 'project');
  view.appendChild(title);

  const content = makeContent(
    'project',
    project.get('description'),
    project.get('todos'),
    project.get('dueDate'),
    project.get('priority'),
    project.get('status'),
  );
  view.appendChild(content);

  return view;
};

const showItem = (item) => {
  const view = document.createElement('div');
  view.id = item.get('id');
  view.classList.add('item');

  const title = makeTitle(item.get('title'), 'item');
  view.appendChild(title);

  const content = makeContent(
    'item',
    item.get('description'),
    [],
    item.get('dueDate'),
    item.get('priority'),
    item.get('status'),
  );
  view.appendChild(content);

  return view;
};

const makeItems = (type, items) => {
  const todos = document.createElement('div');
  todos.classList.add(`${type}-items`);

  const header = document.createElement('div');
  header.classList.add(`${type}-items-header`);
  const headline = document.createElement('div');
  headline.textContent = 'In the pipe:';
  header.appendChild(headline);
  const add = document.createElement('div');
  add.textContent = 'add';
  header.appendChild(add);
  todos.appendChild(header);

  items.forEach((item) => {
    item = Item(item);
    const div = showItem(item);
    div.classList.add('item');
    todos.appendChild(div);
  });

  return todos;
};

export function makeContent(type, description, items = null, date, priority, status) {
  const content = document.createElement('div');
  content.classList.add(`${type}-content`);
  description = makeElement('div', `${type}-description`, description);
  content.appendChild(description);

  const details = makeDetails(type, date, priority);
  content.appendChild(details);

  const controls = makeControls(type, status);
  content.appendChild(controls);

  if (items.length > 0) {
    items = makeItems(type, items);
    content.appendChild(items);
  }

  return content;
}

export const showProjects = async () => {
  const projects = document.getElementById('projects');
  // console.log(projects);
  projects.innerHTML = '';
  projects.classList.remove('home-new-project');
  projects.classList.add('home-all-projects');

  const q = query(collection(db, 'projects'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    projects.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const project = get(doc.id);
      project.then((project) => projects.appendChild(showProject(project)));
    });
  });
};
