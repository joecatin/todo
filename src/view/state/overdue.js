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

import { getPropsFromDOMItem } from '../components/item';

export const overdueClasses = ['overdue', 'hasOverdue'];

const checkIfDatePassed = (date) => {
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

export const sortItemOverdueStatus = (props, container) => {
  const overdue = checkIfItemOverdue(props);
  switch (overdue) {
    case true: { showItemAsOverdue(container); break; }
    case false: { showItemAsNotOverdue(container); break; }
    default: console.log(`sortItemOverdueStatus: sorry, we are out of ${overdue}.`);
  }

  return true;
};

const sortProjectTodosOverdueStatus = (todos) => {
  todos.forEach((todo) => {
    const props = getPropsFromDOMItem(todo);
    sortItemOverdueStatus(props, todo);
  });

  return true;
};

export const sortProjectHasOverdueStatus = (props, container) => {
  const hasOverdue = checkIfProjectHasOverdueTodo(props);
  switch (hasOverdue) {
    case true: { showProjectHasOverdue(container); break; }
    case false: { showProjectHasntOverdue(container); break; }
    default: console.log(`sortItemOverdueStatus: sorry, we are out of ${hasOverdue}.`);
  }

  const todos = Array.from(container.querySelectorAll('[class~=project-todo]'));
  if (todos.length > 0) sortProjectTodosOverdueStatus(todos);

  return true;
};

export const sortParentProjectHasOverdueStatus = (todoId, todoDueDate) => {
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
