const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

const todos = []


function findTodosInFile(file) {
    const lines = file.split('\n');
    const todos = [];

    lines.forEach((line, index) => {
        if (line.includes('// TODO')) {
            todos.push(line.trim());
        }
    });

    return todos;
}

getFiles().forEach((file) => {
    todos.push(...findTodosInFile(file));
})

function processCommand(command) {
    if (command.includes("user ")) {
        const [_, user] = command.split(' ');
        for (const todo of todos) {
            if (todo.includes(`// TODO ${user}`)) {
                console.log(todo);
            }
        }
    } else {
        switch (command) {
            case 'show':
                writeTodos(todos)
                break;
            case 'exit':
                process.exit(0);
                break;
            case 'important':
                const importantTodos = getImportantTodos();
                writeTodos(importantTodos);
                break;
            case 'sort importance':
                const arrayToSort = getImportantTodos();
                const sortedImportantTodos = arrayToSort.sort((a, b) => {
                    const countA = (a.match(/!/g) || []).length;
                    const countB = (b.match(/!/g) || []).length;
                    return countB - countA;
                });

                const nonImportantTodos = todos.filter(todo => !todo.includes('!'));

                const finalTodos = [...sortedImportantTodos, ...nonImportantTodos];

                writeTodos(finalTodos);
                break;
            case 'sort user':
                const sortedByUsers = sortTodosByUser(todos)
                writeTodos(sortedByUsers)
                break;

            case 'sort date':
                const sortedByDate = [...todos].sort((a, b) => {
                    const dateA = a.match(/\/\/ TODO .*?; (\d{4}-\d{2}-\d{2});/)?.[1] || '0000-00-00';
                    const dateB = b.match(/\/\/ TODO .*?; (\d{4}-\d{2}-\d{2});/)?.[1] || '0000-00-00';

                    return new Date(dateB) - new Date(dateA);
                });
                sortedByDate.forEach(a => {
                    console.log(a);
                })
                break;

            default:
                console.log('wrong command');
                break;
        }
    }
}

function getImportantTodos() {
    /** @type {Array<string>} */
    let importantTodos = []

    for (const todoCommand of todos) {
        if (todoCommand.includes('!')) {
            importantTodos.push(todoCommand)
        }
    }

    return importantTodos
}

function writeTodos(todosArray) {
    for (const item of todosArray) {
        console.log(item)
    }
}

function sortTodosByUser(todos) {
    return todos.sort((a, b) => {
        const authorA = a.split(';')[0].replace('// TODO', '').trim();
        const authorB = b.split(';')[0].replace('// TODO', '').trim();

        if (!authorA)
            return 1;

        if (!authorB)
            return -1;

        return authorA.localeCompare(authorB);
    });
}
