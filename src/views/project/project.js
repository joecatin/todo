/* eslint-disable linebreak-style */

import { makeTitle } from '../helpers/globals';
import { makeContent } from '../helpers/lists';
import './project.css';

const showProject = (project) => {
  const view = document.createElement('div');
  view.classList.add('project');

  const title = makeTitle(project.get('title'), 'project');
  view.appendChild(title);

  const content = makeContent(
    'project',
    project.get('description'),
    project.get('dueDate'),
    project.get('priority'),
    project.get('items'),
    project.get('status'),
  );
  view.appendChild(content);

  return view;
};

export default showProject;
