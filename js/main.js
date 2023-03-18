Vue.component('column', {
    props: {
        column: {
            disabled: false,
            index: null,
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
    methods: {
        doneSubtask(subtask) {
            this.$emit('done-subtask', subtask)
        },
        taskHalfFilled(task) {
            this.$emit('task-half-filled', {task: task, column: this.column})
        },
        taskFilledCompletely(task) {
            this.$emit('task-filled-completely', {task: task, column: this.column})
            this.$emit('column-1-unlock')
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
                    {
                        name: "Задача 2",
                        subtasks: [
                            {name: "Пункт 2.1", done: false},
                            {name: "Пункт 2.2", done: false},
                            {name: "Пункт 2.3", done: false},
                        ]
                    },
                    {
                        name: "Задача 3",
                        subtasks: [
                            {name: "Пункт 3.1", done: false},
                            {name: "Пункт 3.2", done: false},
                            {name: "Пункт 3.3", done: false},
                        ]
                    }
                ]
            },
            {
                disabled: false,
                index: 1,
                name: "В процессе",
                tasks: [
                    {
                        name: "Задача 3",
                        subtasks: [
                            {name: "Пункт 3.1", done: false},
                            {name: "Пункт 3.2", done: true},
                            {name: "Пункт 3.3", done: true},
                        ]
                    },
                    {
                        name: "Задача 3",
                        subtasks: [
                            {name: "Пункт 3.1", done: true},
                            {name: "Пункт 3.2", done: false},
                            {name: "Пункт 3.3", done: true},
                        ]
                    },
                    {
                        name: "Задача 3",
                        subtasks: [
                            {name: "Пункт 3.1", done: true},
                            {name: "Пункт 3.2", done: false},
                            {name: "Пункт 3.3", done: true},
                        ]
                    }
                ]
            },
            {
                disabled: false,
                index: 2,
                name: "Закончено",
                tasks: []
            }
        ]
    },
    methods: {
        doneSubtask(subtask) {
            subtask.done = true
        },
        taskHalfFilled(data) {
            if (data.column.index !== 0 || data.column.disabled) return
            if (this.columns[1].tasks.length === 5) {
                this.columns[0].disabled = true
                return;
            }
            this.moveTask(data)
        },
        taskFilledCompletely(data) {
            if (data.column.index !== 1) return
            this.moveTask(data)
        },
        moveTask(data) {
            const task = data.column.tasks.splice(data.column.tasks.indexOf(data.task), 1)[0]
            this.columns[data.column.index + 1].tasks.push(task)
        },
        column1Unlock() {
            this.columns[0].disabled = false

            this.columns[0].tasks.every(task => {
                const countSubtaskDone = task.subtasks.filter(subtask => subtask.done).length
                if (Math.ceil(task.subtasks.length / 2) === countSubtaskDone) {
                    this.moveTask({task: task, column: this.columns[0]})
                }
            })

        }
    }
})