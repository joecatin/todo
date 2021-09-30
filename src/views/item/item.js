/* eslint-disable linebreak-style */

import './item.css';

const makeElement = (type, id, content) => {
  const element = document.createElement(type);
  element.id = id;
  element.textContent = content;
  return element;
};

const makeElementCollapsible = (element, type) => {
  element.addEventListener('click', () => {
    element.classList.toggle(`${type}-active`);
    const content = element.nextElementSibling;
    if (content.style.display === 'block') {
      content.style.display = 'none';
    } else {
      content.style.display = 'block';
    }
  });
  return element;
};

const animateCollapsible = (element, type) => {
  element.addEventListener('click', () => {
    element.classList.toggle(`${type}-active`);
    const content = element.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
  return element;
};

const makeTitle = (text, type) => {
  let title = makeElement(
    'button', `${type}-title`, text,
  );
  title = makeElementCollapsible(title, 'item');
  title = animateCollapsible(title, 'item');
  return title;
};

const makeDetails = (type, date, level) => {
  const details = document.createElement('div');
  details.id = `${type}-details`;
  const dueDate = makeElement(
    'div', `${type}-dueDate`, date,
  );
  details.appendChild(dueDate);
  const priority = makeElement(
    'div', `${type}-priority`, level,
  );
  details.appendChild(priority);
  return details;
};

const makeContent = (type, text, ...args) => {
  const content = document.createElement('div');
  content.id = `${type}-content`;
  const description = makeElement(
    'div', `${type}-description`, text,
  );
  content.appendChild(description);

  const details = makeDetails(type, ...args);
  content.appendChild(details);

  return content;
};

const showItem = (item) => {
  const view = document.createElement('div');
  view.id = 'item';

  const title = makeTitle(item.get('title'), 'item');
  view.appendChild(title);

  const content = makeContent(
    'item',
    item.get('description'),
    item.get('dueDate'),
    item.get('priority'),
  );

  view.appendChild(content);

  return view;
};

export default showItem;
