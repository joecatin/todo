/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */

import { overdueClasses, sortItemOverdueStatus, sortProjectHasOverdueStatus } from './overdue';
import {
  collapseItem, deleteItem, getPropsFromDOMItem, getTypeFromDOMItem,
  toggleCollapse, toggleElementsClass,
  toggleElementClass, toggleItemEventListener, toggleItemsEventListener,
} from './utils';
import { showAddItem } from './forms/addItem';
import { showEditItem } from './forms/editItem';
import { hideAddEditItemFormFromHome, hideAddEditTodoFormFromProject } from './forms/utils';

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

const toggleDone = (e) => {
  hideAddEditItemFormFromHome();
  hideAddEditTodoFormFromProject(e);

  e.target.textContent = 'done';

  let item = e.target.parentElement.closest('[class~=item]');
  const todos = item.querySelectorAll('[class~=item]');

  const type = getTypeFromDOMItem(item);

  if (type === 'project') {
    todos.forEach((todo) => toggleDone({ target: todo.querySelector('[class$=status]') }));
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

const toggleOpen = (e) => {
  hideAddEditItemFormFromHome();
  hideAddEditTodoFormFromProject(e);

  e.target.textContent = 'open';

  const item = e.target.parentElement.closest('[class~=item]');
  const props = getPropsFromDOMItem(item);
  const type = getTypeFromDOMItem(item);

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

export const toggleStatus = (e) => {
  const status = e.target.textContent;

  switch (status) {
    case 'open': { toggleDone(e); break; }
    case 'done': { toggleOpen(e); break; }
    default: console.log(`toggleStatus: sorry, we are out of ${status}.`);
  }

  return true;
};
