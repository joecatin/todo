/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */

import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { validateForm } from '../model/forms';
import { projects, setProjectProps } from '../model/firestore';
import {
  clearContainerOfElements,
  makeFormInputText, makeFormInputDate, makeFormInputSelect,
} from './shared';
import { addItem, adjustHeight, getHomeType, insertAfter } from './utils';
import './forms.css';

const priorityLevels = ['high', 'moderate', 'low'];

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

const makeAddItemFormSubmit = () => {
  const container = document.createElement('div');
  container.id = 'submit-add-form';
  const input = document.createElement('input');
  input.type = 'submit';
  input.id = 'add';
  input.value = 'add';
  container.appendChild(input);

  return container;
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

  const submit = makeAddItemFormSubmit();
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

const sortHideItemControls = (control, type, show = true) => {
  control.textContent = (show) ? 'cancel' : 'add';

  switch (type) {
    case 'home': {
      control.removeEventListener('click', (show) ? showAddItem : hideAddItemFromHome);
      control.addEventListener('click', (show) ? hideAddItemFromHome : showAddItem); break;
    }
    case 'project': {
      control.removeEventListener('click', (show) ? showAddItem : hideAddTodoFromProject);
      control.addEventListener('click', (show) ? hideAddTodoFromProject : showAddItem); break;
    }
    default: console.log(`sortHideItemControls: sorry, we are out of ${type}.`);
  }

  return true;
};

const showAddItemFromHome = (form) => {
  const items = document.getElementById('home-items');

  const control = document.getElementById('home-controls-add');
  sortHideItemControls(control, 'home', true);

  items.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

const hideAddItemFromHome = () => {
  const items = document.getElementById('home-items');
  const control = document.getElementById('home-controls-add');
  sortHideItemControls(control, 'home', false);

  clearContainerOfElements(items, 'form');

  return true;
};

const showAddTodoFromProject = (form, e) => {
  const container = e.target.parentElement
    .closest('div[class$=header]').nextSibling;

  const control = e.target;
  sortHideItemControls(control, 'project', true);

  container.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

const hideAddTodoFromProject = (e) => {
  const container = e.target.closest('div[class$=content]')
    .querySelector('.project-todos-list');

  const control = container.parentElement
    .querySelector('.project-todos-header-button');
  sortHideItemControls(control, 'project', false);

  clearContainerOfElements(container, '.form-add');

  return true;
};

const makeItem = (e) => ({
  title: e.target.title.value,
  description: e.target.description.value,
  dueDate: Timestamp.fromDate(new Date(e.target.date.value)),
  priority: e.target.priority.value,
  status: 'open',
});

const addProjectIdToTodoItem = (e, location, item) => {
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

const processAddItem = async (e) => {
  e.preventDefault();

  const { type } = e.target;
  let item = makeItem(e); let projectId = null;

  if (!validateForm(type, e)) return false;

  const location = type.match(/(?<=-)\w+$/)[0];

  if (/todo/.test(type)) {
    item = addProjectIdToTodoItem(e, location, item);
    projectId = item.projectId;
  }

  const itemId = await addItem(type, item, projectId);

  switch (location) {
    case 'home': { hideAddItemFromHome(); break; }
    case 'project': { hideAddTodoFromProject(e); break; }
    default: console.log(`processAddItem: sorry, we are out of ${location}.`);
  }

  return itemId;
};

export const showAddItem = (e) => {
  let { type } = e.target;
  const location = e.target.id.match(/^\w+/)[0];

  switch (location) {
    case 'home': {
      type = getHomeType();
      const form = makeAddItemFromHomeForm(type);
      showAddItemFromHome(form); break;
    }
    case 'project': {
      const form = makeAddTodoFromProjectForm();
      showAddTodoFromProject(form, e); break;
    }
    default:
      console.log(`showAddItem: sorry, we are out of ${location}.`);
  }

  return true;
};

const makeEditItemSubmit = () => {
  const container = document.createElement('div');
  container.id = 'submit-edit-form';
  const input = document.createElement('input');
  input.type = 'submit';
  input.id = 'save';
  input.value = 'save';
  container.appendChild(input);

  return container;
};

const editProjectOnDOM = (id, props) => {
  const list = document.getElementById('home-items-list');
  const project = list.querySelector(`div[id=${id}]`);

  Object.keys(props).forEach((key) => {
    const container = project.querySelector(`[class*=${key}]`);
    console.log(container);
    console.log(props[key]);
    container.textContent = props[key];
  });

  return true;
};

const getProjectPropsFromForm = (e) => {
  const props = {};
  props.title = e.target.title.value;
  props.description = e.target.description.value;
  props.dueDate = e.target.date.value;
  props.priority = e.target.priority.value;

  return props;
};

const editProjectData = async (e, id) => {
  const props = getProjectPropsFromForm(e);

  props.dueDate = new Date(props.dueDate);
  await setProjectProps(id, props);

  props.dueDate = Timestamp.fromDate(props.dueDate);
  projects.setProjectProps(id, props);

  return id;
};

const editProject = async (e, id) => {
  const props = getProjectPropsFromForm(e);

  await editProjectData(e, id);
  editProjectOnDOM(id, props);

  hideAddItemFromHome(e);

  return true;
};

const processEditItem = async (e) => {
  e.preventDefault();

  const { type, id } = e.target;

  switch (type) {
    case 'project': { await editProject(e, id); break; }
    // case 'todo': { editTodo(e, projectID); break; }
    default: console.log(`processAddItem: sorry, we are out of ${type}.`);
  }
};

const makeEditItemFormBody = (title, description, priority) => {
  const form = document.createElement('form');

  title = makeFormInputText('edit', 'title', 'title', title);
  form.appendChild(title);

  description = makeFormInputText('edit', 'description', 'description', description);
  form.appendChild(description);

  priority = makeFormInputSelect(
    'priority', 'priority', 'priority: ',
    priorityLevels, priority,
  );
  form.appendChild(priority);

  const submit = makeEditItemSubmit();
  form.appendChild(submit);

  return form;
};

const makeEditProjectForm = (id) => {
  const title = projects.getProjectProp(id, 'title');
  const description = projects.getProjectProp(id, 'description');
  const priority = projects.getProjectProp(id, 'priority');
  const form = makeEditItemFormBody(title, description, priority);

  let date = projects.getProjectProp(id, 'dueDate');
  console.log(date);
  date = makeFormInputDate('date', 'date', format(date.seconds * 1000, 'yyyy-MM-dd'));
  const ref = form.querySelector('input[id=description]');
  insertAfter(date, ref);

  form.type = 'project';
  form.id = id;

  return form;
};

const makeEditItemForm = (id) => {
  const item = document.getElementById(id);
  const type = item.classList[1];

  let form = null;
  switch (type) {
    case 'project': { form = makeEditProjectForm(id); break; }
    case 'todo': { form = makeEditTodoForm(item); break; }
    default: console.log(`makeEditItemForm: sorry, we are out of ${type}.`);
  }

  form.name = 'edit-item';
  form.classList.add('form-edit');
  form.classList.add(`form-edit-${type}`);

  form.addEventListener('submit', processEditItem);

  return form;
};

const showEditProject = (form) => {
  const container = document.getElementById('home-items');

  const control = document.getElementById('home-controls-add');
  sortHideItemControls(control, 'home', true);

  clearContainerOfElements(container, 'form');
  container.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

export const showEditItem = (e) => {
  const { type } = e.target;
  const projectId = e.target.parentElement.closest('div[class*=project]').id;

  switch (type) {
    case 'project': {
      const form = makeEditItemForm(projectId);
      showEditProject(form); break;
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
