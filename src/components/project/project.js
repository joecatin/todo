/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const findItemindex = (items, title) => items.findIndex((item) => item.get('title') === title);

const withGetter = (dataObject) => ({
  get: (key) => dataObject[key],
});

const withSetter = (dataObject) => ({
  set: (key, value) => { dataObject[key] = value; },
});

const withItemsHandler = (dataObject) => ({
  add: (item) => dataObject.items.push(item),
  delete: (title) => {
    const index = findItemindex(dataObject.items, title);
    if (index > -1) {
      console.log(`item '${title}' has been removed from project: ${dataObject.title}`);
      dataObject.items.splice(index, 1);
    } else {
      console.log(`item '${title}' was not found in project: ${dataObject.title}`);
    }
  },
});

const newProject = (title, description, dueDate, priority) => {
  const _instance = {};
  const _data = {
    ...title, ...description, ...dueDate, ...priority, items: [],
  };
  return Object.assign(
    _instance,
    withGetter(_data),
    withSetter(_data),
    withItemsHandler(_data),
  );
};

export default newProject;
