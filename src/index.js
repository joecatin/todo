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

import showHome from './view/home';
import { getProjects } from './model/firestore';
import './index.css';
import './view/home.css';
import './view/item.css';
import './view/project.css';
import './view/todo.css';
// import populate from './others/populate';
// populate('todos');

export const projects = await getProjects();

showHome('project', 'dueDate', true);
