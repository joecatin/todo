import item from './components/item/item';


const main = document.createElement('div');
main.id = 'main-container';
document.body.appendChild(main);

const newItem = item({title: "test", description: "test", dueDate: "test", priority: "test"});

console.log(newItem.title);


