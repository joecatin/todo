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

const newItem = (initialData) => {
  const _instance = {};
  const _data = { ...initialData };
  return Object.assign(
    _instance,
    withGetter(_data),
    withSetter(_data),
  );
};

export default newItem;
