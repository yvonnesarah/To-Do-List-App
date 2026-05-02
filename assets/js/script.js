const elements = {
    input: document.getElementById("task-input"),
    date: document.getElementById("task-date"),
    category: document.getElementById("task-category"),
    priority: document.getElementById("task-priority"),
    list: document.getElementById("task-list"),
    progressText: document.getElementById("progress-text"),
    progressBar: document.getElementById("progress-bar"),
    search: document.getElementById("search-input"),
    body: document.body
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* =========================
   TOAST SYSTEM 
========================= */
function toast(message, type = "info") {
    const t = document.getElementById("toast");

    t.className = ""; // reset classes
    t.classList.add("show", type);
    t.textContent = message;

    clearTimeout(t.timer);
    t.timer = setTimeout(() => {
        t.classList.remove("show");
    }, 2500);
}

/* =========================
   SAVE
========================= */
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   ADD TASK
========================= */
function addTask() {
    const value = elements.input.value.trim();

    if (!value) {
        toast("Please enter a task first", "error");
        return;
    }

    tasks.push({
        id: Date.now(),
        text: value,
        date: elements.date.value,
        category: elements.category.value,
        priority: elements.priority.value,
        completed: false
    });

    elements.input.value = "";
    save();
    renderTasks();

    toast("Task added successfully", "success");
}

document.getElementById("add-task-btn").addEventListener("click", addTask);

elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});

/* =========================
   TOGGLE COMPLETE
========================= */
function toggleTask(id) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );

    renderTasks();
    toast("Task updated", "info");
}

/* =========================
   DELETE TASK
========================= */
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!confirm("Are you sure you want to delete this task?")) return;

    tasks = tasks.filter(t => t.id !== id);
    renderTasks();

    toast("Task deleted", "success");
}

/* =========================
   EDIT TASK
========================= */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Edit task:", task.text);

    if (!newText || !newText.trim()) {
        toast("Edit cancelled", "error");
        return;
    }

    task.text = newText.trim();
    renderTasks();

    toast("Task updated successfully", "success");
}

/* =========================
   SEARCH
========================= */
elements.search.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    const filtered = tasks.filter(t =>
        t.text.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );

    renderTasks(filtered);

    toast(`Searching: "${query}"`, "info");
});

/* =========================
   RENDER
========================= */
function renderTasks(data = tasks) {
    elements.list.innerHTML = "";

    if (data.length === 0) {
        elements.list.innerHTML = `<div class="empty-state">No tasks found</div>`;
        return;
    }

    data.forEach(task => {
        const li = document.createElement("li");

        const overdue =
            task.date &&
            new Date(task.date) < new Date() &&
            !task.completed;

        li.className = `
            ${task.completed ? "completed" : ""}
            ${task.priority}
            ${overdue ? "overdue" : ""}
        `;

        li.innerHTML = `
            <label>
                <input type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})">
                ${task.text} (${task.category})
            </label>

            <div>
                <button onclick="editTask(${task.id})">✏️</button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;

        elements.list.appendChild(li);
    });

    updateProgress();
    save();
}

/* =========================
   PROGRESS
========================= */
function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total ? (done / total) * 100 : 0;

    elements.progressText.textContent = Math.round(percent) + "%";

    const offset = 314 - (314 * percent) / 100;
    elements.progressBar.style.strokeDashoffset = offset;
}

/* =========================
   FILTERS
========================= */
document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.filter;

        const result =
            type === "all"
                ? tasks
                : tasks.filter(t => t.category === type);

        renderTasks(result);

        toast(`Filter applied: ${type}`, "info");
    });
});

/* =========================
   SORT
========================= */
document.querySelectorAll("[data-sort]").forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.dataset.sort === "priority") {
            const order = { high: 1, medium: 2, low: 3 };
            tasks.sort((a, b) => order[a.priority] - order[b.priority]);
            toast("Sorted by priority", "info");
        } else {
            tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
            toast("Sorted by due date", "info");
        }

        renderTasks();
    });
});

/* =========================
   CLEAR COMPLETED
========================= */
document.getElementById("clear-completed")
.addEventListener("click", () => {
    const before = tasks.length;

    tasks = tasks.filter(t => !t.completed);

    if (tasks.length === before) {
        toast("No completed tasks to clear", "error");
        return;
    }

    renderTasks();
    toast("Completed tasks cleared", "success");
});

/* =========================
   DARK MODE
========================= */
document.getElementById("dark-mode-toggle")
.addEventListener("click", () => {
    elements.body.classList.toggle("dark");

    const mode = elements.body.classList.contains("dark")
        ? "Dark mode enabled"
        : "Light mode enabled";

    toast(mode, "info");
});

/* =========================
   INIT
========================= */
renderTasks();