/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */

import { addYears, format } from 'date-fns';

export const makeFormInputText = (type, id, name, text) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = name;

  switch (type) {
    case 'add': { input.placeholder = text; break; }
    case 'edit': { input.value = text; break; }
    default: console.log(`makeFormInputText: sorry, we are out of ${type}.`);
  }

  return input;
};

export const makeFormInputDate = (
  id, name, value = format(new Date(), 'yyyy-MM-dd'),
  min = new Date(), max = addYears(new Date(), 1),
) => {
  const input = document.createElement('input');
  input.type = 'date';
  input.id = id;
  input.name = name;
  input.value = value;
  input.min = min;
  input.max = max;

  return input;
};

export const makeFormInputSelect = (id, name, text, choices, selected = null) => {
  const container = document.createElement('span');
  const input = document.createElement('label');
  input.textContent = text;
  input.for = name;
  container.appendChild(input);
  const select = document.createElement('select');
  select.id = id;
  select.name = name;
  choices.forEach((choice) => {
    const option = document.createElement('option');
    option.value = choice;
    if (choice === selected) option.selected = true;
    option.textContent = choice;
    select.appendChild(option);
  });
  container.appendChild(select);

  return container;
};

export const clearContainerOfElements = (container, selector) => {
  container.querySelectorAll(selector).forEach((element) => element.remove());

  return true;
};
