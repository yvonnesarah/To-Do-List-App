const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
function addTask(){
    if(inputBox.value === ''){
        alert("You must write something!");
    }
    else{
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = "&#215";
        li.appendChild(span);
    }
    inputBox.value = "";
    saveData();
    updateProgress();
}

listContainer.addEventListener("click", function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
        saveData();
        updateProgress();
    }
    else if(e.target.tagName === "SPAN"){
        e.target.parentElement.remove();
        saveData();
        updateProgress();
    }
}, false);

function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
}
function showTask(){
    listContainer.innerHTML = localStorage.getItem("data");
    updateProgress();
}
showTask();

function updateProgress() {
    let tasks = listContainer.getElementsByTagName("li");
    let total = tasks.length;
    let completed = 0;

    for (let i = 0; i < total; i++) {
        if (tasks[i].classList.contains("checked")) {
            completed++;
        }
    }

    let percent = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById("progress").style.width = percent + "%";
    document.getElementById("progress-text").innerText =
        `${completed} of ${total} tasks completed`;
}