/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-newline */
/* eslint-disable eol-last */
/* eslint-disable import/no-cycle */
/* eslint-disable import/named */
/* eslint-disable default-case */

import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { addItemToHomeItemsList, getItemSortValuesFromHome } from './home';
import { addTodoToProjectTodosList, getTodosFromDOMProject, makeTodos } from './project';
import {
  adjustHeight, makeDiv, makeElement,
  toggleCollapse, toggleElementClass, types,
} from '../utils';
import { showEditItem } from '../forms/editItem';
import { deleteItem } from '../../model/item';
import { intersect } from '../../model/utils';
import { addItemToFirestore, projects } from '../../model/firestore';
import { toggleStatus } from '../state/status';
import {
  checkIfItemOverdue, checkIfProjectHasOverdueTodo,
  showItemAsOverdue, showProjectHasOverdue,
} from '../state/overdue';
import './item.css';

export const collapseItem = (item) => {
  const title = item.querySelector('[class~=item-title]');
  toggleElementClass(title, 'title-active', false);
  const content = item.querySelector('[class~=item-content]');
  content.style.display = 'none';

  adjustHeight(content, 'div[class$=content]');

  return true;
};

export const makeTitle = (text) => {
  const title = makeElement(
    'button', 'item-title', text, null, null,
    { type: 'click', callback: toggleCollapse },
  );

  return title;
};

const makeControls = (type, id, status, projectId) => {
  const controls = makeDiv('item-controls');

  const edit = makeDiv(
    `${type}-edit`, 'edit', type, null,
    { type: 'click', callback: showEditItem },
  );
  controls.appendChild(edit);

  const statusElement = makeDiv(
    `${type}-status`, status, null, null,
    { type: 'click', callback: toggleStatus },
  );
  controls.appendChild(statusElement);

  const del = makeDiv(
    `${type}-delete`, 'delete', type, id,
    { type: 'click', callback: deleteItem },
  );
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

export function makeContent(
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

export const getItemComponentProp = (item, key) => {
  const container = item.querySelector(`div[class$=${key}`);
  let prop = container.textContent;

  if (/date/i.test(key)) prop = Math.round(new Date(prop).getTime() / 1000);

  return prop;
};

export const getItemSortValue = (item, key) => {
  let value = item[key];

  if (/date/i.test(key)) value = value.seconds;

  return value;
};

export const getItemSortValues = (type, key) => {
  switch (type) {
    case 'add-todo-home': case 'add-project-home': { return getItemSortValuesFromHome(key); }
    default: console.log(`getItemSortValues: sorry, we are out of ${type}.`);
  }

  return false;
};

export const getTypeFromDOMItem = (item) => {
  const type = intersect(item.classList, types);
  if (type.length > 1) {
    throw new Error(`getTypeFromDOMItem: more than one item found: ${type.join(', ')}.`);
  }

  return type[0];
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