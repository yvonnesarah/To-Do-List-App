/* =========================
   DOM ELEMENTS CACHE
   (Store frequently used DOM elements)
========================= */
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

/* =========================
   LOAD TASKS FROM STORAGE
   (Initialize app state from localStorage)
========================= */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* =========================
   CONFETTI ANIMATION (TASK COMPLETE)
   (Visual feedback for task completion)
========================= */
function launchConfetti() {
    const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    for (let i = 0; i < 25; i++) {
        const confetti = document.createElement("div");

        // Style each confetti particle
        confetti.style.position = "fixed";
        confetti.style.width = "8px";
        confetti.style.height = "8px";
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.top = "-10px";
        confetti.style.opacity = "1";
        confetti.style.borderRadius = "2px";
        confetti.style.zIndex = "9999";

        document.body.appendChild(confetti);

        // Animate falling effect
        const fall = confetti.animate(
            [
                { transform: "translateY(0)", opacity: 1 },
                { transform: `translateY(${window.innerHeight}px)`, opacity: 0 }
            ],
            {
                duration: 1000 + Math.random() * 800,
                easing: "ease-out"
            }
        );

        // Remove element after animation ends
        fall.onfinish = () => confetti.remove();
    }
}

/* =========================
   TOAST NOTIFICATIONS SYSTEM
   (Show success/error/info messages)
========================= */
function toast(message, type = "info", action = null) {
    const t = document.getElementById("toast");

    t.className = "";
    t.classList.add("show", type);

    t.innerHTML = `
        <span>${message}</span>
        ${action ? `<button id="toast-action">${action.text}</button>` : ""}
    `;

    // Optional action button inside toast (e.g. confirm delete)
    if (action) {
        setTimeout(() => {
            document.getElementById("toast-action")
                ?.addEventListener("click", () => {
                    action.onClick();
                    t.classList.remove("show");
                });
        }, 0);
    }

    // Auto-hide toast after delay
    clearTimeout(t.timer);
    t.timer = setTimeout(() => {
        t.classList.remove("show");
    }, action ? 4000 : 2500);
}

/* =========================
   SAVE TO LOCAL STORAGE
   LOCAL STORAGE PERSISTENCE
   (Save application state)
========================= */
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   ADD NEW TASK
   (Create and validate task input)
========================= */
function addTask() {
    const value = elements.input.value.trim();

    // Prevent empty task creation
    if (!value) {
        toast("Please enter a task", "error");
        return;
    }

    // Create and store new task object
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

/* =========================
   EVENT LISTENERS: TASK CREATION
   (Button click + keyboard shortcut)
========================= */

// Add task via button click
document.getElementById("add-task-btn").addEventListener("click", addTask);

// Add task via Enter key
elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});

/* =========================
   TOGGLE TASK COMPLETION
   (Mark tasks done/undone)
========================= */

function toggleTask(id) {
    let wasCompleted = false;

    // Flip completion state for selected task
    tasks = tasks.map(t => {
        if (t.id === id) {
            wasCompleted = !t.completed;
            return { ...t, completed: !t.completed };
        }
        return t;
    });

    renderTasks();

    // Feedback depending on new state
    if (wasCompleted) {
        launchConfetti(); // celebrate completion
        toast("Task completed 🎉", "success");
    } else {
        toast("Task marked as pending", "info");
    }
}

/* =========================
   DELETE TASK
   (Remove task with confirmation)
========================= */
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Confirm delete using toast action button
    toast("Delete this task?", "warning", {
        text: "Delete",
        onClick: () => {
            const el = document.querySelector(`li[data-id="${id}"]`);

            // Animate removal if element exists in DOM
            if (el) {
                el.style.animation = "fadeOut 0.3s forwards";

                setTimeout(() => {
                    tasks = tasks.filter(t => t.id !== id);
                    renderTasks();
                    toast("Task deleted", "success");
                }, 300);
            } else {
                tasks = tasks.filter(t => t.id !== id);
                renderTasks();
                toast("Task deleted", "success");
            }
        }
    });
}

/* =========================
    EDIT TASK
   (Update task text)
========================= */
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    // Prompt user for new task text
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
    PIN / UNPIN TASKS
   (Prioritize important tasks)
========================= */
function togglePin(id) {
    // Toggle pinned state
    tasks = tasks.map(t =>
        t.id === id ? { ...t, pinned: !t.pinned } : t
    );

    // Ensure pinned tasks stay at top
    tasks.sort((a, b) => b.pinned - a.pinned);

    renderTasks();
    toast("Pin updated", "info");
}

/* =========================
   SUBTASK MANAGEMENT SYSTEM
   (Nested task support)
========================= */
function addSubtask(taskId) {
    const text = prompt("Subtask:");

    if (!text) {
        toast("Subtask cancelled", "error");
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    task.subtasks.push({ text });

    renderTasks();
    toast("Subtask added", "success");
}

function editSubtask(taskId, index) {
    const task = tasks.find(t => t.id === taskId);

    if (!task || !task.subtasks[index]) return;

    const newText = prompt("Edit subtask:", task.subtasks[index].text);

    if (!newText || !newText.trim()) {
        toast("Edit cancelled", "error");
        return;
    }

    task.subtasks[index].text = newText.trim();

    renderTasks();
    toast("Subtask updated", "success");
}

function deleteSubtask(taskId, index) {
    const task = tasks.find(t => t.id === taskId);

    if (!task || !task.subtasks[index]) return;

    toast("Delete this subtask?", "warning", {
        text: "Delete",
        onClick: () => {
            task.subtasks.splice(index, 1);
            renderTasks();
            toast("Subtask deleted", "success");
        }
    });
}

/* =========================
 SEARCH TASKS
   (Filter by text/category)
========================= */
elements.search.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    // Filter tasks by text or category match
    const filtered = tasks.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    renderTasks(filtered);
});

/* =========================
   DRAG & DROP REORDERING
   (Change task order visually)
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

            // Move task in array
            const moved = tasks.splice(from, 1)[0];
            tasks.splice(to, 0, moved);

            renderTasks();
            toast("Tasks reordered", "info");
        });
    });
}

/* =========================
     DATE FORMATTING UTILITY
    (User-friendly date display)
========================= */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

/* =========================
    RENDER TASK LIST UI
   (Main UI update function)
========================= */
function renderTasks(data = tasks) {
    elements.list.innerHTML = "";

    // Empty state UI
    if (data.length === 0) {
        elements.list.innerHTML =
            `<div class="empty-state">No tasks yet — add one above ✨</div>`;
        updateStats();
        return;
    }

    data.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("task-animate");
        li.dataset.id = task.id;

        // Apply visual states (completed, priority, pinned)
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

       ${(task.subtasks && task.subtasks.length > 0) ? `
    <h4 class="subtasks-title">Sub-Tasks</h4>
    <ul class="subtasks">
        ${task.subtasks.map((s, i) => `
            <li>
                <span>${s.text}</span>
                <div>
                    <button onclick="editSubtask(${task.id}, ${i})">✏️</button>
                    <button onclick="deleteSubtask(${task.id}, ${i})">❌</button>
                </div>
            </li>
        `).join("")}
    </ul>
` : `
    <h4 class="subtasks-title">Sub-Tasks</h4>
    <p class="empty-subtasks">No subtasks yet</p>
`}
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
   PROGRESS TRACKING
   (Completion percentage animation)
========================= */
function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total ? (done / total) * 100 : 0;

    elements.progressText.textContent = Math.round(percent) + "%";

    const targetOffset = 314 - (314 * percent) / 100;

    // Animate progress bar smoothly
    const startOffset = parseFloat(elements.progressBar.style.strokeDashoffset || 314);
    const diff = targetOffset - startOffset;
    const duration = 500;
    const startTime = performance.now();

    function animate(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const current = startOffset + diff * progress;

        elements.progressBar.style.strokeDashoffset = current;

        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

/* =========================
     TASK STATISTICS PANEL
     (Total / completed / pending)
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
   FILTER TASKS
   (By category)
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
   SORT TASKS
   (By priority or date)
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
    CLEAR COMPLETED TASKS
   (Bulk delete completed items)
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
   DARK MODE TOGGLE
   (Persisted theme setting)
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
     WEEKLY SUMMARY REPORT
   (Quick analytics popup)
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
    INITIAL RENDER
   (Bootstraps application UI)
========================= */
renderTasks();