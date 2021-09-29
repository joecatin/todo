/* eslint-disable linebreak-style */
import showItem from '../item/item';
import './project.css';

const showProject = (project) => {
  const view = document.createElement('div');
  view.id = 'project';

  const title = document.createElement('div');
  title.id = 'title';
  title.textContent = project.get('title');
  view.appendChild(title);

  const description = document.createElement('div');
  description.id = 'description';
  description.textContent = project.get('description');
  view.appendChild(description);

  const details = document.createElement('div');
  details.id = 'details';
  const dueDate = document.createElement('div');
  dueDate.id = 'dueDate';
  dueDate.textContent = project.get('dueDate');
  details.appendChild(dueDate);
  const priority = document.createElement('div');
  priority.id = 'priority';
  priority.textContent = project.get('priority');
  details.appendChild(priority);
  view.appendChild(details);

  const items = document.createElement('div');
  items.id = 'items';
  const header = document.createElement('div');
  header.textContent = 'in the pipe';
  items.appendChild(header);
  project.get('items').forEach((item) => {
    const div = showItem(item);
    div.classList.add('item');
    items.appendChild(div);
  });

  view.appendChild(items);

  return view;
};

export default showProject;
