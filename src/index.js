import { format } from 'date-fns';
import newItem from './components/item/item';
import newProject from './components/project/project';
import items from './default-items';

const main = document.createElement('div');
main.id = 'main-container';
document.body.appendChild(main);

const project = newProject({
  title: 'project',
  description: 'project',
  dueDate: format(new Date(2014, 1, 13), 'yyyy-MM-dd'),
  priority: 'project',
});

items.forEach((item) => project.add(newItem(item)));

project.get('items').forEach((item) => console.log(item.get('title')));

project.delete('Portuguese');
