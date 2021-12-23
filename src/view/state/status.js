/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable import/named */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */

import { overdueClasses, sortItemOverdueStatus, sortProjectHasOverdueStatus } from './overdue';
import { toggleCollapse, toggleElementClass, toggleElementsClass } from '../utils';
import {
  collapseItem,
  getTypeFromDOMItem, getPropsFromDOMItem,
  toggleItemEventListener, toggleItemsEventListener,
} from '../components/item';
import { showAddItem } from '../forms/addItem';
import { showEditItem } from '../forms/editItem';
import { hideAddEditItemFormFromHome, hideAddEditTodoFormFromProject } from '../forms/utils';
import { deleteItem } from '../../model/item';
import {
  projects,
  setProjectPropInFirestore, setTodoPropInFirestore, setTodosPropInFirestore,
} from '../../model/firestore';

const toggleProjectTodosStatusEventListeners = (todos, done) => {
  todos.forEach((todo) => {
    const title = todo.querySelector('[class~=item-title]');
    toggleItemEventListener(title, 'click', toggleCollapse, done);
    const status = todo.querySelector('[class*=status]');
    toggleItemEventListener(status, 'click', toggleStatus, done);
    const dels = todo.querySelector('[class*=delete]');
    toggleItemEventListener(dels, 'click', deleteItem, done);
  });

  return true;
};

const toggleItemStatusEventListeners = (item, type, done) => {
  const adds = item.querySelectorAll('[id*="add"]');
  toggleItemsEventListener(adds, 'click', showAddItem, done);
  const edits = item.querySelectorAll('[class*="edit"]');
  toggleItemsEventListener(edits, 'click', showEditItem, done);

  if (type === 'project') {
    const todos = item.querySelectorAll('[class^="item project-todo"]');
    toggleProjectTodosStatusEventListeners(todos, done);
  }

  return true;
};

const toggleDoneOnDOM = (e, item, type) => {
  const todos = item.querySelectorAll('[class~=item]');
  e.target.textContent = 'done';

  hideAddEditItemFormFromHome();
  switch (type) {
    case 'project': case 'project-todo': {
      todos.forEach((todo) => toggleDone({ target: todo.querySelector('[class$=status]') }));
      hideAddEditTodoFormFromProject(e); break;
    }
    default: console.log(`toggleDoneOnDOM: sorry, we are out of ${type}.`);
  }

  overdueClasses.forEach((itemClass) => {
    toggleElementClass(item, itemClass, false);
    toggleElementsClass(todos, itemClass, false);
  });

  item.classList.add('done');

  toggleItemStatusEventListeners(item, type, true);
  collapseItem(item);

  return true;
};

const toggleStatusInFiresotre = async (id, type, status) => {
  switch (type) {
    case 'project': {
      await setProjectPropInFirestore(id, status);
      await setTodosPropInFirestore(id, status);
      break;
    }
    case 'todo':
    case 'project-todo': {
      const projectId = projects.getProjectPropFromTodoId(id, 'id');
      await setTodoPropInFirestore(projectId, id, status);
      break;
    }
    default: console.log(`toggleStatusInFiresotre: sorry, we are out of ${type}.`);
  }

  return true;
};

const toggleStatusInProjects = async (id, type, status) => {
  switch (type) {
    case 'project': {
      projects.setProjectProp(id, 'status', status);
      projects.setTodosProp(id, 'status', status);
      break;
    }
    case 'todo':
    case 'project-todo': {
      const projectId = projects.getProjectPropFromTodoId(id, 'id');
      projects.setTodoProp(projectId, id, 'status', status);
      break;
    }
    default: console.log(`toggleStatusInProjects: sorry, we are out of ${type}.`);
  }

  return true;
};

const toggleDone = async (e) => {
  const item = e.target.parentElement.closest('[class~=item]');
  const type = getTypeFromDOMItem(item);

  toggleDoneOnDOM(e, item, type);
  toggleStatusInProjects(item.id, type, 'done');
  await toggleStatusInFiresotre(item.id, type, { status: 'done' });

  return true;
};

const toggleOpenOnDOM = (e, item, type) => {
  const props = getPropsFromDOMItem(item);
  e.target.textContent = 'open';

  hideAddEditItemFormFromHome();
  if (type === 'project' || type === 'project-todo') hideAddEditTodoFormFromProject(e);

  sortItemOverdueStatus(props, item);
  if (type === 'project') {
    sortProjectHasOverdueStatus(props, item);

    const todos = item.querySelectorAll('[class~=item]');
    todos.forEach((todo) => toggleOpen({ target: todo.querySelector('[class$=status]') }));
  }

  item.classList.remove('done');

  toggleItemStatusEventListeners(item, type, false);

  return true;
};

const toggleOpen = async (e) => {
  const item = e.target.parentElement.closest('[class~=item]');
  const type = getTypeFromDOMItem(item);

  toggleOpenOnDOM(e, item, type);
  toggleStatusInProjects(item.id, type, 'open');
  await toggleStatusInFiresotre(item.id, type, { status: 'open' });

  return true;
};

export const toggleStatus = (e) => {
  const status = e.target.textContent;

  switch (status) {
    case 'open': { toggleDone(e); break; }
    case 'done': { toggleOpen(e); break; }
    default: console.log(`toggleStatus: sorry, we are out of ${status}.`);
  }

  return true;
};
