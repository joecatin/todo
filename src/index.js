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

import { showItems, showHome, switchProjectsTodos } from './view/components/home';
import { showAddItem } from './view/forms/addItem';
import { projects } from './model/firestore';
import './index.css';
import './view/components/todo.css';
// import populate from './others/populate';
// populate('todos');

showHome('project', 'dueDate', true);
document.getElementById('home-controls-switch')
  .addEventListener('click', switchProjectsTodos);
document.getElementById('home-controls-add')
  .addEventListener('click', showAddItem);

showItems(projects.getProjects(), 'project', 'dueDate', true);
