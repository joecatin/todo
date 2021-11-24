/* eslint-disable linebreak-style */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { makeHomeControls, makeHomeItems } from './utils';
import '../styles/home.css';

const makeHome = (items) => {
  const home = document.createElement('div');
  home.id = 'home';

  const controls = makeHomeControls();
  home.appendChild(controls);

  const content = makeHomeItems(items);
  home.appendChild(content);

  return home;
};

export default makeHome;
