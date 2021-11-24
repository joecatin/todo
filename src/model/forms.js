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
/* eslint-disable import/prefer-default-export */

import { getProjectProp, getProjectsProp, getTodosProp } from './firestore';
import { getProjectIdByProp } from './utils';
import { adjustHeight } from '../view/utils';

const showAlertInForm = (form, element, text) => {
  element = form.elements.namedItem(element);
  const alert = document.createElement('div');
  alert.innerText = text;
  form.insertBefore(alert, element);
  adjustHeight(alert, 'form');

  return true;
};

const checkTitle = (titles, title) => !titles.includes(title);

const validateFormAddTodoTitle = async (projectId, e) => {
  const titles = await getTodosProp(projectId, 'title');

  const valid = checkTitle(titles, e.target.title.value);
  if (valid) return true;

  showAlertInForm(e.target, 'title', 'wrong title');

  return false;
};

const checkTodoDueDate = (projectDueDate, TodoDueDate) => projectDueDate > TodoDueDate;

const validateFormAddTodoDate = async (projectId, e) => {
  const projectDueDate = await getProjectProp(projectId, 'dueDate');

  const valid = checkTodoDueDate(projectDueDate.toDate(), new Date(e.target.date.value));
  if (valid) return true;

  showAlertInForm(e.target, 'date', 'wrong date');

  return false;
};

export const validateFormAddTodo = async (projectId, e) => {
  const checks = [];

  checks.push(await validateFormAddTodoTitle(projectId, e));
  checks.push(await validateFormAddTodoDate(projectId, e));

  return !checks.includes(false);
};

const validateFormAddProject = async (e) => {
  const titles = await getProjectsProp('title');

  const valid = checkTitle(titles, e.target.title.value);
  if (valid) return true;

  showAlertInForm(e.target, 'title', 'wrong title');

  return false;
};

export const validateForm = async (type, e) => {
  switch (type) {
    case 'add-todo-home': {
      const projectId = await getProjectIdByProp('title', e.target.project.value);
      return validateFormAddTodo(projectId, e);
    }
    case 'add-project-home': { return validateFormAddProject(e); }
    case 'add-todo-project': {
      const projectId = e.target.parentElement.closest('div[class~=project]').id;
      return validateFormAddTodo(projectId, e);
    }
    default: console.log(`validateForm: sorry, we are out of ${type}.`);
  }

  return false;
};