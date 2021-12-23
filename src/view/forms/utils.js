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

import { Timestamp } from 'firebase/firestore';
import { addYears, format } from 'date-fns';
import { projects } from '../../model/firestore';
import { showAddItem } from './addItem';
import { clearContainerOfElements } from '../utils';
import './forms.css';

export const priorityLevels = ['high', 'moderate', 'low'];

export const getItemPropsFromForm = (type, e) => {
  const props = {};
  if (type === 'todo') props.project = e.target.project.value;
  props.id = e.target.itemId;
  props.title = e.target.title.value;
  props.description = e.target.description.value;
  props.dueDate = e.target.date.value;
  props.priority = e.target.priority.value;

  return props;
};

// const makeItem = (e) => ({
//   title: e.target.title.value,
//   description: e.target.description.value,
//   dueDate: Timestamp.fromDate(new Date(e.target.date.value)),
//   priority: e.target.priority.value,
//   status: 'open',
// });

export const makeFormInputText = (type, id, name, text) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = name;

  switch (type) {
    case 'add': { input.placeholder = text; break; }
    case 'edit': { input.value = text; break; }
    default: console.log(`makeFormInputText: sorry, we are out of ${type}.`);
  }

  return input;
};

export const makeFormInputSelect = (id, name, text, choices, selected = null) => {
  const container = document.createElement('span');
  const input = document.createElement('label');
  input.textContent = text;
  input.for = name;
  container.appendChild(input);
  const select = document.createElement('select');
  select.id = id;
  select.name = name;
  choices.forEach((choice) => {
    const option = document.createElement('option');
    option.value = choice;
    if (choice === selected) option.selected = true;
    option.textContent = choice;
    select.appendChild(option);
  });
  container.appendChild(select);

  return container;
};

export const makeFormInputDate = (
  id, name, value = format(new Date(), 'yyyy-MM-dd'),
  min = new Date(), max = addYears(new Date(), 1),
) => {
  const input = document.createElement('input');
  input.type = 'date';
  input.id = id;
  input.name = name;
  input.value = value;
  input.min = min;
  input.max = max;

  return input;
};

export const makeItemFormSubmit = (type, id, text) => {
  const container = document.createElement('div');
  container.id = `submit-${type}-form`;
  const input = document.createElement('input');
  input.type = 'submit';
  input.id = id;
  input.value = text;
  container.appendChild(input);

  return container;
};

export const makeItemFromAddEditForm = (e) => ({
  title: e.target.title.value,
  description: e.target.description.value,
  dueDate: Timestamp.fromDate(new Date(e.target.date.value)),
  priority: e.target.priority.value,
  status: 'open',
});

export const addProjectIdToTodoItem = (e, location, item) => {
  let projectId = null;
  switch (location) {
    case 'home': {
      const projectTitle = e.target.project.value;
      item = { projectTitle, ...item };
      projectId = projects.getProjectIdByProp('title', projectTitle);
      break;
    }
    case 'project': {
      projectId = e.target.parentElement.closest('div[class~=project]').id;
      break;
    }
    default:
      console.log(`addProjectIdToTodoItem: sorry, we are out of ${location}.`);
  }
  item = { projectId, ...item };

  return item;
};

export const hideAddEditItemFormFromHome = () => {
  const items = document.getElementById('home-items');
  const control = document.getElementById('home-controls-add');
  switchItemControl(control, 'home', false);

  clearContainerOfElements(items, 'form');

  return true;
};

export const hideAddEditTodoFormFromProject = (e) => {
  const container = e.target.closest("[class~='project']")
    .querySelector('[class*=project-todos-list]');

  const control = container.parentElement
    .querySelector('.project-todos-header-button');
  switchItemControl(control, 'project', false);

  clearContainerOfElements(container, 'form');

  return true;
};

export const switchItemControl = (control, type, show = true) => {
  control.textContent = (show) ? 'cancel' : 'add';

  switch (type) {
    case 'home': {
      control.removeEventListener('click', (show) ? showAddItem : hideAddEditItemFormFromHome);
      control.addEventListener('click', (show) ? hideAddEditItemFormFromHome : showAddItem); break;
    }
    case 'project': {
      control.removeEventListener('click', (show) ? showAddItem : hideAddEditTodoFormFromProject);
      control.addEventListener('click', (show) ? hideAddEditTodoFormFromProject : showAddItem); break;
    }
    default: console.log(`switchItemControl: sorry, we are out of ${type}.`);
  }

  return true;
};
