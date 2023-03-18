Vue.component('add-task', {
    template: `
    <div class="column">
        <h2>Добавить задачу</h2>
        <div>
        <label>Название задачи <input :value="task.name"></label>
        <h3>Подзадачи</h3>
        <div v-for="(subtask, index) in task.subtasks"><input :value="subtask.name" :key="index">
        <button @click="delSubtask(index)">-</button>
        </div>
        <button @click="addSubtask">+</button><button @click="addTask">Добавить</button>
        </div>
    </div>
    `,
    methods: {
        addSubtask() {
            this.task.subtasks.push({name: "Пункт " + (this.task.subtasks.length + 1), done: false})
        },
        delSubtask(index) {
            this.task.subtasks.splice(index, 1)
        },
        addTask() {
            this.$emit('add-task', JSON.parse(JSON.stringify(this.task)))
        }
    },
    data() {
        return {
            task: {
                name: 'Новая задача',
                subtasks: [
                    {name: "Пункт 1", done: false},
                    {name: "Пункт 2", done: false},
                    {name: "Пункт 3", done: false},
                ]
            }
        }
    },
})

Vue.component('column', {
    props: {
        column: {
            name: '',
            tasks: []
        }
    },
    template: `
    <div class="column">
        <h2>{{column.name}}</h2>
        <div class="task">
        <task v-for="(task, index) in column.tasks"
        :key="index"
        :task="task"
        @done-subtask="doneSubtask"
        @task-half-filled="taskHalfFilled"
        @task-filled-completely="taskFilledCompletely"
        ></task>
        </div>
    </div>
    `,
    updated() {
        this.$emit('save')
    },
    methods: {
        doneSubtask(subtask) {
            this.$emit('done-subtask', subtask)
        },
        taskHalfFilled(task) {
            this.$emit('task-half-filled', {task: task, column: this.column})
        },
        taskFilledCompletely(task) {
            this.$emit('task-filled-completely', {task: task, column: this.column})
        }
    }
})

Vue.component('task', {
    props: {
        task: {
            name: '',
            subtasks: []
        }
    },
    template: `
    <div>
        <h2>{{task.name}}</h2>
        <div v-for="(subtask, index) in task.subtasks" class="subtask"
        :key="index"
        :class="{done:subtask.done}" 
        @click="doneSubtask(subtask)"> {{subtask.name}}</div>
    </div>
    `,
    updated() {
        if (this.halfFilled) {
            this.$emit('task-half-filled', this.task)
        }
        if (this.filledCompletely) {
            this.$emit('task-filled-completely', this.task)
        }
    },
    methods: {
        doneSubtask(subtask) {
            this.$emit('done-subtask', subtask)
        }
    },
    computed: {
        filledCompletely() {
            const countSubtaskDone = this.task.subtasks.filter(subtask => subtask.done).length
            return countSubtaskDone / this.task.subtasks.length === 1
        },
        halfFilled() {
            const countSubtaskDone = this.task.subtasks.filter(subtask => subtask.done).length
            return Math.ceil(this.task.subtasks.length / 2) === countSubtaskDone
        },
    }
})

let app = new Vue({
    el: '#app',
    data: {
        name: "Великолепное приложение TODO",
        columns: [
            {
                maxSize: 3,
                disabled: false,
                index: 0,
                name: "Новые задачи",
                tasks: [
                    {
                        name: "Задача 1",
                        subtasks: [
                            {name: "Пункт 1.1", done: true},
                            {name: "Пункт 1.2", done: false},
                            {name: "Пункт 1.3", done: false},
                            {name: "Пункт 1.4", done: false},
                            {name: "Пункт 1.5", done: false},
                        ]
                    },
                ]
            },
            {
                maxSize: 5,
                disabled: false,
                index: 1,
                name: "В процессе",
                tasks: []
            },
            {
                maxSize: -1,
                disabled: false,
                index: 2,
                name: "Закончено",
                tasks: []
            }
        ]
    },
    mounted() {
        if (!localStorage.getItem('columns')) return
        this.columns = JSON.parse(localStorage.getItem('columns'));
    },
    methods: {
        saveData() {
            localStorage.setItem('columns', JSON.stringify(this.columns))
        },
        addTask(task) {
            if (this.column1Full || this.columns[0].disabled) return
            this.columns[0].tasks.push(task)
        },
        doneSubtask(subtask) {
            subtask.done = true
            this.saveData()
        },
        taskHalfFilled(data) {
            if (data.column.index !== 0 || data.column.disabled) return
            if (this.column2Full) {
                this.columns[0].disabled = true
                return;
            }
            this.moveTask(data, this.columns[1])
        },
        taskFilledCompletely(data) {
            this.moveTask(data, this.columns[2])
            this.column1Unlock()
        },
        moveTask(data, column) {
            const task = data.column.tasks.splice(data.column.tasks.indexOf(data.task), 1)[0]
            column.tasks.push(task)
        },
        column1Unlock() {
            this.columns[0].disabled = false

            this.columns[0].tasks.forEach(task => {
                const countSubtaskDone = task.subtasks.filter(subtask => subtask.done).length
                if (Math.ceil(task.subtasks.length / 2) === countSubtaskDone) {
                    this.moveTask({task: task, column: this.columns[0]}, this.columns[1])
                }
            })

        }
    },
    computed: {
        column1Full() {
            return this.columns[0].tasks.length === this.columns[0].maxSize
        },
        column2Full() {
            return this.columns[1].tasks.length === this.columns[1].maxSize
        }
    }
})