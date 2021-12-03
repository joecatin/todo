/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */

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
/* eslint-disable prefer-const */

import { projects } from '../../model/firestore';
import { makeAddItemForm } from './forms';
import { makeFormInputSelect } from './utils';

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