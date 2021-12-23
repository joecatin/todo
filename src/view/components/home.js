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
/* eslint-disable prefer-destructuring */

import { Timestamp } from 'firebase/firestore';
import {
  getItemSortValue, getItemSortValues, getItemComponentProp,
  makeNewItemContainer,
  showItem,
} from './item';
import { clearContainerOfElements } from '../utils';
import { switchItemControl } from '../forms/utils';
import { sortItemOverdueStatus } from '../state/overdue';
import { sort, sortedIndex } from '../../model/utils';
import { projects } from '../../model/firestore';
import './home.css';

const types = ['todo', 'project'];

const makeHomeControls = (type) => {
  const controls = document.createElement('div');
  controls.classList.add('home-controls');

  type = types.filter((element) => element !== type)[0];
  const typeDiv = document.createElement('div');
  typeDiv.textContent = `${type}s`;
  typeDiv.id = 'home-controls-switch';
  typeDiv.type = type;
  controls.appendChild(typeDiv);

  const add = document.createElement('div');
  add.textContent = 'add';
  add.id = 'home-controls-add';
  controls.appendChild(add);

  return controls;
};

const makeHomeItems = () => {
  const container = document.createElement('div');
  container.id = 'home-items';
  container.classList.add('home-items');
  const list = document.createElement('div');
  list.classList.add('home-items-list');
  list.id = 'home-items-list';
  container.appendChild(list);

  return container;
};

const makeHome = (type) => {
  const home = document.createElement('div');
  home.id = 'home';

  const controls = makeHomeControls(type);
  home.appendChild(controls);

  const content = makeHomeItems();
  home.appendChild(content);

  document.body.appendChild(home);

  return true;
};

export const showItems = (items, type, ...sortArgs) => {
  const list = document.getElementById('home-items-list');
  list.innerHTML = '';

  items = sort(items, ...sortArgs);

  items.forEach((item) => {
    item.type = type;
    item = showItem(item);
  });

  return true;
};

export const showHome = async (type, ...sortArgs) => {
  document.body.innerHTML = '';
  makeHome(type);
  const home = document.getElementById('home');
  home.type = type;
  [home.by, home.desc] = sortArgs;

  return true;
};

export const getHomeType = () => {
  const home = document.getElementById('home');

  return home.type;
};

export const getItemSortValuesFromHome = (key) => {
  const items = document.getElementById('home-items-list');
  const values = [];

  Array.from(items.children).forEach((item) => values.push(getItemComponentProp(item, key)));

  return values;
};

const getSortParamsFromHome = () => {
  const home = document.getElementById('home');
  return { by: home.by, desc: home.desc };
};

export const setHomeType = (type) => {
  const home = document.getElementById('home');
  home.type = type;

  return true;
};

export const addItemToHomeItemsList = (item) => {
  const list = document.getElementById('home-items-list');
  const { by, desc } = getSortParamsFromHome();
  const itemSortValue = getItemSortValue(item, by);

  const values = getItemSortValues(item.type, by);
  const index = sortedIndex(values, itemSortValue, desc);
  const reference = list.children[index];
  item = makeNewItemContainer(item);

  list.insertBefore(item, reference);

  return true;
};

export const editItemOnHomeList = (id, props) => {
  const item = document.getElementById(id);
  const type = item.classList[1];

  const keys = ['title', 'description', 'dueDate', 'priority'];
  keys.forEach((key) => {
    const container = item.querySelector(`[class*=${key}]`);
    container.textContent = props[key];
  });

  props.dueDate = Timestamp.fromDate(new Date(props.dueDate));
  sortItemOverdueStatus(props, item);

  if (type === 'todo') {
    const container = item.querySelector('[class*=project]');
    container.textContent = `project: ${props.project}`;
  }

  return true;
};

export const switchProjectsTodos = async (e) => {
  const switchDiv = document.getElementById('home-controls-switch');

  let { type } = e.target;
  let items = null;

  const list = document.getElementById('home-items');
  const form = list.querySelector('form');
  if (form !== null) {
    const control = document.getElementById('home-controls-add');
    const type = form.classList[1].match(/(?<=-)\w+$/)[0];
    switchItemControl(control, type, false);
    clearContainerOfElements(list, 'form');
  }

  const { by, desc } = document.getElementById('home');
  switch (type) {
    case 'project': { items = projects.getProjects(); break; }
    case 'todo': { items = projects.getTodos(); break; }
    default: console.log(`switchProjectsTodos: sorry, we are out of ${type}.`);
  }
  showItems(items, type, ...[by, desc]);
  setHomeType(type);

  switch (type) {
    case 'project': { type = 'todo'; break; } case 'todo': { type = 'project'; break; }
    default: console.log(`switchProjectsTodos: sorry, we are out of ${type}.`);
  }
  switchDiv.textContent = `${type}s`;
  switchDiv.type = type;

  return true;
};