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
import { format } from 'date-fns';
import {
  addTodoWithIdToFirestore, deleteTodoFromFirestore, projects,
  setProjectPropsInFirestore, setTodoPropsInFirestore,
} from '../../model/firestore';
import {
  getItemPropsFromForm,
  hideAddEditItemFormFromHome, hideAddEditTodoFormFromProject,
  makeFormInputDate, makeFormInputSelect, makeItemFormSubmit, makeFormInputText,
  priorityLevels, switchItemControl,
} from './utils';
import {
  adjustHeight, clearContainerOfElements, editItemOnHomeList, editTodoOnProjectList,
  insertAfter,
} from '../utils';
import { validateFormAddTodo } from '../../model/forms';

export const makeEditItemFormBody = (title, description, priority) => {
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

  const submit = makeItemFormSubmit('edit', 'save', 'save');
  form.appendChild(submit);

  return form;
};

export const makeEditProjectForm = (id) => {
  const title = projects.getProjectProp(id, 'title');
  const description = projects.getProjectProp(id, 'description');
  const priority = projects.getProjectProp(id, 'priority');
  const form = makeEditItemFormBody(title, description, priority);

  let date = projects.getProjectProp(id, 'dueDate');
  date = makeFormInputDate('date', 'date', format(date.seconds * 1000, 'yyyy-MM-dd'));
  const ref = form.querySelector('input[id=description]');
  insertAfter(date, ref);

  form.type = 'project';
  form.itemId = id;

  return form;
};

export const makeEditTodoForm = (todoId) => {
  const projectId = projects.getProjectPropFromTodoId(todoId, 'id');

  const title = projects.getTodoProp(projectId, todoId, 'title');
  const description = projects.getTodoProp(projectId, todoId, 'description');
  const priority = projects.getTodoProp(projectId, todoId, 'priority');
  const form = makeEditItemFormBody(title, description, priority);

  let projectTitles = projects.getProjectsProp('title');
  projectTitles = makeFormInputSelect(
    'project', 'project', 'project: ', projectTitles,
    projects.getProjectPropFromTodoId(todoId, 'title'),
  );
  form.prepend(projectTitles);

  let date = projects.getTodoProp(projectId, todoId, 'dueDate');

  date = makeFormInputDate('date', 'date', format(date.seconds * 1000, 'yyyy-MM-dd'));
  const ref = form.querySelector('input[id=description]');
  insertAfter(date, ref);

  form.type = 'todo';
  form.itemId = todoId;

  return form;
};

export const makeEditItemForm = (id) => {
  const item = document.getElementById(id);

  let location = 'home'; let type = item.classList[1];
  if (/-/.test(type)) {
    location = type.match(/^\w+(?=-)/)[0];
    type = type.match(/(?<=-)\w+$/)[0];
  }

  let form = null;
  switch (type) {
    case 'project': { form = makeEditProjectForm(id); break; }
    case 'todo': { form = makeEditTodoForm(id); break; }
    default: console.log(`makeEditItemForm: sorry, we are out of ${type}.`);
  }

  Object.entries({ name: 'edit-item', location, itemId: id })
    // .forEach((x) => { form[x[0]] = x[1]; });
    .forEach((x) => { form.setAttribute(x[0], x[1]); });
  ['form-edit', `form-edit-${location}`]
    .forEach((x) => form.classList.add(x));

  form.addEventListener('submit', processEditItem);

  return form;
};

const showEdiItemFromHome = (form) => {
  const container = document.getElementById('home-items');

  const control = document.getElementById('home-controls-add');
  switchItemControl(control, 'home', true);

  clearContainerOfElements(container, 'form');
  container.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

const showEditTodoFromProject = (form) => {
  const project = document
    .getElementById(projects.getProjectPropFromTodoId(form.itemId, 'id'));
  const container = project.querySelector('.project-todos-list');

  const control = project.querySelector('#project-add-todo');
  switchItemControl(control, 'project', true);

  clearContainerOfElements(container, 'form');
  container.prepend(form);
  adjustHeight(form, 'div[class$=content]');

  return true;
};

export const showEditItem = (e) => {
  const { type } = e.target;

  const { id } = e.target.parentElement.closest(`div[class*=${type}]`);
  const form = makeEditItemForm(id);

  const location = form.getAttribute('location');
  switch (location) {
    case 'home': { showEdiItemFromHome(form); break; }
    case 'project': { showEditTodoFromProject(form); break; }
    default: console.log(`showEditItem: sorry, we are out of ${location}.`);
  }

  return true;
};

export const editProjectData = async (e, id) => {
  const props = getItemPropsFromForm('project', e);

  props.dueDate = new Date(props.dueDate);
  await setProjectPropsInFirestore(id, props);

  props.dueDate = Timestamp.fromDate(props.dueDate);
  projects.setProjectProps(id, props);

  return id;
};

export const editTodoData = async (e, todoId) => {
  let { project, ...props } = getItemPropsFromForm('todo', e);
  const newProjectId = projects.getProjectIdFromProp('title', project);
  const originalProjectId = projects.getProjectPropFromTodoId(todoId, 'id');

  if (newProjectId !== originalProjectId) {
    if (!validateFormAddTodo(newProjectId, e)) return false;

    const status = projects.getTodoProp(originalProjectId, todoId, 'status');
    props = { status, ...props };
    props.dueDate = new Date(props.dueDate);
    await addTodoWithIdToFirestore(newProjectId, todoId, props);
    props = { projectTitle: project, ...props };
    props.dueDate = Timestamp.fromDate(props.dueDate);
    projects.addTodo(newProjectId, props);

    await deleteTodoFromFirestore(originalProjectId, todoId);
    projects.deleteTodo(originalProjectId, todoId);
  } else {
    props.dueDate = new Date(props.dueDate);
    await setTodoPropsInFirestore(newProjectId, todoId, props);

    props.dueDate = Timestamp.fromDate(props.dueDate);
    projects.setTodoProps(newProjectId, todoId, props);
  }

  return todoId;
};

export const editProject = async (e, id) => {
  const props = getItemPropsFromForm('project', e);

  await editProjectData(e, id);
  editItemOnHomeList(id, props);

  hideAddEditItemFormFromHome(e);

  return true;
};

export const editTodo = async (e, id) => {
  const props = getItemPropsFromForm('todo', e);
  const location = e.target.classList[1].match(/(?<=-)\w+$/)[0];

  await editTodoData(e, id);

  switch (location) {
    case 'home': { editItemOnHomeList(id, props); hideAddEditItemFormFromHome(); break; }
    case 'project': { editTodoOnProjectList(id, props); hideAddEditTodoFormFromProject(e); break; }
    default: console.log(`editTodo: sorry, we are out of ${location}.`);
  }

  return true;
};

export const processEditItem = async (e) => {
  e.preventDefault();

  const { type } = e.target;
  const id = e.target.getAttribute('itemId');

  switch (type) {
    case 'project': { await editProject(e, id); break; }
    case 'todo': { editTodo(e, id); break; }
    default: console.log(`processAddItem: sorry, we are out of ${type}.`);
  }

  return true;
};
