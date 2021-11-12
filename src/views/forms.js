/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { addYears, format } from 'date-fns';
import { makeID, showProjects } from './utils';
import { add, get, Project } from '../components/project';
import Item from '../components/item';
import '../styles/forms.css';

const today = new Date();
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

const addItem = (type) => {
  const form = document.createElement('form');
  //   form.id = `add-${type}`;
  form.id = 'add-item';

  const title = addItemText('title', 'title', 'title?');
  form.appendChild(title);

  const description = addItemText(
    'description', 'description', 'description?',
  );
  form.appendChild(description);

  const date = addItemDate(
    'date', 'date', today, today, format(addYears(today, 1), 'yyyy-MM-dd'),
  );
  form.appendChild(date);

  const priority = addItemSelector(
    'priority', 'priority', 'priority: ', priorityLevels,
  );
  form.appendChild(priority);

  const submit = addItemSubmit();
  form.appendChild(submit);

  form.name = 'add-item';
  form.classList.add('form-add-item');

  form.addEventListener('submit', (e) => processAddItem(e, type));

  return form;
};

const showAddItem = (type) => {
  const form = addItem(type);
  const projects = document.getElementById('projects');
  projects.innerHTML = '';
  projects.appendChild(form);
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
};

const addTodo = (e) => {
  let project = e.target.parentElement.closest('div[class=project]');
  project = get(project.id);

  let todo = { id: makeID(), ...makeItem(e) };
  todo = Item(todo);

  add(project, todo);
};

const processAddItem = (e, type) => {
  // console.log(`Form Submitted! Time stamp: ${e.timeStamp}`);

  e.preventDefault();

  switch (type) {
    case 'project': { addProject(e); break; }
    case 'item': { addTodo(e); break; }
    default: console.log(`Sorry, we are out of ${type}.`);
  }
};

export default showAddItem;