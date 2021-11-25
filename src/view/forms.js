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
import { addYears, format } from 'date-fns';
import { makeID } from '../others/utils';
import { getProjectIdByProp } from '../model/utils';
import { validateForm } from '../model/forms';
import { add, get, Project } from '../components/project';
import { addItemToFirestore, getProjectsProp } from '../model/firestore';
import {
  addItemToItemsList, adjustHeight, getHomeType, showItem,
} from './utils';
import showHome from './home';
import './forms.css';

const priorityLevels = ['high', 'medium', 'low'];

const makeAddItemFormText = (id, name, placeholder) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = name;
  input.placeholder = placeholder;

  return input;
};

const makeAddItemFormDate = (
  id, name, value = new Date(),
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

const makeAddItemFormSelector = (id, name, text, choices) => {
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
    option.textContent = choice;
    select.appendChild(option);
  });
  container.appendChild(select);

  return container;
};

const makeAddItemFormSubmit = () => {
  const input = document.createElement('input');
  input.id = 'submit-add-form';
  input.type = 'submit';
  input.id = 'add';
  input.value = 'add';

  return input;
};

const getItemKeyDates = (type, projectDueDate) => {
  const today = new Date();
  const min = format(today, 'yyyy-MM-dd');
  let max = '';
  switch (type) {
    case 'project': {
      max = format(addYears(today, 1), 'yyyy-MM-dd'); break;
    }
    case 'todo': {
      max = format(projectDueDate, 'yyyy-MM-dd'); break;
    }
    default:
      console.log(`getItemKeyDates: sorry, we are out of ${type}.`);
  }

  return [today, min, max];
};

const makeAddItemFromHomeForm = async (type) => {
  const form = makeAddItemForm('project');

  if (type === 'todo') {
    let projects = await getProjectsProp('title');
    projects = makeAddItemFormSelector(
      'project', 'project', 'project: ', projects,
    );
    form.prepend(projects);
  }

  form.type = `add-${type}-home`;
  // console.log(form);
  return form;
};

const makeAddTodoFromProjectForm = () => {
  const form = makeAddItemForm('todo');
  form.type = 'add-todo-project';

  return form;
};

const makeAddItemForm = (type) => {
//   console.log(project);
  const form = document.createElement('form');

  const title = makeAddItemFormText('title', 'title', 'title');
  form.appendChild(title);

  const description = makeAddItemFormText(
    'description', 'description', 'description',
  );
  form.appendChild(description);

  const date = makeAddItemFormDate('date', 'date');
  form.appendChild(date);

  const priority = makeAddItemFormSelector(
    'priority', 'priority', 'priority: ', priorityLevels,
  );
  form.appendChild(priority);

  const submit = makeAddItemFormSubmit();
  form.appendChild(submit);

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
      control.removeEventListener(
        'click', (show) ? showAddItem : hideAddItemFromHome,
      );
      control.addEventListener(
        'click', (show) ? hideAddItemFromHome : showAddItem,
      );
      break;
    }
    case 'project': {
      console.log('case project called here');
      control.removeEventListener(
        'click', (show) ? showAddItem : hideAddTodoFromProject,
      );
      control.addEventListener(
        'click', (show) ? hideAddTodoFromProject : showAddItem,
      );
      break;
    }
    default:
      console.log(`sortHideItemControls: sorry, we are out of ${type}.`);
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

  items.querySelectorAll('.form-add').forEach((form) => form.remove());

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

  container.querySelectorAll('.form-add')
    .forEach((form) => form.remove());

  return true;
};

const makeItem = (e) => ({
  title: e.target.title.value,
  description: e.target.description.value,
  dueDate: Timestamp.fromDate(new Date(e.target.date.value)),
  priority: e.target.priority.value,
  status: 'open',
});

const addProjectIdToTodoItem = async (e, location, item) => {
  let projectId = null;
  switch (location) {
    case 'home': {
      const projectTitle = e.target.project.value;
      item = { projectTitle, ...item };
      projectId = await getProjectIdByProp('title', projectTitle);
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
  let item = makeItem(e);
  let projectId = null;

  if (!validateForm(type, e)) return false;

  const location = type.match(/(?<=-)\w+$/)[0];

  if (/todo/.test(type)) {
    item = await addProjectIdToTodoItem(e, location, item);
    projectId = item.projectId;
  }

  const itemId = await addItemToFirestore(
    type.match(/(?<=-)\w+(?=-)/)[0], projectId, item,
  );
  item = { type, id: itemId, ...item };
  addItemToItemsList(item);

  switch (location) {
    case 'home': { hideAddItemFromHome(); break; }
    case 'project': { hideAddTodoFromProject(e); break; }
    default:
      console.log(`processAddItem: sorry, we are out of ${location}.`);
  }

  return itemId;
};

export const showAddItem = async (e) => {
  let { type } = e.target;
  const location = e.target.id.match(/^\w+/)[0];

  switch (location) {
    case 'home': {
      type = getHomeType();
      const form = await makeAddItemFromHomeForm(type);
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

  const control = document.getElementById('home-controls-add');
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
