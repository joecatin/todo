/* eslint-disable import/no-extraneous-dependencies */

import './styles/index.css';
import { addYears, format } from 'date-fns';
import Home from './views/home';
import { showProjects } from './views/utils';
// import populate from './others/populate';
// populate();

const today = new Date();

console.log(format(addYears(today, 1), 'yyyy-MM-dd'));

Home().then((home) => {
  document.body.appendChild(home);
  showProjects();
});
