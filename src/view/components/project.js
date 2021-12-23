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

import { Timestamp } from 'firebase/firestore';
import { getPropsFromDOMItem, makeNewItemContainer, showItem } from './item';
import { makeDiv } from '../utils';
import {
  sortItemOverdueStatus, sortParentProjectHasOverdueStatus,
} from '../state/overdue';
import { showAddItem } from '../forms/addItem';
import './project.css';

const makeTodosHeader = () => {
  const header = makeDiv('project-todos-header');
  const headline = makeDiv('project-todos-header-text', 'In the pipe:');
  header.appendChild(headline);
  const add = makeDiv(
    'project-todos-header-button', 'add', 'todo', 'project-add-todo',
    { type: 'click', callback: showAddItem },
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

export const makeTodos = (items, type) => {
  const todos = makeDiv('project-todos');

  if (type === 'project') {
    const header = makeTodosHeader();
    todos.appendChild(header);
  }

  const list = makeTodosList(items);
  todos.appendChild(list);

  return todos;
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

const getProjectPropFromTodoId = (todoId, key) => {
  const todo = document.getElementById(todoId);
  const project = todo.parentElement.closest("[class$='item project']");

  const prop = project[key];

  if (prop === null) {
    console.log(`${key} not found in project ${project.id}`);
    return false;
  }

  return prop;
};

export const getTodosFromDOMProject = (item) => {
  const todos = [];
  Array.from(item.querySelectorAll('.project-todo'))
    .forEach((todo) => todos.push(getPropsFromDOMItem(todo)));

  return todos;
};
