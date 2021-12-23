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

import { projects } from '../../model/firestore';
import {
  addProjectIdToTodoItem,
  hideAddEditItemFormFromHome, hideAddEditTodoFormFromProject,
  makeFormInputText, makeFormInputDate, makeFormInputSelect, makeItemFormSubmit,
  makeItemFromAddEditForm,
  priorityLevels, switchItemControl,
} from './utils';
import { adjustHeight } from '../utils';
import { addItem } from '../../model/item';
import { validateForm } from '../../model/forms';
import { getHomeType } from '../components/home';

const makeAddItemFromHomeForm = (type) => {
  const form = makeAddItemForm('project');

  if (type === 'todo') {
    let projectTitles = projects.getProjectsProp('title');
    projectTitles = makeFormInputSelect(
      'project', 'project', 'project: ', projectTitles,
    );
    form.prepend(projectTitles);
  }

  form.type = `add-${type}-home`;

  return form;
};

const makeAddTodoFromProjectForm = () => {
  const form = makeAddItemForm('todo');
  form.type = 'add-todo-project';

  return form;
};

const makeAddItemFormBody = () => {
  const form = document.createElement('form');

  const title = makeFormInputText('add', 'title', 'title', 'title');
  form.appendChild(title);

  const description = makeFormInputText('add', 'description', 'description', 'description');
  form.appendChild(description);

  const date = makeFormInputDate('date', 'date');
  form.appendChild(date);

  const priority = makeFormInputSelect(
    'priority', 'priority', 'priority: ',
    priorityLevels, priorityLevels[1],
  );
  form.appendChild(priority);

  const submit = makeItemFormSubmit('add', 'add', 'add');
  form.appendChild(submit);

  return form;
};

const makeAddItemForm = (type) => {
  const form = makeAddItemFormBody();

  form.name = 'add-item';
  form.classList.add('form-add');
  form.classList.add(`form-add-${type}`);

  form.addEventListener('submit', processAddItem);

  return form;
};

const showAddItemFormFromHome = (form) => {
  const items = document.getElementById('home-items');

  const control = document.getElementById('home-controls-add');
  switchItemControl(control, 'home', true);

  items.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

const showAddTodoFromProject = (form, e) => {
  const container = e.target.parentElement
    .closest('div[class$=header]').nextSibling;

  const control = e.target;
  switchItemControl(control, 'project', true);

  container.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

export const showAddItem = (e) => {
  let { type } = e.target;
  const location = e.target.id.match(/^\w+/)[0];

  switch (location) {
    case 'home': {
      type = getHomeType();
      const form = makeAddItemFromHomeForm(type);
      showAddItemFormFromHome(form); break;
    }
    case 'project': {
      const form = makeAddTodoFromProjectForm();
      showAddTodoFromProject(form, e); break;
    }
    default: console.log(`showAddItem: sorry, we are out of ${location}.`);
  }

  return true;
};

const processAddItem = async (e) => {
  e.preventDefault();

  const { type } = e.target;
  let item = makeItemFromAddEditForm(e);
  let projectId = null;

  if (!validateForm(type, e)) return false;

  const location = type.match(/(?<=-)\w+$/)[0];

  if (/todo/.test(type)) {
    item = addProjectIdToTodoItem(e, location, item);
    projectId = item.projectId;
  }

  const itemId = await addItem(type, item, projectId);

  switch (location) {
    case 'home': { hideAddEditItemFormFromHome(); break; }
    case 'project': { hideAddEditTodoFormFromProject(e); break; }
    default: console.log(`processAddItem: sorry, we are out of ${location}.`);
  }

  return itemId;
};