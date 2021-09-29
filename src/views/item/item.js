/* eslint-disable linebreak-style */

import './item.css';

const showItem = (item) => {
  const view = document.createElement('div');
  view.id = 'item';

  const title = document.createElement('div');
  title.id = 'title';
  title.textContent = item.get('title');
  view.appendChild(title);

  const description = document.createElement('div');
  description.id = 'description';
  description.textContent = item.get('description');
  view.appendChild(description);

  const details = document.createElement('div');
  details.id = 'details';
  const dueDate = document.createElement('div');
  dueDate.id = 'dueDate';
  dueDate.textContent = item.get('dueDate');
  details.appendChild(dueDate);
  const priority = document.createElement('div');
  priority.id = 'priority';
  priority.textContent = item.get('priority');
  details.appendChild(priority);
  view.appendChild(details);

  return view;
};

export default showItem;
