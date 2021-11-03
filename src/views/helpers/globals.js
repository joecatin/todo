/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */

export const makeElement = (type, className, content) => {
  const element = document.createElement(type);
  element.classList.add(className);
  element.innerHTML = content;
  return element;
};

const addCollapsibility = (element) => {
  if (element.style.display === 'block') {
    element.style.display = 'none';
  } else {
    element.style.display = 'block';
  }
  return element;
};

const animateCollapsibility = (element) => {
  const parent = element.parentElement.closest('div[class$=content]');
  if (element.style.maxHeight) {
    element.style.maxHeight = null;
  } else {
    element.style.maxHeight = `${element.scrollHeight}px`;
    if (parent) {
      parent.style.maxHeight = `${parent.scrollHeight + element.scrollHeight}px`;
    }
  }
  return element;
};

const makeElementCollapsible = (element, type) => {
  element.classList.toggle(`${type}-active`);
  const content = element.nextElementSibling;
  addCollapsibility(content);
  animateCollapsibility(content);

  return element;
};

export const makeTitle = (text, type) => {
  const title = makeElement('button', `${type}-title`, text);
  title.addEventListener('click', () => {
    makeElementCollapsible(title, type);
  }, false);

  return title;
};

const makeDetails = (type, date, level) => {
  const details = document.createElement('div');
  details.classList.add(`${type}-details`);
  const dueDate = makeElement('div', `${type}-dueDate`, date);
  details.appendChild(dueDate);
  const priority = makeElement('div', `${type}-priority`, level);
  details.appendChild(priority);
  return details;
};

const makeControls = (type, done) => {
  const controls = document.createElement('div');
  controls.classList.add(`${type}-controls`);

  const clear = makeElement('div', `${type}-clear`, 'clear');
  controls.appendChild(clear);
  const status = makeElement(
    'div', `${type}-status`, done ? 'done' : 'open',
  );
  controls.appendChild(status);

  const remove = makeElement('div', `${type}-`, 'delete');
  controls.appendChild(remove);

  return controls;
};

export const makeContent = (type, inner, date, level, status) => {
  const content = document.createElement('div');
  content.classList.add(`${type}-content`);
  const description = makeElement('div', `${type}-description`, inner);
  content.appendChild(description);

  const details = makeDetails(type, date, level);
  content.appendChild(details);

  const controls = makeControls('item', status);
  content.appendChild(controls);

  return content;
};
