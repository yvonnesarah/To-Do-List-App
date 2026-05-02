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
   TOAST
========================= */
function toast(message, type = "info") {
    const t = document.getElementById("toast");

    t.className = "";
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
   ADD TASK (NO SMART DEFAULTS)
========================= */
function addTask() {
    const value = elements.input.value.trim();

    if (!value) {
        toast("Please enter a task", "error");
        return;
    }

    tasks.push({
        id: Date.now(),
        text: value,
        date: elements.date.value,
        category: elements.category.value,
        priority: elements.priority.value,
        completed: false,
        subtasks: [],
        pinned: false
    });

    elements.input.value = "";
    renderTasks();

    toast("Task added successfully", "success");
}

document.getElementById("add-task-btn").addEventListener("click", addTask);

elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});

/* =========================
   TOGGLE TASK
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
    if (!confirm("Delete task?")) return;

    tasks = tasks.filter(t => t.id !== id);
    renderTasks();

    toast("Task deleted", "success");
}

/* =========================
   EDIT TASK
========================= */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
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
   PIN TASK
========================= */
function togglePin(id) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, pinned: !t.pinned } : t
    );

    tasks.sort((a, b) => b.pinned - a.pinned);
    renderTasks();

    toast("Pin updated", "info");
}

/* =========================
   SUBTASKS
========================= */
function addSubtask(taskId) {
    const text = prompt("Subtask:");

    if (!text) {
        toast("Subtask cancelled", "error");
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    task.subtasks.push({ text, done: false });

    renderTasks();
    toast("Subtask added", "success");
}

function toggleSubtask(taskId, index) {
    const task = tasks.find(t => t.id === taskId);
    task.subtasks[index].done = !task.subtasks[index].done;

    renderTasks();
    toast("Subtask updated", "info");
}

/* =========================
   SEARCH
========================= */
elements.search.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    const filtered = tasks.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    renderTasks(filtered);
});

/* =========================
   DRAG & DROP
========================= */
let draggedId = null;

function enableDrag() {
    document.querySelectorAll("#task-list li").forEach(li => {

        li.draggable = true;

        li.addEventListener("dragstart", () => {
            draggedId = Number(li.dataset.id);
        });

        li.addEventListener("dragover", e => e.preventDefault());

        li.addEventListener("drop", () => {
            const targetId = Number(li.dataset.id);

            const from = tasks.findIndex(t => t.id === draggedId);
            const to = tasks.findIndex(t => t.id === targetId);

            const moved = tasks.splice(from, 1)[0];
            tasks.splice(to, 0, moved);

            renderTasks();
            toast("Tasks reordered", "info");
        });
    });
}

/* =========================
   FORMAT DATE
========================= */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

/* =========================
   RENDER
========================= */
function renderTasks(data = tasks) {
    elements.list.innerHTML = "";

    if (data.length === 0) {
        elements.list.innerHTML =
            `<div class="empty-state">No tasks yet — add one above ✨</div>`;
        updateStats();
        return;
    }

    data.forEach(task => {
        const li = document.createElement("li");

        li.dataset.id = task.id;

        li.className = `
            ${task.completed ? "completed" : ""}
            ${task.priority}
            ${task.pinned ? "pinned" : ""}
        `;

        li.innerHTML = `
        <label>
            <input type="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})">

            <strong>${task.text}</strong><br>
          <small>
                📂 ${task.category}
                ${task.date ? ` | 📅 ${formatDate(task.date)}` : ""}
            </small>
        </label>

        <ul class="subtasks">
            ${(task.subtasks || []).map((s, i) => `
                <li>
                    <input type="checkbox"
                        ${s.done ? "checked" : ""}
                        onchange="toggleSubtask(${task.id}, ${i})">
                    ${s.text}
                </li>
            `).join("")}
        </ul>

        <div>
            <button onclick="togglePin(${task.id})">📌</button>
            <button onclick="addSubtask(${task.id})">➕</button>
            <button onclick="editTask(${task.id})">✏️</button>
            <button onclick="deleteTask(${task.id})">❌</button>
        </div>
        `;

        elements.list.appendChild(li);
    });

    enableDrag();
    updateProgress();
    updateStats();
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
   STATS
========================= */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("pending-tasks").textContent =
        total - completed;
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
        toast(`Filter: ${type}`, "info");
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
            toast("Sorted by date", "info");
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

    renderTasks();

    toast(
        tasks.length === before
            ? "No completed tasks"
            : "Completed cleared",
        "success"
    );
});

/* =========================
   DARK MODE
========================= */
if (localStorage.getItem("darkMode") === "true") {
    elements.body.classList.add("dark");
}

document.getElementById("dark-mode-toggle")
.addEventListener("click", () => {
    elements.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        elements.body.classList.contains("dark")
    );

    toast(
        elements.body.classList.contains("dark")
            ? "Dark mode enabled"
            : "Light mode enabled",
        "info"
    );
});

/* =========================
   WEEKLY SUMMARY
========================= */
document.getElementById("weekly-summary")
.addEventListener("click", () => {
    const done = tasks.filter(t => t.completed).length;
    const total = tasks.length;

    alert(
        `📊 Weekly Summary\n\n` +
        `Total: ${total}\n` +
        `Completed: ${done}\n` +
        `Progress: ${Math.round((done / total) * 100) || 0}%`
    );
});

/* =========================
   INIT
========================= */
renderTasks();