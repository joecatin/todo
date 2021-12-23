/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable import/named */
/* eslint-disable import/prefer-default-export */
/* eslint-disable default-case */

import { deleteProject } from './project';
import { deleteTodo } from './todo';
import {
  hideAddEditItemFormFromHome, hideAddEditTodoFormFromProject,
} from '../view/forms/utils';
import { addItemToFirestore, projects } from './firestore';
import { addItemToItemsList } from '../view/components/item';

export const addItem = async (type, item, projectId = null) => {
  const itemType = type.match(/(?<=-)\w+(?=-)/)[0];
  const itemId = await addItemToFirestore(itemType, projectId, item);

  item = { type, id: itemId, ...item };
  addItemToItemsList(item);

  item.type = itemType;
  switch (itemType) {
    case 'project': { projects.addProject(item); break; }
    case 'todo': {
      projects.addTodo(
        projectId, { projectTitle: projects.getProjectProp(projectId, 'title'), ...item },
      );
      break;
    }
    default: console.log(`AddItem: sorry, we are out of ${itemType}.`);
  }

  return itemId;
};

export const deleteItem = async (e) => {
  const { id, type } = e.target;

  switch (type) {
    case 'project': { await deleteProject(id); break; }
    case 'todo': case 'project-todo': {
      const { projectId } = e.target; await deleteTodo(projectId, id); break;
    }
    default: console.log(`deleteItem: sorry, we are out of ${type}.`);
  }

  const form = document.querySelector(`[itemid=${id}]`);
  if (form !== null) {
    const location = form.getAttribute('location');
    switch (location) {
      case 'home': { hideAddEditItemFormFromHome(); break; }
      case 'project': { hideAddEditTodoFormFromProject(e); break; }
      default: console.log(`deleteItem: sorry, we are out of ${location}.`);
    }
  }
  const item = document.getElementById(id);
  item.remove();

  return id;
};