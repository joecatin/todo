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
/* eslint-disable default-case */

import { getHomeType } from './utils';

export const checkIfDatePassed = (date) => {
  date = date.setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);

  return date < today;
};

export const checkIfItemOverdue = (item) => {
  const dueDate = new Date(item.dueDate.seconds * 1000);

  return checkIfDatePassed(dueDate);
};

export const checkIfProjectHasOverdueTodo = (project) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const tests = project.todos
    .map((todo) => new Date(todo.dueDate.seconds * 1000).setHours(0, 0, 0, 0) < today);
  return tests.includes(true);
};

export const showItemAsOverdue = (item) => item.classList.add('overdue');

export const showItemAsNotOverdue = (item) => item.classList.remove('overdue');

export const showProjectHasOverdue = (item) => item.classList.add('hasOverdue');

export const showProjectHasntOverdue = (item) => item.classList.remove('hasOverdue');

export const sortOverdueStatus = (props, container) => {
  switch (checkIfItemOverdue(props)) {
    case true: { showItemAsOverdue(container); break; }
    case false: { showItemAsNotOverdue(container); break; }
    default: console.log(`sortOverdueStatus: sorry, we are out of ${checkIfItemOverdue(props)}.`);
  }

  return true;
};

export const sortProjectOverdueStatus = (todoId, todoDueDate) => {
  const project = document.getElementById(todoId).parentElement
    .closest('[class~=project]');
  const overdue = checkIfDatePassed(new Date(todoDueDate.seconds * 1000));

  switch (overdue) {
    case true: { showProjectHasOverdue(project); break; }
    case false: { showProjectHasntOverdue(project); break; }
    default: console.log(`sortProjectOverdueStatus: sorry, we are out of ${overdue}.`);
  }

  return true;
};
