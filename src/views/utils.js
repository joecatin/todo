/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */

import { format } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { get, Project, remove } from '../components/project';
import Todo from '../components/todo';
import { showAddItem, showEditItem } from './forms';
import { sort } from '../others/utils';
import '../styles/project.css';
import '../styles/item.css';
import '../styles/home.css';

initializeApp(firebaseConfig);
const db = getFirestore();

export const makeElement = (type, className, content) => {
  const element = document.createElement(type);
  element.classList.add(className);
  element.innerHTML = content;
  return element;
};

export const adjustHeight = (element, parentRegex) => {
  const parent = element.parentElement.closest(parentRegex);
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

const addCollapsibility = (element) => {
  if (element.style.display === 'block') {
    element.style.display = 'none';
  } else {
    element.style.display = 'block';
  }
  return element;
};

const makeElementCollapsible = (element, type) => {
  element.classList.toggle(`${type}-active`);
  const content = element.nextElementSibling;
  addCollapsibility(content);
  adjustHeight(content, 'div[class$=content]');

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
  date = format(date.toDate(), 'yyyy-MM-dd');
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

  const edit = makeElement('div', `${type}-edit`, 'edit');
  edit.type = type;
  edit.addEventListener('click', showEditItem);
  controls.appendChild(edit);

  const statusElement = makeElement('div', `${type}-status`, status);
  controls.appendChild(statusElement);

  const del = makeElement('div', `${type}-delete`, 'delete');
  del.addEventListener('click', (e) => deleteElement(e, type));
  controls.appendChild(del);

  return controls;
};

export const showProject = (project) => {
  const view = document.createElement('div');
  view.id = project.id;
  view.classList.add('project');

  const title = makeTitle(project.title, 'project');
  view.appendChild(title);

  const content = makeContent(
    'project',
    project.description,
    project.todos,
    project.dueDate,
    project.priority,
    project.status,
  );
  view.appendChild(content);

  return view;
};

const showTodo = (item, inProject = true) => {
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

  if (inProject) {
    const project = document.createElement('div');
    project.textContent = `project: ${item.get('project')}`;
    view.appendChild(project);
  }

  return view;
};

const makeItemsHeader = () => {
  const header = document.createElement('div');
  header.classList.add('project-items-header');
  const headline = document.createElement('div');
  headline.textContent = 'In the pipe:';
  headline.classList.add('project-items-header-text');
  header.appendChild(headline);
  const add = document.createElement('div');
  add.textContent = 'add';
  add.classList.add('project-items-header-button');
  add.type = 'todo';
  add.addEventListener('click', showAddItem);
  header.appendChild(add);

  return header;
};

const makeItemsList = (items, type) => {
  const list = document.createElement('div');
  list.classList.add(`${type}-items-list`);
  items.forEach((item) => {
    item = Todo(item);
    const div = showTodo(item);
    div.classList.add('item');
    list.appendChild(div);
  });

  return list;
};

const makeItems = (type, items) => {
  const todos = document.createElement('div');
  todos.classList.add(`${type}-items`);

  if (type === 'project') {
    const header = makeItemsHeader();
    todos.appendChild(header);
  }

  const list = makeItemsList(items, type);
  todos.appendChild(list);

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

  items = makeItems(type, items);
  content.appendChild(items);

  return content;
}

export const showProjects = (snapshot) => {
  const container = document.getElementById('home-items-list');
  container.classList.remove('home-new-project');
  container.classList.add('home-projects-list');

  snapshot.forEach((doc) => {
    const todosRef = collection(db, `todos/${doc.id}/todos`);
    const project = { id: doc.id, ...doc.data(), todos: [] };
    // const project = Project({ id: doc.id, ...doc.data() });
    getDocs(todosRef).then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        project.todos.push({ project: project.title, id: doc.id, ...doc.data() });
      });
      container.appendChild(showProject(project));
    });
  });
};

// export const showTodos = async (constraints) => {
//   const projects = document.getElementById('projects-list');
//   projects.classList.remove('home-new-project');
//   projects.classList.add('home-projects-list');

//   const q = query(collection(db, 'projects'), constraints);
//   const unsubscribe = onSnapshot(q, (querySnapshot) => {
//     projects.innerHTML = '';
//     querySnapshot.forEach((doc) => {
//       const project = get(doc.id);
//       project.then((project) => {
//         project.get('todos').forEach((todo) => {
//           projects.appendChild(showTodo(Todo(todo)));
//         });
//       });
//     });
//   });
// };

export const makeHomeControls = () => {
  const controls = document.createElement('div');
  controls.classList.add('home-controls');
  const add = document.createElement('div');
  add.textContent = 'add';
  add.id = 'add-project-button';
  add.type = 'project';
  add.addEventListener('click', showAddItem);
  controls.appendChild(add);

  return controls;
};

export const makeHomeItems = () => {
  const container = document.createElement('div');
  container.id = 'home-items';
  container.classList.add('home-items');
  const list = document.createElement('div');
  list.id = 'home-items-list';
  container.appendChild(list);

  return container;
};

const makeHome = (type, items) => {
  const home = document.createElement('div');
  home.id = 'home';

  const controls = makeHomeControls();
  home.appendChild(controls);

  const content = makeHomeItems(type, items);
  home.appendChild(content);

  return home;
};

const getProjects = async (snapshot) => {
  const projects = [];
  snapshot.forEach((doc) => {
    const todosRef = collection(db, `todos/${doc.id}/todos`);
    const project = Project({ id: doc.id, ...doc.data() });
    getDocs(todosRef).then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const todo = Todo({ project: project.get('title'), id: doc.id, ...doc.data() });
        console.log(todo.get('project'));
        project.add(todo);
      });
    });
    projects.push(project);

  });
};

const getTodos = (projects) => {
  const todos = [];
  projects.forEach((project) => {
    console.log(project.get('todos'));
    // project.get('todos').forEach((todo) => {
    //   console.log(todo);
    //   // todos.push(todo)
    // });
  });
  // console.log(todos);
  return todos;
};

export const showHome = (type) => {

  const projectsRef = collection(db, 'todos');

  const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
    document.body.innerHTML = '';
    document.body.appendChild(makeHome());
    switch (type) {
      case 'projects': { showProjects(snapshot); break; }
      case 'todos': { showTodos(snapshot); break; }
      default: console.log(`showHome: sorry, we are out of ${type}.`);
    }
  });
};

