const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const category = document.getElementById("category");
const priority = document.getElementById("priority");

function addTask(){
    if(inputBox.value === ''){
        alert("Write something!");
        return;
    }

    let li = document.createElement("li");

   let dueDate = document.getElementById("due-date").value;

li.innerHTML = `
    ${inputBox.value}
    <br><small>${category.value} | Due: ${dueDate || "None"}</small>
`;
    li.classList.add(priority.value);

    let span = document.createElement("span");
    span.innerHTML = "✖";
    li.appendChild(span);

    listContainer.appendChild(li);

    inputBox.value = "";

    saveData();
    updateProgress();
}

listContainer.addEventListener("click", function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
    }
    else if(e.target.tagName === "SPAN"){
        const li = e.target.parentElement;
        li.classList.add("removing");
        li.addEventListener("animationend", () => {
            li.remove();
            saveData();
            updateProgress();
        });
        return; // skip saveData/updateProgress until animation ends
    }

    saveData();
    updateProgress();
});
function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask(){
    listContainer.innerHTML = localStorage.getItem("data") || "";
    updateProgress();
}

showTask();

/* 📊 CIRCULAR PROGRESS */
function updateProgress(){
    let tasks = document.querySelectorAll("li");
    let total = tasks.length;
    let completed = document.querySelectorAll(".checked").length;

    let percent = total === 0 ? 0 : Math.round((completed/total)*100);

    let circle = document.getElementById("progress-circle");
    let text = document.getElementById("circle-text");

    let offset = 314 - (314 * percent) / 100;
    circle.style.strokeDashoffset = offset;

    // color changes with progress
    if(percent < 50) circle.style.stroke = "#ff5945";
    else if(percent < 100) circle.style.stroke = "#ffa500";
    else circle.style.stroke = "#4caf50";

    text.innerText = percent + "%";
}

function checkReminders() {
    let tasks = document.querySelectorAll("li");

    tasks.forEach(task => {
        let match = task.innerText.match(/Due: (\d{4}-\d{2}-\d{2})/);

        if (match) {
            let due = new Date(match[1]);
            let today = new Date();

            if (due.toDateString() === today.toDateString() &&
                !task.classList.contains("checked")) {
                alert("Task due today: " + task.innerText);
            }
        }
    });
}

setInterval(checkReminders, 60000);

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark-mode")
    );
}

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

function askAI() {
    let input = document.getElementById("ai-input");
    let chat = document.getElementById("ai-chat");

    if (input.value.trim() === "") return;

    let userMsg = input.value;

    const userDiv = document.createElement("div");
    userDiv.classList.add("ai-message", "user");
    userDiv.innerText = userMsg;
    chat.appendChild(userDiv);

    let response = getAIResponse(userMsg);

    setTimeout(() => {
        const botDiv = document.createElement("div");
        botDiv.classList.add("ai-message", "bot");
        botDiv.innerText = response;
        chat.appendChild(botDiv);
        chat.scrollTop = chat.scrollHeight;
    }, 500);

    input.value = "";
}

/* 🤖 Simple AI Brain */
function getAIResponse(message) {
    message = message.toLowerCase();

    if (message.includes("hello")) return "Hi! 👋 How can I help?";
    if (message.includes("tasks")) return "You have " + document.querySelectorAll("li").length + " tasks.";
    if (message.includes("completed")) return "You've completed " + document.querySelectorAll(".checked").length + " tasks 🎉";
    if (message.includes("clear")) {
        listContainer.innerHTML = "";
        saveData();
        updateProgress();
        return "All tasks cleared 🧹";
    }

    return "I'm your assistant 🤖 Try asking about tasks, progress, or motivation!";
}

function dailyPlan() {
    let tasks = document.querySelectorAll("li");
    let output = document.getElementById("plan-output");

    if(tasks.length === 0){
        output.innerText = "No tasks yet. Add some!";
        output.classList.add("show");
        return;
    }

    let high = [];
    let medium = [];
    let low = [];

    tasks.forEach(task => {
        if(task.classList.contains("high")) high.push(task.innerText);
        else if(task.classList.contains("medium")) medium.push(task.innerText);
        else low.push(task.innerText);
    });

    output.innerText =
        "🔥 Start with HIGH priority:\n" + high.join("\n") +
        "\n\n⚡ Then MEDIUM:\n" + medium.join("\n") +
        "\n\n🌿 Finish with LOW:\n" + low.join("\n");

    output.classList.remove("show"); // reset animation
    void output.offsetWidth; // trigger reflow
    output.classList.add("show");
}

// Filter tasks by category
function filterTasks(categoryName) {
    const tasks = document.querySelectorAll("li");

    tasks.forEach(task => {
        const taskCategory = task.querySelector("small").innerText.split(" | ")[0];

        if(categoryName === "all" || taskCategory === categoryName){
            task.classList.remove("hide-task");
            task.classList.add("show-task");
        } else {
            task.classList.remove("show-task");
            task.classList.add("hide-task");
        }

        // Remove task from DOM after fadeOut
        task.addEventListener("animationend", () => {
            if(task.classList.contains("hide-task")) task.style.display = "none";
            else task.style.display = "block";
        });
    });
}

// Sort tasks
// Keep track of active filters and sort
let activeCategory = "all";
let activeSort = null;

// Filter tasks by category
function filterTasks(categoryName) {
    activeCategory = categoryName;
    renderTasks();
}

// Sort tasks by type
function sortTasks(type) {
    activeSort = type;
    renderTasks();
}

// Render tasks with current filter & sort applied
function renderTasks() {
    const tasks = Array.from(document.querySelectorAll("li"));

    // Filter by category
    let filtered = tasks.filter(task => {
        const taskCategory = task.querySelector("small").innerText.split(" | ")[0];
        return activeCategory === "all" || taskCategory === activeCategory;
    });

    // Sort filtered tasks
    if (activeSort === "priority") {
        const priorityOrder = {high: 0, medium: 1, low: 2};
        filtered.sort((a, b) => priorityOrder[a.classList[0]] - priorityOrder[b.classList[0]]);
    } else if (activeSort === "due") {
        filtered.sort((a, b) => {
            const dateA = a.querySelector("small").innerText.match(/Due: (\d{4}-\d{2}-\d{2})/);
            const dateB = b.querySelector("small").innerText.match(/Due: (\d{4}-\d{2}-\d{2})/);
            return (dateA ? new Date(dateA[1]) : new Date(0)) - (dateB ? new Date(dateB[1]) : new Date(0));
        });
    }

    // Animate tasks out before reordering
    tasks.forEach(task => {
        task.style.display = "none";
    });

    // Append filtered/sorted tasks
    filtered.forEach(task => {
        task.style.display = "block";
        task.style.animation = "fadeInSlide 0.3s forwards"; // reuse your animation
        listContainer.appendChild(task);
    });
}