const elements = {
    input: document.getElementById("task-input"),
    date: document.getElementById("task-date"),
    category: document.getElementById("task-category"),
    priority: document.getElementById("task-priority"),
    list: document.getElementById("task-list"),
    progressText: document.getElementById("progress-text"),
    progressBar: document.getElementById("progress-bar"),
    search: document.getElementById("search-input"),
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* =========================
   TOAST
========================= */
function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
    }, 2000);
}

/* =========================
   SAVE TO STORAGE
========================= */
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   ADD TASK
========================= */
document.getElementById("add-task-btn").addEventListener("click", () => {
    if (!elements.input.value.trim()) return alert("Please enter a task.");

    tasks.push({
        id: Date.now(),
        text: elements.input.value,
        date: elements.date.value,
        category: elements.category.value,
        priority: elements.priority.value,
        completed: false,
    });

    elements.input.value = "";
    save();
    renderTasks();
    toast("Task added");
});

/* =========================
   RENDER TASKS
========================= */
function renderTasks(data = tasks) {
    elements.list.innerHTML = "";

    data.forEach((task) => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";

        li.innerHTML = `
            <span>
                ${task.text} (${task.category}) - ${task.priority}
            </span>

            <div>
                <button onclick="editTask(${task.id})">✏️</button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;

        li.addEventListener("click", () => toggleTask(task.id));

        elements.list.appendChild(li);
    });

    updateProgress();
    save();
}

/* =========================
   TOGGLE COMPLETE
========================= */
function toggleTask(id) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );

    renderTasks();
}

/* =========================
   DELETE TASK
========================= */
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    toast("Task deleted");
}

/* =========================
   EDIT TASK
========================= */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt("Edit task:", task.text);

    if (newText) {
        task.text = newText;
        renderTasks();
        toast("Task updated");
    }
}

/* =========================
   FILTERS (UNCHANGED LOGIC)
========================= */
document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.filter;

        renderTasks(
            type === "all"
                ? tasks
                : tasks.filter(t => t.category === type)
        );
    });
});

/* =========================
   SORTING (UNCHANGED LOGIC)
========================= */
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

/* =========================
   PROGRESS
========================= */
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    const percent = total ? Math.round((completed / total) * 100) : 0;

    elements.progressText.textContent = `${percent}%`;

    const offset = 314 - (314 * percent) / 100;
    elements.progressBar.style.strokeDashoffset = offset;
}

/* =========================
   DARK MODE (PERSISTENT)
========================= */
document.getElementById("dark-mode-toggle")
.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );
});

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

/* =========================
   CLEAR COMPLETED
========================= */
document.getElementById("clear-completed")
.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.completed);
    renderTasks();
    toast("Completed cleared");
});

/* INIT */
renderTasks();