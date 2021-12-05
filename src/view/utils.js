/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable default-case */

import { format } from 'date-fns';
import { showEditItem } from './forms/forms';
import { switchItemControl } from './forms/utils';
import { showAddItem } from './forms/addItem';

import { sort, sortedIndex } from '../model/utils';
import {
  addItemToFirestore, deleteProjectFromFirestore, deleteTodoFromFirestore,
  projects,
} from '../model/firestore';

export const getHomeType = () => {
  const home = document.getElementById('home');
  return home.type;
};

export const setHomeType = (type) => {
  const home = document.getElementById('home');
  home.type = type;

  return true;
};

const makeTodosHeader = () => {
  const header = document.createElement('div');
  header.classList.add('project-todos-header');
  const headline = document.createElement('div');
  headline.textContent = 'In the pipe:';
  headline.classList.add('project-todos-header-text');
  header.appendChild(headline);
  const add = document.createElement('div');
  add.textContent = 'add';
  add.classList.add('project-todos-header-button');
  add.type = 'todo';
  add.id = 'project-add-todo';
  add.addEventListener('click', showAddItem);
  header.appendChild(add);

  return header;
};

const makeTodosList = (todos) => {
  const list = document.createElement('div');
  list.classList.add('project-todos-list');
  todos.forEach((item) => {
    item.type = 'project-todo';
    item = showItem(item);
    list.appendChild(item);
  });

  return list;
};

const makeTodos = (items, type) => {
  const todos = document.createElement('div');
  todos.classList.add('project-todos');

  if (type === 'project') {
    const header = makeTodosHeader();
    todos.appendChild(header);
  }

  const list = makeTodosList(items);
  todos.appendChild(list);

  return todos;
};

const makeControls = (type, id, status, projectId) => {
  const controls = document.createElement('div');
  controls.classList.add('item-controls');

  const edit = makeElement('div', `${type}-edit`, 'edit');
  edit.type = type;
  edit.addEventListener('click', showEditItem);
  controls.appendChild(edit);

  const statusElement = makeElement('div', `${type}-status`, status);
  controls.appendChild(statusElement);

  const del = makeElement('div', `${type}-delete`, 'delete');
  del.type = type;
  del.id = id;
  del.projectId = projectId;
  del.addEventListener('click', deleteItem);
  controls.appendChild(del);

  return controls;
};

const makeDetails = (type, date, priority) => {
  const details = document.createElement('div');
  details.classList.add('item-details');
  date = format(date.toDate(), 'yyyy-MM-dd');
  const dueDate = makeElement('div', `${type}-dueDate`, date);
  details.appendChild(dueDate);
  priority = makeElement('div', `${type}-priority`, priority);
  details.appendChild(priority);
  return details;
};

function makeContent(
  type, id, description, todos = null, date, priority, status, projectId = null,
) {
  const content = document.createElement('div');
  content.classList.add('item-content');
  description = makeElement('div', `${type}-description`, description);
  content.appendChild(description);

  const details = makeDetails(type, date, priority);
  content.appendChild(details);

  const controls = makeControls(type, id, status, projectId);
  content.appendChild(controls);

  if (type === 'project') {
    todos = makeTodos(todos, 'project');
    content.appendChild(todos);
  }

  return content;
}

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

const makeElementCollapsible = (element) => {
  element.classList.toggle('item-active');
  const content = element.nextElementSibling;
  addCollapsibility(content);
  adjustHeight(content, 'div[class$=content]');

  return element;
};

const makeElement = (type, className, content) => {
  const element = document.createElement(type);
  element.classList.add(className);
  element.innerHTML = content;
  return element;
};

const makeTitle = (text) => {
  const title = makeElement('button', 'item-title', text);
  title.addEventListener('click', () => {
    makeElementCollapsible(title);
  }, false);

  return title;
};

export const makeNewItemContainer = (item) => {
  const type = item.type.match(/(?<=-)\w+(?=-)/)[0];
  const location = item.type.match(/(?<=-)\w+$/)[0];
  const container = document.createElement('div');
  container.id = item.id;
  container.classList.add('item');
  container.classList.add(type);

  const title = makeTitle(item.title, type);
  container.appendChild(title);

  const content = makeContent(
    type,
    item.id,
    item.description,
    (type === 'project') ? item.todos : [],
    item.dueDate,
    item.priority,
    item.status,
    (type !== 'project') ? item.projectId : null,
  );
  container.appendChild(content);

  if (type === 'todo' && location === 'home') {
    const project = document.createElement('div');
    project.classList.add('todo-project');
    project.textContent = `project: ${item.projectTitle}`;
    container.appendChild(project);
  }

  return container;
};

export const makeItemContainer = (item, type) => {
  const container = document.createElement('div');
  container.id = item.id;
  container.classList.add('item');
  container.classList.add(type);

  const title = makeTitle(item.title, type);
  container.appendChild(title);

  const content = makeContent(
    type,
    item.id,
    item.description,
    (type === 'project') ? item.todos : [],
    item.dueDate,
    item.priority,
    item.status,
    (type !== 'project') ? item.projectId : null,
  );
  container.appendChild(content);

  if (type === 'todo') {
    const project = document.createElement('div');
    project.classList.add('todo-project');
    project.textContent = `project: ${item.projectTitle}`;
    container.appendChild(project);
  }

  return container;
};

export const showItem = (item) => {
  const { type } = item;
  const container = document.createElement('div');
  container.id = item.id;
  container.classList.add('item');
  container.classList.add(type);

  const title = makeTitle(item.title, type);
  container.appendChild(title);

  const content = makeContent(
    type,
    item.id,
    item.description,
    (type === 'project') ? item.todos : [],
    item.dueDate,
    item.priority,
    item.status,
    (type !== 'project') ? item.projectId : null,
  );
  container.appendChild(content);

  if (type === 'todo') {
    const project = document.createElement('div');
    project.classList.add('todo-project');
    project.textContent = `project: ${item.projectTitle}`;
    container.appendChild(project);
  }

  switch (type) {
    case 'project':
    case 'todo': {
      const destination = document.getElementById('home-items-list');
      destination.appendChild(container);
      return true;
    }
  }

  return container;
};

export const showItems = (items, type, ...sortArgs) => {
  const list = document.getElementById('home-items-list');
  list.innerHTML = '';

  items = sort(items, ...sortArgs);

  items.forEach((item) => {
    item.type = type;
    item = showItem(item);
  });
};

const getSortParamsFromHome = () => {
  const home = document.getElementById('home');
  return { by: home.by, desc: home.desc };
};

const getItemComponentProp = (item, key) => {
  const container = item.querySelector(`div[class$=${key}`);
  let prop = container.textContent;

  if (/date/i.test(key)) prop = Math.round(new Date(prop).getTime() / 1000);

  return prop;
};

const getItemSortValuesFromHome = (key) => {
  const items = document.getElementById('home-items-list');
  const values = [];

  Array.from(items.children).forEach((item) => values.push(getItemComponentProp(item, key)));

  return values;
};

const getItemSortValues = (type, key) => {
  switch (type) {
    case 'add-todo-home': case 'add-project-home': { return getItemSortValuesFromHome(key); }
    default: console.log(`getItemSortValues: sorry, we are out of ${type}.`);
  }

  return false;
};

const getItemSortValue = (item, key) => {
  let value = item[key];

  if (/date/i.test(key)) value = value.seconds;

  return value;
};

export const insertAfter = (newNode, existingNode) => {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

export const addItemToHomeItemsList = (item) => {
  const list = document.getElementById('home-items-list');
  const { by, desc } = getSortParamsFromHome();
  const itemSortValue = getItemSortValue(item, by);

  const values = getItemSortValues(item.type, by);
  const index = sortedIndex(values, itemSortValue, desc);
  const reference = list.children[index];
  item = makeNewItemContainer(item);

  list.insertBefore(item, reference);

  return true;
};

export const addTodoToProjectTodosList = (item) => {
  const project = document.getElementById(item.projectId);
  const list = project.querySelector('div[class$=list]');
  const reference = list.querySelector('.project-todo');
  item = makeNewItemContainer(item);
  item.classList.remove('todo');
  item.classList.add('project-todo');

  list.insertBefore(item, reference);

  return true;
};

export const addItemToItemsList = (item) => {
  const { type } = item;

  switch (type) {
    case 'add-todo-home': { addItemToHomeItemsList(item); break; }
    case 'add-project-home': {
      item.todos = []; addItemToHomeItemsList(item); break;
    }
    case 'add-todo-project': { addTodoToProjectTodosList(item); break; }
    default: console.log(`addItemToItemsList: sorry, we are out of ${type}.`);
  }
};

export const addItem = async (type, item, projectId = null) => {
  const itemType = type.match(/(?<=-)\w+(?=-)/)[0];
  const itemId = await addItemToFirestore(itemType, projectId, item);

  item = { type, id: itemId, ...item };
  addItemToItemsList(item);

  item.type = itemType;
  switch (itemType) {
    case 'project': { projects.addProject(item); break; }
    case 'todo': {
      projects.addTodo(
        projectId, { projectTitle: projects.getProjectProp(projectId, 'title'), ...item },
      );
      break;
    }
    default:
      console.log(`AddItem: sorry, we are out of ${itemType}.`);
  }

  return itemId;
};

export const switchProjectsTodos = async (e) => {
  const switchDiv = document.getElementById('home-controls-switch');

  let { type } = e.target;
  let items = null;

  const list = document.getElementById('home-items');
  const form = list.querySelector('form');
  if (form !== null) {
    const control = document.getElementById('home-controls-add');
    const type = form.classList[1].match(/(?<=-)\w+$/)[0];
    switchItemControl(control, type, false);
    clearContainerOfElements(list, 'form');
  }

  const { by, desc } = document.getElementById('home');
  switch (type) {
    case 'project': { items = projects.getProjects(); break; }
    case 'todo': { items = projects.getTodos(); break; }
    default: console.log(`switchProjectsTodos: sorry, we are out of ${type}.`);
  }
  showItems(items, type, ...[by, desc]);
  setHomeType(type);

  switch (type) {
    case 'project': { type = 'todo'; break; } case 'todo': { type = 'project'; break; }
    default: console.log(`switchProjectsTodos: sorry, we are out of ${type}.`);
  }
  switchDiv.textContent = `${type}s`;
  switchDiv.type = type;

  return true;
};

export const clearContainerOfElements = (container, selector) => {
  container.querySelectorAll(selector).forEach((element) => element.remove());

  return true;
};

const deleteProject = async (id) => {
  await deleteProjectFromFirestore(id);
  projects.deleteProject(id);

  return id;
};

const deleteTodo = async (projectId, id) => {
  await deleteTodoFromFirestore(projectId, id);
  projects.deleteTodo(projectId, id);

  return id;
};

const deleteItem = async (e) => {
  const { id, type } = e.target;
  const list = e.target.closest('div[class$=list]');

  switch (type) {
    case 'project': { await deleteProject(id); break; }
    case 'todo': { const { projectId } = e.target; await deleteTodo(projectId, id); break; }
    default: console.log(`deleteItem: sorry, we are out of ${type}.`);
  }

  const item = document.getElementById(id);
  item.remove();

  return id;
};

export const getProjectPropFromTodoId = (todoId, key) => {
  const todo = document.getElementById(todoId);
  const project = todo.parentElement.closest("[class$='item project']");

  const prop = project[key];

  if (prop === null) {
    console.log(`${key} not found in project ${project.id}`);
    return false;
  }

  return prop;
};