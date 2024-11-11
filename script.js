let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let historyTasks = JSON.parse(localStorage.getItem('historyTasks')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { Charm: 0, Strength: 0, Stamina: 0, Faith: 0, Agility: 0 };
let exp = parseInt(localStorage.getItem('exp')) || 0;
let level = parseInt(localStorage.getItem('level')) || 1;
let freePoint = parseInt(localStorage.getItem('freePoint')) || 0;
let maxExp = 100;
let tempStatRewards = [];

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab[onclick="openTab('${tabName}')"]`).classList.add('active');
}

function addStatReward() {
    const statSelect = document.querySelector('.task-stat-select').value;
    const statValue = parseFloat(document.querySelector('.task-stat-reward').value);
    if (statSelect && statValue) {
        tempStatRewards.push({ statType: statSelect, statReward: statValue });
        alert(`${statSelect} reward of ${statValue} added.`);
    }
}

function addTask() {
    const title = document.getElementById('taskTitle').value;
    const detail = document.getElementById('taskDetail').value;
    const expReward = parseInt(document.getElementById('taskExpReward').value);
    if (title && detail && expReward) {
        tasks.push({ title, detail, expReward, statRewards: tempStatRewards, completed: false });
        tempStatRewards = [];
        saveData();
        renderTasks();
        toggleAddTaskForm();
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.innerHTML = `
            <span>${task.title}</span>
            <button onclick="toggleComplete(${index})">${task.completed ? '✅' : '☑️'}</button>
            <div class="task-rewards">
                ${task.statRewards.map(reward => `<p>${reward.statType} +${reward.statReward}</p>`).join('')}
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

function toggleComplete(index) {
    const task = tasks[index];
    task.completed = !task.completed;
    if (task.completed) {
        exp += task.expReward;
        task.statRewards.forEach(reward => stats[reward.statType] += reward.statReward);
        historyTasks.push(task);
        tasks.splice(index, 1);
    }
    updateLevelAndExp();
    saveData();
    renderTasks();
    renderHistory();
    renderStats();  // Update stats display
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    historyTasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.innerHTML = `
            <span>${task.title}</span>
            <button class="details-button">Details</button>
        `;
        taskElement.querySelector('.details-button').addEventListener('click', () => {
            showHistoryDetails(task);
        });
        historyList.appendChild(taskElement);
    });
}

function showHistoryDetails(task) {
    const rewardsText = task.statRewards.map(reward => `${reward.statType} +${reward.statReward}`).join('\n');
    alert(`Title: ${task.title}\nDetail: ${task.detail}\nExp Reward: ${task.expReward}\nStat Rewards:\n${rewardsText}`);
}

function updateLevelAndExp() {
    while (exp >= maxExp) {
        exp -= maxExp;
        level += 1;
        maxExp += 100;
        freePoint += 1;  // Tambahkan Point Bebas tiap naik level
    }
    document.getElementById('level').innerText = level;
    document.getElementById('exp').innerText = exp;
    document.getElementById('maxExp').innerText = maxExp;
    document.getElementById('freePoint').innerText = freePoint;  // Tampilkan Point Bebas
}

function renderStats() {
    Object.keys(stats).forEach(stat => {
        document.getElementById(stat).innerText = stats[stat];
    });
}

function toggleAddTaskForm() {
    const form = document.querySelector('.add-task-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function resetSystem() {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
        tasks = [];
        historyTasks = [];
        stats = { Charm: 0, Strength: 0, Stamina: 0, Faith: 0, Agility: 0 };
        exp = 0;
        level = 1;
        freePoint = 0;
        maxExp = 100;
        saveData();
        renderTasks();
        renderHistory();
        renderStats();
        updateLevelAndExp();
    }
}

function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('historyTasks', JSON.stringify(historyTasks));
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('exp', exp.toString());
    localStorage.setItem('level', level.toString());
    localStorage.setItem('freePoint', freePoint.toString());
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    renderHistory();
    renderStats();
    updateLevelAndExp();
});

function useFreePoint() {
    if (freePoint > 0) {
        const statToAdd = prompt("Tambahkan Point Bebas ke (Charm, Strength, Stamina, Faith, Agility):");
        if (stats.hasOwnProperty(statToAdd)) {
            stats[statToAdd] += 1;
            freePoint -= 1;
            renderStats();
            document.getElementById('freePoint').innerText = freePoint;
            saveData();
        } else {
            alert("Stat tidak valid. Coba lagi.");
        }
    } else {
        alert("Point Bebas tidak cukup!");
    }
}
