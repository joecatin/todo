/* eslint-disable object-curly-newline */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

const withGetter = (dataObject) => ({
  get: (key) => dataObject[key],
});

const withSetter = (dataObject) => ({
  set: (key, value) => { dataObject[key] = value; },
});

const Todo = ({ project, id, title, description, dueDate, priority, status }) => {
  const _instance = {};
  const _data = { project, id, title, description, dueDate, priority, status };
  return Object.assign(
    _instance,
    withGetter(_data),
    withSetter(_data),
  );
};

export default Todo;
