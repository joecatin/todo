/* eslint-disable import/no-extraneous-dependencies */

import './index.css';
import Home from './views/home';
// import populate from './others/populate';

// populate();

Home().then((home) => document.body.appendChild(home));
