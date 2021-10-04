/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */

export const makeElement = (type, className, content) => {
  // console.log(`content from makeElement function: ${content}`);
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
  // console.log(`type of element from makeDetails function: ${type}`);
  // console.log(`type of element from makeDetails function: ${date}`);
  const details = document.createElement('div');
  details.classList.add(`${type}-details`);
  const dueDate = makeElement('div', `${type}-dueDate`, date);
  details.appendChild(dueDate);
  const priority = makeElement('div', `${type}-priority`, level);
  details.appendChild(priority);
  return details;
};

export const makeContent = (type, inner, date, level) => {
  const content = document.createElement('div');
  content.classList.add(`${type}-content`);
  const description = makeElement('div', `${type}-description`, inner);
  content.appendChild(description);

  const details = makeDetails(type, date, level);
  content.appendChild(details);

  return content;
};
