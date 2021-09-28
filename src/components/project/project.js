const canAdd = state => ({
    add: (item) => { state.items.push(item) }
})

const canClear = state => ({
    clear: () => { state.items = [] }
})


const newProject = ( title, description, dueDate, priority ) => {

    let state = { title, description, dueDate, priority, items: [] };
    
    return Object.assign(state, canAdd(state), canClear(state));
}

export default newProject;