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

import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { showAddItem } from './forms/addItem';
import { showEditItem } from './forms/editItem';
import {
  hideAddEditItemFormFromHome, hideAddEditTodoFormFromProject,
  switchItemControl,
} from './forms/utils';
import {
  checkIfItemOverdue, checkIfProjectHasOverdueTodo,
  showItemAsOverdue, showProjectHasOverdue,
  sortItemOverdueStatus, sortParentProjectHasOverdueStatus,
} from './overdue';
import { toggleStatus } from './status';
import { intersect, sort, sortedIndex } from '../model/utils';
import {
  addItemToFirestore, deleteProjectFromFirestore, deleteTodoFromFirestore,
  projects,
} from '../model/firestore';

const types = ['todo', 'project', 'project-todo'];

export const getHomeType = () => {
  const home = document.getElementById('home');

  return home.type;
};

const makeElement = (
  containerType, className = null, content = null, typeAttribute = null, idAttribute = null,
  eventListener = { type: null, callback: null },
) => {
  const element = document.createElement(containerType);
  element.classList.add(className);
  if (content !== null) element.innerHTML = content;
  if (typeAttribute !== null) element.type = typeAttribute;
  if (idAttribute !== null) element.id = idAttribute;
  element.addEventListener(eventListener.type, eventListener.callback);

  return element;
};

const makeDiv = (className, content, typeAttribute, idAttribute, eventListener) => {
  const div = makeElement('div', className, content, typeAttribute, idAttribute, eventListener);

  return div;
};

const setHomeType = (type) => {
  const home = document.getElementById('home');
  home.type = type;

  return true;
};

const makeTodosHeader = () => {
  const header = makeDiv('project-todos-header');
  const headline = makeDiv('project-todos-header-text', 'In the pipe:');
  header.appendChild(headline);
  const add = makeDiv(
    'project-todos-header-button', 'add', 'todo', 'project-add-todo', { type: 'click', callback: showAddItem },
  );
  header.appendChild(add);

  return header;
};

const makeTodosList = (todos) => {
  const list = makeDiv('project-todos-list');
  todos.forEach((item) => {
    item.type = 'project-todo';
    item = showItem(item);
    list.appendChild(item);
  });

  return list;
};

const makeTodos = (items, type) => {
  const todos = makeDiv('project-todos');

  if (type === 'project') {
    const header = makeTodosHeader();
    todos.appendChild(header);
  }

  const list = makeTodosList(items);
  todos.appendChild(list);

  return todos;
};

const makeControls = (type, id, status, projectId) => {
  const controls = makeDiv('item-controls');

  const edit = makeDiv(`${type}-edit`, 'edit', type, null, { type: 'click', callback: showEditItem });
  controls.appendChild(edit);

  const statusElement = makeDiv(`${type}-status`, status, null, null, { type: 'click', callback: toggleStatus });
  controls.appendChild(statusElement);

  const del = makeDiv(`${type}-delete`, 'delete', type, id, { type: 'click', callback: deleteItem });
  del.projectId = projectId;
  controls.appendChild(del);

  return controls;
};

const makeDetails = (type, date, priority) => {
  const details = makeDiv('item-details');
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
  const content = makeDiv('item-content');
  description = makeDiv(`${type}-description`, description);
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

  if (element.style.maxHeight > 0) {
    element.style.maxHeight = null;
  } else {
    element.style.maxHeight = `${element.scrollHeight}px`;
    if (parent) {
      parent.style.maxHeight = `${parent.scrollHeight + element.scrollHeight}px`;
    }
  }

  return element;
};

export const collapseItem = (item) => {
  const title = item.querySelector('[class~=item-title]');
  toggleElementClass(title, 'title-active', false);
  const content = item.querySelector('[class~=item-content]');
  content.style.display = 'none';

  adjustHeight(content, 'div[class$=content]');

  return true;
};

const addCollapsibility = (element) => {
  element.style.display = (element.style.display === 'block') ? 'none' : 'block';

  return element;
};

export const toggleCollapse = (e) => {
  e.target.classList.toggle('title-active');
  const content = e.target.nextElementSibling;

  addCollapsibility(content);
  adjustHeight(content, 'div[class$=content]');

  return true;
};

const makeTitle = (text) => {
  const title = makeElement('button', 'item-title', text, null, null, { type: 'click', callback: toggleCollapse });

  return title;
};

export const makeNewItemContainer = (item) => {
  const type = item.type.match(/(?<=-)\w+(?=-)/)[0];
  const location = item.type.match(/(?<=-)\w+$/)[0];
  const {
    id, title, description, todos, dueDate, priority, status,
    projectId, projectTitle,
  } = item;
  const container = makeDiv('item', null, null, id);
  container.classList.add(type);

  container.appendChild(makeTitle(title, type));

  const content = makeContent(
    type, id, description, (todos !== null) ? item.todos : [],
    dueDate, priority, status, projectId,
  );
  container.appendChild(content);

  if (checkIfItemOverdue(item)) { showItemAsOverdue(container); }

  if (type === 'todo' && location === 'home') {
    const project = makeDiv('todo-project', `project: ${projectTitle}`);
    container.appendChild(project);
  }

  return container;
};

export const makeItemContainer = (item, type) => {
  const {
    id, title, description, todos, dueDate, priority, status,
    projectId, projectTitle,
  } = item;
  container.id = id;
  const container = makeDiv('item', null, null, id);
  container.classList.add(type);

  container.appendChild(makeTitle(title, type));

  const content = makeContent(
    type, id, description, (todos !== null) ? item.todos : [],
    dueDate, priority, status, projectId,
  );
  container.appendChild(content);

  if (checkIfItemOverdue(item)) { showItemAsOverdue(container); }

  if (type === 'todo') {
    const project = makeDiv('todo-project', `project: ${projectTitle}`);
    container.appendChild(project);
  }

  return container;
};

export const showItem = (item) => {
  const { id, projectId, type } = item;
  const container = makeDiv('item', null, null, id);
  container.classList.add(type);

  const title = makeTitle(item.title, type);
  container.appendChild(title);

  const content = makeContent(
    type, id, item.description, (type === 'project') ? item.todos : [],
    item.dueDate, item.priority, item.status, projectId,
  );
  container.appendChild(content);
  toggleElementClass(container, 'done', item.status === 'done');

  if (checkIfItemOverdue(item)) { showItemAsOverdue(container); }

  switch (type) {
    case 'project': {
      if (checkIfProjectHasOverdueTodo(item)) { showProjectHasOverdue(container); }
      break;
    }
    case 'todo': {
      const project = makeDiv('todo-project', `project: ${item.projectTitle}`);
      container.appendChild(project); break;
    }
  }

  switch (type) {
    case 'project': case 'todo': {
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

  return true;
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

  return true;
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
    default: console.log(`AddItem: sorry, we are out of ${itemType}.`);
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

export const deleteItem = async (e) => {
  const { id, type } = e.target;

  switch (type) {
    case 'project': { await deleteProject(id); break; }
    case 'todo': case 'project-todo': {
      const { projectId } = e.target; await deleteTodo(projectId, id); break;
    }
    default: console.log(`deleteItem: sorry, we are out of ${type}.`);
  }

  const form = document.querySelector(`[itemid=${id}]`);
  if (form !== null) {
    const location = form.getAttribute('location');
    switch (location) {
      case 'home': { hideAddEditItemFormFromHome(); break; }
      case 'project': { hideAddEditTodoFormFromProject(e); break; }
      default: console.log(`deleteItem: sorry, we are out of ${location}.`);
    }
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

export const editItemOnHomeList = (id, props) => {
  const item = document.getElementById(id);
  const type = item.classList[1];

  const keys = ['title', 'description', 'dueDate', 'priority'];
  keys.forEach((key) => {
    const container = item.querySelector(`[class*=${key}]`);
    container.textContent = props[key];
  });

  props.dueDate = Timestamp.fromDate(new Date(props.dueDate));
  sortItemOverdueStatus(props, item);

  if (type === 'todo') {
    const container = item.querySelector('[class*=project]');
    container.textContent = `project: ${props.project}`;
  }

  return true;
};

export const editTodoOnProjectList = (id, props) => {
  const todo = document.getElementById(id);

  const keys = ['title', 'description', 'dueDate', 'priority'];
  keys.forEach((key) => {
    const container = todo.querySelector(`[class*=${key}]`);
    container.textContent = props[key];
  });

  props.dueDate = Timestamp.fromDate(new Date(props.dueDate));
  sortItemOverdueStatus(props, todo);
  sortParentProjectHasOverdueStatus(id, props.dueDate);

  return true;
};

export const getTypeFromDOMItem = (item) => {
  const type = intersect(item.classList, types);
  if (type.length > 1) {
    throw new Error(`getTypeFromDOMItem: more than one item found: ${type.join(', ')}.`);
  }

  return type[0];
};

const getTodosFromDOMProject = (item) => {
  const todos = [];
  Array.from(item.querySelectorAll('.project-todo'))
    .forEach((todo) => todos.push(getPropsFromDOMItem(todo)));

  return todos;
};

export const getPropsFromDOMItem = (item) => {
  let props = {
    title: null, description: null, dueDate: null, priority: null, status: null,
  };
  Object.keys(props).forEach((key) => {
    const value = item.querySelector(`[class*=${key}]`).textContent;
    props[key] = value;
  });

  const type = getTypeFromDOMItem(item);
  switch (type) {
    case 'todo': case 'project-todo': {
      const projectProps = projects.getProjectPropsFromTodoId(item.id, 'projectId', 'projectTitle');
      props = { ...props, ...projectProps }; break;
    }
    case 'project': { props.todos = getTodosFromDOMProject(item); break; }
    default: console.log(`getPropsFromDOMItem: sorry, we are out of ${type}.`);
  }

  if (props.dueDate !== null) props.dueDate = Timestamp.fromDate(new Date(props.dueDate));
  props.id = item.id;

  return props;
};

export const toggleItemEventListener = (item, type, callback, remove) => {
  if (remove) {
    item.removeEventListener(type, callback);
  } else {
    item.addEventListener(type, callback);
  }

  return true;
};

export const toggleItemsEventListener = (items, type, callback, remove) => {
  items.forEach((item) => toggleItemEventListener(item, type, callback, remove));
};

export const toggleElementClass = (element, label, add) => {
  (add) ? element.classList.add(label) : element.classList.remove(label);

  return element;
};

export const toggleElementClasses = (element, labels, add) => {
  labels.forEach((label) => toggleElementClass(element, label, add));

  return element;
};

export const toggleElementsClass = (elements, label, add) => {
  elements.forEach((element) => toggleElementClass(element, label, add));

  return elements;
};

export const toggleElementsClasses = (elements, labels, add) => {
  elements.forEach((element) => toggleElementClasses(element, labels, add));

  return elements;
};