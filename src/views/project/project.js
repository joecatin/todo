/* eslint-disable linebreak-style */
import showItem from '../item/item';
import { makeContent, makeTitle } from '../helpers/helpers';
import './project.css';

const makeProjectItems = (projectItems) => {
  const items = document.createElement('div');
  items.classList.add('project-items');
  const header = document.createElement('div');
  header.textContent = 'In the pipe:';
  items.appendChild(header);
  projectItems.forEach((item) => {
    const div = showItem(item);
    div.classList.add('item');
    items.appendChild(div);
  });

  return items;
};

const makeProjectContent = (description, dueDate, priority, items) => {
  const content = makeContent('project', description, dueDate, priority);
  const todos = makeProjectItems(items);
  content.appendChild(todos);

  return content;
};

const showProject = (project) => {
  const view = document.createElement('div');
  view.classList.add('project');

  const title = makeTitle(project.get('title'), 'project');
  view.appendChild(title);

  const content = makeProjectContent(
    project.get('description'),
    project.get('dueDate'),
    project.get('priority'),
    project.get('items'),
  );
  view.appendChild(content);

  return view;
};

export default showProject;
