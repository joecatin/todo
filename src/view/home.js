/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable prefer-destructuring */

import { showAddItem } from './forms';
import { getItems } from '../model/firestore';
import { showItems, switchProjectsTodos } from './utils';
import { projects } from '../index';

const types = ['todo', 'project'];

const makeHomeControls = (type) => {
  const controls = document.createElement('div');
  controls.classList.add('home-controls');

  type = types.filter((element) => element != type)[0];
  const typeDiv = document.createElement('div');
  typeDiv.textContent = `${type}s`;
  typeDiv.id = 'home-controls-switch';
  typeDiv.type = type;
  typeDiv.addEventListener('click', switchProjectsTodos);
  controls.appendChild(typeDiv);

  const add = document.createElement('div');
  add.textContent = 'add';
  add.id = 'home-controls-add';
  add.addEventListener('click', showAddItem);
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
};

const showHome = async (type, ...sortArgs) => {
  document.body.innerHTML = '';
  makeHome(type);
  const home = document.getElementById('home');
  home.type = type;
  [home.by, home.desc] = sortArgs;

  const items = await getItems(type);
  showItems(items, type, ...sortArgs);

  projects.forEach((project) => console.log(project));
};

export default showHome;