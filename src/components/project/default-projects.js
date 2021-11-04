/* eslint-disable linebreak-style */
import { format } from 'date-fns';
import newItem from '../item/item';
import items from '../item/default-items';
import newProject from './project';

const projects = [];

let project = newProject({
  title: 'one',
  description: 'first dummy project',
  dueDate: format(new Date(2021, 11, 31), 'yyyy-M-d'),
  priority: 'uncertain',
  status: 'high',
});
items.forEach((item) => project.add(newItem(item)));
projects.push(project);

project = newProject({
  title: 'two',
  description: 'second dummy project',
  dueDate: format(new Date(2021, 12, 31), 'yyyy-M-d'),
  priority: 'medium',
  status: 'open',
});
items.forEach((item) => project.add(newItem(item)));
projects.push(project);

project = newProject({
  title: 'three',
  description: 'third dummy project',
  dueDate: format(new Date(2022, 2, 28), 'yyyy-M-d'),
  priority: 'low',
  status: 'open',
});
items.forEach((item) => project.add(newItem(item)));
projects.push(project);

export default projects;
