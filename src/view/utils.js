/* eslint-disable no-unused-expressions */
/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable default-case */

export const types = ['todo', 'project', 'project-todo'];

export const makeElement = (
  containerType, className = null, content = null, typeAttribute = null, idAttribute = null,
  eventListener = { type: null, callback: null },
) => {
  const element = document.createElement(containerType);
  element.classList.add(className);
  if (content !== null) element.innerHTML = content;
  if (typeAttribute !== null) element.type = typeAttribute;
  if (idAttribute !== null) element.id = idAttribute;
  element.addEventListener(eventListener.type, eventListener.callback);

  return element;
};

export const makeDiv = (className, content, typeAttribute, idAttribute, eventListener) => {
  const div = makeElement('div', className, content, typeAttribute, idAttribute, eventListener);

  return div;
};

export const adjustHeight = (element, parentRegex) => {
  const parent = element.parentElement.closest(parentRegex);

  if (element.style.maxHeight > 0) {
    element.style.maxHeight = null;
  } else {
    element.style.maxHeight = `${element.scrollHeight}px`;
    if (parent) {
      parent.style.maxHeight = `${parent.scrollHeight + element.scrollHeight}px`;
    }
  }

  return element;
};

const addCollapsibility = (element) => {
  element.style.display = (element.style.display === 'block') ? 'none' : 'block';

  return element;
};

export const toggleCollapse = (e) => {
  e.target.classList.toggle('title-active');
  const content = e.target.nextElementSibling;

  addCollapsibility(content);
  adjustHeight(content, 'div[class$=content]');

  return true;
};

export const insertAfter = (newNode, existingNode) => {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

export const clearContainerOfElements = (container, selector) => {
  container.querySelectorAll(`:scope > ${selector}`).forEach((element) => element.remove());

  return true;
};

export const toggleElementClass = (element, label, add) => {
  (add) ? element.classList.add(label) : element.classList.remove(label);

  return element;
};

const toggleElementClasses = (element, labels, add) => {
  labels.forEach((label) => toggleElementClass(element, label, add));

  return element;
};

export const toggleElementsClass = (elements, label, add) => {
  elements.forEach((element) => toggleElementClass(element, label, add));

  return elements;
};

const toggleElementsClasses = (elements, labels, add) => {
  elements.forEach((element) => toggleElementClasses(element, labels, add));

  return elements;
};