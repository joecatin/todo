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

import { projects } from './firestore';
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

const validateFormAddTodoTitle = (projectId, e) => {
  const titles = projects.getTodosProp(projectId, 'title');

  const valid = checkTitle(titles, e.target.title.value);
  if (valid) return true;

  showAlertInForm(e.target, 'title', 'wrong title');

  return false;
};

const checkTodoDueDate = (projectDueDate, TodoDueDate) => projectDueDate > TodoDueDate;

const validateFormAddTodoDate = (projectId, e) => {
  const projectDueDate = projects.getProjectProp(projectId, 'dueDate');

  const valid = checkTodoDueDate(projectDueDate.toDate(), new Date(e.target.date.value));
  if (valid) return true;

  showAlertInForm(e.target, 'date', 'wrong date');

  return false;
};

export const validateFormAddTodo = (projectId, e) => {
  const checks = [];

  checks.push(validateFormAddTodoTitle(projectId, e));
  checks.push(validateFormAddTodoDate(projectId, e));

  return !checks.includes(false);
};

const validateFormAddProject = (e) => {
  const titles = projects.getProjectsProp('title');

  const valid = checkTitle(titles, e.target.title.value);
  if (valid) return true;

  showAlertInForm(e.target, 'title', 'wrong title');

  return false;
};

export const validateForm = (type, e) => {
  switch (type) {
    case 'add-todo-home': {
      const projectId = projects.getProjectIdByProp('title', e.target.project.value);
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