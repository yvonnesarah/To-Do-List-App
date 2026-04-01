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

    li.innerHTML = `
        ${inputBox.value}
        <br><small>${category.value}</small>
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