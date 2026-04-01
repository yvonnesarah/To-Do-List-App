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
        e.target.parentElement.remove();
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

    chat.innerHTML += `<div class="ai-message user">${userMsg}</div>`;

    let response = getAIResponse(userMsg);

    setTimeout(() => {
        chat.innerHTML += `<div class="ai-message bot">${response}</div>`;
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
}
