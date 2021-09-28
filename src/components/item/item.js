const newItem = ({ title, description, dueDate, priority }) => {

    let state = { title, description, dueDate, priority };
    
    return Object.assign(state);
}

export default newItem;