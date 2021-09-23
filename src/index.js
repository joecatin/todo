import newItem from './components/item/item';
import newProject from './components/project/project';
import items from './default-items';
import { format } from 'date-fns';


const main = document.createElement('div');
main.id = 'main-container';
document.body.appendChild(main);

const project = newProject({
    title: "project", description: "project", 
    dueDate: format(new Date(2014, 1, 13), 'yyyy-MM-dd'), 
    priority: "project", items: []
});

items.forEach(item => project.add(newItem(item)));

console.log(project.items);


