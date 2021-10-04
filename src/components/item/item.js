/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const withGetter = (dataObject) => ({
  get: (key) => {
    console.log(`key: ${key} was asked`);
    return dataObject[key];
  },
});

const withSetter = (dataObject) => ({
  set: (key, value) => {
    console.log(`key: ${key}, was set with value: ${value}`);
    dataObject[key] = value;
  },
});

const newItem = (title, description, dueDate, priority) => {
  const _instance = {};
  const _data = {
    ...title, ...description, ...dueDate, ...priority, done: false,
  };
  return Object.assign(
    _instance,
    withGetter(_data),
    withSetter(_data),
  );
};

export default newItem;
