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
/* eslint-disable import/prefer-default-export */

import { deleteTodoFromFirestore, projects } from "./firestore";

export const deleteTodo = async (projectId, id) => {
  await deleteTodoFromFirestore(projectId, id);
  projects.deleteTodo(projectId, id);

  return id;
};