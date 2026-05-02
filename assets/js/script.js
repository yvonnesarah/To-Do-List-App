const elements = {
    input: document.getElementById("task-input"),
    date: document.getElementById("task-date"),
    category: document.getElementById("task-category"),
    priority: document.getElementById("task-priority"),
    list: document.getElementById("task-list"),
    progressText: document.getElementById("progress-text"),
    progressBar: document.getElementById("progress-bar"),
};

let tasks = [];

/* Add Task */
document.getElementById("add-task-btn").addEventListener("click", () => {
    if (!elements.input.value.trim()) return alert("Please enter a task.");

    tasks.push({
        text: elements.input.value,
        date: elements.date.value,
        category: elements.category.value,
        priority: elements.priority.value,
        completed: false,
    });

    elements.input.value = "";
    renderTasks();
});

/* Render */
function renderTasks(data = tasks) {
    elements.list.innerHTML = "";

    data.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";

        li.innerHTML = `
            <span>${task.text} (${task.category}) - ${task.priority}</span>
            <button onclick="deleteTask(${index})">❌</button>
        `;

        li.onclick = () => toggleTask(index);

        elements.list.appendChild(li);
    });

    updateProgress();
}

/* Toggle */
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

/* Delete */
function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

/* Filters */
document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.filter;
        renderTasks(type === "all" ? tasks : tasks.filter(t => t.category === type));
    });
});

/* Sorting */
document.querySelectorAll("[data-sort]").forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.sort;

        if (type === "priority") {
            const order = { high: 1, medium: 2, low: 3 };
            tasks.sort((a, b) => order[a.priority] - order[b.priority]);
        } else {
            tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        renderTasks();
    });
});

/* Progress */
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    const percent = total ? Math.round((completed / total) * 100) : 0;

    elements.progressText.textContent = `${percent}%`;

    const offset = 314 - (314 * percent) / 100;
    elements.progressBar.style.strokeDashoffset = offset;
}

/* Dark Mode */
document.getElementById("dark-mode-toggle")
    .addEventListener("click", () => document.body.classList.toggle("dark"));