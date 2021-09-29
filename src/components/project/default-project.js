/* eslint-disable linebreak-style */
import { format } from 'date-fns';
import newItem from '../item/item';
import items from '../item/default-items';
import newProject from './project';

const project = newProject({
  title: 'Mock',
  description: 'Dummy project',
  dueDate: format(new Date(2021, 11, 31), 'yyyy-M-d'),
  priority: 'uncertain',
});

items.forEach((item) => project.add(newItem(item)));

export default project;
