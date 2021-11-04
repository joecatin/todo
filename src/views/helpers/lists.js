/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable import/prefer-default-export */

import showItem from '../item/item';
import { makeContent as makeMainContent } from './utils';

export const makeItems = (type, items) => {
  const todos = document.createElement('div');
  todos.classList.add(`${type}-items`);
  const header = document.createElement('div');
  header.textContent = 'In the pipe:';
  todos.appendChild(header);
  items.forEach((item) => {
    const div = showItem(item);
    div.classList.add('item');
    todos.appendChild(div);
  });

  return todos;
};

export const makeContent = (type, inner, date, level, items, status) => {
  const content = makeMainContent(type, inner, date, level, status);
  const todos = makeItems(type, items);
  content.appendChild(todos);

  return content;
};