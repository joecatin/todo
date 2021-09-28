import { format } from 'date-fns';

const items = [
    {
        title: "Todo list",
        description: "Finish Odin project todo list assignment",
        dueDate: format(new Date(2021, 11, 1), 'yyyy-MM-dd'), 
        priority: "high"
    },
    {
        title: "Bin",
        description: "Take trash out",
        dueDate: format(new Date(2021, 9, 25), 'yyyy-MM-dd'), 
        priority: "moderate"
    },
    {
        title: "Portuguese",
        description: "Make progress on learning Portuguese",
        dueDate: format(new Date(2022, 1, 1), 'yyyy-MM-dd'), 
        priority: "low"
    }
]

export default items;