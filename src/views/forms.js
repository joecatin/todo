/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */

import { addYears, format } from 'date-fns';
import { makeID } from '../others/utils';
import { add, get, Project } from '../components/project';
import { adjustHeight } from './utils';
import '../styles/forms.css';

const priorityLevels = ['high', 'medium', 'low'];

const addItemText = (id, name, placeholder) => {
  const container = document.createElement('div');
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = name;
  input.placeholder = placeholder;
  container.appendChild(input);

  return container;
};

const addItemDate = (id, name, value, min, max) => {
  const container = document.createElement('div');
  const input = document.createElement('input');
  input.type = 'date';
  input.id = id;
  input.name = name;
  input.value = value;
  input.min = min;
  input.max = max;
  container.appendChild(input);

  return container;
};

const addItemSelector = (id, name, text, choices) => {
  const container = document.createElement('div');
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
    option.textContent = choice;
    select.appendChild(option);
  });
  container.appendChild(select);

  return container;
};

const addItemSubmit = () => {
  const container = document.createElement('div');
  container.id = 'submit-add-form';
  const input = document.createElement('input');
  input.type = 'submit';
  input.id = 'add';
  input.value = 'add';
  container.appendChild(input);

  return container;
};

const getItemKeyDates = (type, project) => {
  const today = new Date();
  const min = format(today, 'yyyy-MM-dd');
  let max = '';
  switch (type) {
    case 'project': { max = format(addYears(today, 1), 'yyyy-MM-dd'); break; }
    case 'todo': { max = format(project.get('dueDate'), 'yyyy-MM-dd'); break; }
    default: console.log(`addItem: sorry, we are out of ${type}.`);
  }

  return [today, min, max];
};

const addItem = (type, project = null) => {
//   console.log(project);
  const form = document.createElement('form');
  form.id = (project !== null) ? project.get('id') : '';

  const title = addItemText('title', 'title', 'title?');
  form.appendChild(title);

  const description = addItemText('description', 'description', 'description?');
  form.appendChild(description);

  const date = addItemDate('date', 'date', ...getItemKeyDates(type, project));
  form.appendChild(date);

  const priority = addItemSelector('priority', 'priority', 'priority: ', priorityLevels);
  form.appendChild(priority);

  const submit = addItemSubmit();
  form.appendChild(submit);

  form.name = 'add-item';
  form.classList.add('form-add');
  form.classList.add(`form-add-${type}`);

  form.addEventListener('submit', (e) => {
    switch (type) {
      case 'project': { processAddItem(e, 'project', null); break; }
      case 'todo': { processAddItem(e, 'todo', project.get('id')); break; }
      default: console.log(`addItem: sorry, we are out of ${type}.`);
    }
  });

  return form;
};

const sortHideItemControls = (control, type, show = true) => {
  control.textContent = (show) ? 'cancel' : 'add';

  switch (type) {
    case 'project': {
      control.removeEventListener('click', (show) ? showAddItem : hideAddProject);
      control.addEventListener('click', (show) ? hideAddProject : showAddItem);
      break;
    }
    case 'todo': {
      control.removeEventListener('click', (show) ? showAddItem : hideAddTodo);
      control.addEventListener('click', (show) ? hideAddTodo : showAddItem);
      break;
    }
    default: console.log(`sortHideItemControls: sorry, we are out of ${type}.`);
  }

  return true;
};

const hideAddProject = () => {
  const projects = document.getElementById('projects');
  const control = document.getElementById('add-project-button');
  sortHideItemControls(control, 'project', false);

  projects.querySelectorAll('.form-add').forEach((form) => form.remove());

  return true;
};

const showAddProject = (form) => {
  const projects = document.getElementById('projects');

  const control = document.getElementById('add-project-button');
  sortHideItemControls(control, 'project', true);

  projects.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

const hideAddTodo = (e) => {
  const container = e.currentTarget.parentElement.closest('div[class=project]');

  const control = container.querySelector('div[class=project-items-header-button]');
  sortHideItemControls(control, 'todo', false);

  container.querySelectorAll('.form-add').forEach((form) => form.remove());

  return true;
};

const showAddTodo = (container, form) => {
  const control = container.querySelector('div[class=project-items-header-button]');
  sortHideItemControls(control, 'todo', true);

  const childContainer = container.querySelector('div[class=project-items-list]');
  childContainer.prepend(form);
  adjustHeight(form, 'div[class$=content]');
};

const makeItem = (e) => ({
  title: e.target.title.value,
  description: e.target.description.value,
  dueDate: Date.parse(e.target.date.value),
  priority: e.target.priority.value,
  status: 'open',
});

const addProject = (e) => {
  let project = makeItem(e);
  project = Project(project);
  add(project);
  hideAddProject();
};

const addTodo = (e, projectID) => {
  const project = get(projectID);
  project.then((project) => add(project, { id: makeID(), ...makeItem(e) }));
};

const processAddItem = (e, type, projectID = null) => {
  e.preventDefault();

  switch (type) {
    case 'project': { addProject(e); break; }
    case 'todo': { addTodo(e, projectID); break; }
    default: console.log(`processAddItem: sorry, we are out of ${type}.`);
  }
};

export const showAddItem = (e) => {
  const { type } = e.target;

  switch (type) {
    case 'project': {
      const form = addItem(type, null);
      showAddProject(form); break;
    }
    case 'todo': {
      const container = e.currentTarget.parentElement.closest('div[class=project]');
      const project = get(container.id);
      project.then((project) => {
        const form = addItem(type, project);
        showAddTodo(container, form);
      });
      break;
    }
    default: console.log(`showAddItem: sorry, we are out of ${type}.`);
  }
};

const editItemSubmit = () => {
  const container = document.createElement('div');
  container.id = 'submit-add-form';
  const input = document.createElement('input');
  input.type = 'submit';
  input.id = 'add';
  input.value = 'add';
  container.appendChild(input);

  return container;
};

const editProject = (e, project) => {
  project.set('title', e.target.title.value);
  project.set('description', e.target.description.value);
  project.set('dueDate', e.target.dueDate.value);
  project.set('priority', e.target.priority.value);
  project.set('status', e.target.status.value);
  // hideEditProject();
};

const processEditItem = (e, type, project) => {
  e.preventDefault();

  switch (type) {
    case 'project': { editProject(e, project); break; }
    // case 'todo': { editTodo(e, projectID); break; }
    default: console.log(`processAddItem: sorry, we are out of ${type}.`);
  }
};

const editItem = async (type, project) => {
//   console.log(project);
  const form = document.createElement('form');

  await get(project).then((project) => {
    const description = addItemText('description', 'description', project.get('description'));
    form.prepend(description);

    const title = addItemText('title', 'title', project.get('title'));
    form.prepend(title);
  });

  const date = addItemDate('date', 'date', ...getItemKeyDates(type, project));
  form.appendChild(date);

  const priority = addItemSelector('priority', 'priority', 'priority: ', priorityLevels);
  form.appendChild(priority);

  const submit = editItemSubmit();
  form.appendChild(submit);

  form.name = 'edit-item';
  form.classList.add('form-edit');
  form.classList.add(`form-edit-${type}`);

  form.addEventListener('submit', (e) => {
    switch (type) {
      case 'project': { processEditItem(e, 'project', project); break; }
      case 'todo': { processEditItem(e, 'todo', project.get('id')); break; }
      default: console.log(`editItem: sorry, we are out of ${type}.`);
    }
  });

  return form;
};

const showEditProject = (form) => {
  const projects = document.getElementById('projects');

  const control = document.getElementById('add-project-button');
  sortHideItemControls(control, 'project', true);

  projects.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

export const showEditItem = (e) => {
  const { type } = e.target;
  const project = e.target.parentElement.closest('div[class=project]').id;

  switch (type) {
    case 'project': {
      editItem('project', project).then((form) => showEditProject(form));
      break;
    }
    case 'todo': {
      const container = e.currentTarget.parentElement.closest('div[class=project]');
      const project = get(container.id);
      project.then((project) => {
        const form = addItem(type, project);
        showAddTodo(container, form);
      });
      break;
    }
    default: console.log(`showAddItem: sorry, we are out of ${type}.`);
  }
};
