/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

const findItemindex = (items, id) => items.findIndex((item) => item.id === id);

const withGetter = (projects) => ({
  get: () => projects,
});

const withSetter = (projects) => ({
  set: (value) => { projects = value; },
});

const withProjectsHandler = (projects) => ({
  getProjects: () => projects,
  getProjectsProp: (key) => {
    const props = [];
    projects.forEach((project) => props.push(project[key]));

    return props;
  },
});

const withProjectHandler = (projects) => ({
  getProject: (id) => projects.filter((project) => project.id === id)[0],
  getProjectProp: (id, key) => {
    const project = projects.filter((project) => project.id === id)[0];

    return project[key];
  },
  getProjectIdByProp: (key, value) => projects.filter((project) => project[key] === value)[0].id,
  setProject: (id, value) => {
    const index = findItemindex(projects, id);
    projects[index] = value;

    return true;
  },
  setProjectProp: (id, key, value) => {
    const projectIndex = findItemindex(projects, id);
    projects[projectIndex][key] = value;

    return true;
  },
  setProjectProps: (id, props) => {
    const projectIndex = findItemindex(projects, id);
    props.forEach((key, value) => {
      console.log(key);
      console.log(value);
      projects[projectIndex][key] = value;
    });

    return true;
  },
  deleteProject: (id) => {
    const projectIndex = findItemindex(projects, id);
    projects.splice(projectIndex, 1);
    // delete projects[projectIndex];

    return id;
  },
  addProject: (project) => { console.log('addProject called.'); projects.push(project); return project.id; },
});

const withTodosHandler = (projects) => ({
  getTodos: () => {
    const todos = [];
    projects.forEach((project) => project.todos.forEach((todo) => todos.push(todo)));

    return todos;
  },
  getTodosProp: (projectId, key) => {
    const props = [];
    const projectIndex = findItemindex(projects, projectId);
    const project = projects[projectIndex];
    project.todos.forEach((todo) => props.push(todo[key]));

    return props;
  },
});

const withTodoHandler = (projects) => ({
  getTodo: (projectId, todoId) => {
    const projectIndex = findItemindex(projects, projectId);
    const project = projects[projectIndex];
    const todoIndex = findItemindex(project.todos, todoId);

    return projects[projectIndex].todos[todoIndex];
  },
  getTodoProp: (projectId, todoId, key) => {
    const projectIndex = findItemindex(projects, projectId);
    const project = projects[projectIndex];
    const todoIndex = findItemindex(project.todos, todoId);

    return projects[projectIndex].todos[todoIndex][key];
  },
  setTodo: (projectId, todoId, todo) => {
    const projectIndex = findItemindex(projects, projectId);
    const project = projects[projectIndex];
    const todoIndex = findItemindex(project.todos, todoId);
    projects[projectIndex].todos[todoIndex] = todo;

    return true;
  },
  setTodoProp: (projectId, todoId, key, value) => {
    const projectIndex = findItemindex(projects, projectId);
    const project = projects[projectIndex];
    const todoIndex = findItemindex(project.todos, todoId);
    projects[projectIndex].todos[todoIndex][key] = value;

    return true;
  },
  addTodo: (projectId, todo) => {
    const projectIndex = findItemindex(projects, projectId);
    projects[projectIndex].todos.push(todo);

    return todo.id;
  },
  deleteTodo: (projectId, todoId) => {
    const projectIndex = findItemindex(projects, projectId);
    const project = projects[projectIndex];
    const todos = project.todos.filter((todo) => todo.id !== todoId);
    projects[projectIndex].todos = todos;

    return true;
  },

});

export const Projects = (...projects) => {
  const _instance = {};
  const _data = [...projects];
  return Object.assign(
    _instance,
    withGetter(_data),
    withSetter(_data),
    withProjectsHandler(_data),
    withProjectHandler(_data),
    withTodosHandler(_data),
    withTodoHandler(_data),
  );
};
