let processes = [];
let currentTime = 0;
let runningProcess = null;
let readyQueue = [];
let completedProcesses = [];
let isScheduling = false;
let stepMode = false;

document.getElementById('randomProcessBtn').addEventListener('click', generateRandomProcess);
document.getElementById('startBtn').addEventListener('click', startScheduling);
document.getElementById('resetBtn').addEventListener('click', reset);
document.getElementById('schedulerSelect').addEventListener('change', updateSchedulerInputs);
document.getElementById('stepBtn').addEventListener('click', handleStep);

function generateRandomProcess() {
const randomName = `P${processes.length + 1}`;
const randomArrival = Math.floor(Math.random() * 10);
const randomBurst = Math.floor(Math.random() * 10) + 1;
const randomPriority = Math.floor(Math.random() * 10) + 1;
addProcess(randomName, randomArrival, randomBurst, randomPriority);
}

function addProcess(name, arrivalTime, burstTime, priority = 0) {
processes.push({name, arrivalTime, burstTime, priority, remainingTime: burstTime});
updateProcessTable();
}

function updateProcessTable() {
const processTableBody = document.getElementById('processTableBody');
processTableBody.innerHTML = '';
processes.forEach(p => {
   const row = `<tr>
                 <td>${p.name}</td>
                 <td>${p.arrivalTime}</td>
                 <td>${p.burstTime}</td>
                 <td>${p.priority}</td>
               </tr>`;
   processTableBody.innerHTML += row;
});
}

function updateSchedulerInputs() {
const schedulerType = document.getElementById('schedulerSelect').value;
const timeQuantumInput = document.getElementById('timeQuantumInput');
const priorityInput = document.getElementById('priorityInput');

timeQuantumInput.style.display = schedulerType === 'rr' ? 'block' : 'none';
priorityInput.style.display = schedulerType === 'priority' ? 'block' : 'none';
}

async function startScheduling() {
if (isScheduling) return;
isScheduling = true;
stepMode = false;
currentTime = 0;
runningProcess = null;
readyQueue = [];
completedProcesses = [];

const schedulerType = document.getElementById('schedulerSelect').value;

while (processes.length > 0 || readyQueue.length > 0 || runningProcess) {
   updateReadyQueue();
   
   switch (schedulerType) {
       case 'fcfs':
           await fcfsStep();
           break;
       case 'sjf':
           await sjfStep();
           break;
       case 'priority':
           await priorityStep();
           break;
       case 'rr':
           const timeQuantum = parseInt(document.getElementById('timeQuantumInput').value);
           await rrStep(timeQuantum);
           break;
   }
   
   await visualizeStep();
   if (stepMode) {
       await waitForStep();
   } else {
       await sleep(3000); // Adjust this value to control visualization speed
   }
}

isScheduling = false;
alert('Scheduling completed');
}

function updateReadyQueue() {
const arrivedProcesses = processes.filter(p => p.arrivalTime <= currentTime);
readyQueue.push(...arrivedProcesses);
processes = processes.filter(p => p.arrivalTime > currentTime);
}

async function fcfsStep() {
if (!runningProcess && readyQueue.length > 0) {
   runningProcess = readyQueue.shift();
}

if (runningProcess) {
   runningProcess.remainingTime--;
   if (runningProcess.remainingTime === 0) {
       completedProcesses.push(runningProcess);
       runningProcess = null;
   }
}

currentTime++;
}

async function sjfStep() {
if (!runningProcess && readyQueue.length > 0) {
   readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
   runningProcess = readyQueue.shift();
}

if (runningProcess) {
   runningProcess.remainingTime--;
   if (runningProcess.remainingTime === 0) {
       completedProcesses.push(runningProcess);
       runningProcess = null;
   }
}

currentTime++;
}

async function priorityStep() {
if (!runningProcess && readyQueue.length > 0) {
   readyQueue.sort((a, b) => a.priority - b.priority);
   runningProcess = readyQueue.shift();
}

if (runningProcess) {
   runningProcess.remainingTime--;
   if (runningProcess.remainingTime === 0) {
       completedProcesses.push(runningProcess);
       runningProcess = null;
   }
}

currentTime++;
}

async function rrStep(timeQuantum) {
if (!runningProcess && readyQueue.length > 0) {
   runningProcess = readyQueue.shift();
}

if (runningProcess) {
   const executionTime = Math.min(timeQuantum, runningProcess.remainingTime);
   runningProcess.remainingTime -= executionTime;
   currentTime += executionTime;
   
   if (runningProcess.remainingTime === 0) {
       completedProcesses.push(runningProcess);
       runningProcess = null;
   } else {
       readyQueue.push(runningProcess);
       runningProcess = null;
   }
} else {
   currentTime++;
}
}

async function visualizeStep() {
const ganttChart = document.getElementById('ganttChart');
const statusInfo = document.getElementById('statusInfo');

// Update Gantt Chart
if (runningProcess) {
   const processBar = document.createElement('div');
   processBar.className = 'process-bar';
   processBar.style.backgroundColor = getProcessColor(runningProcess.name);
   processBar.textContent = runningProcess.name;
   ganttChart.appendChild(processBar);
} else {
   const idleBar = document.createElement('div');
   idleBar.className = 'idle-bar';
   idleBar.textContent = 'Idle';
   ganttChart.appendChild(idleBar);
}

// Update Status Information
statusInfo.innerHTML = `
   <p>Current Time: ${currentTime}</p>
   <p>Running Process: ${runningProcess ? runningProcess.name : 'None'}</p>
   <p>Ready Queue: ${readyQueue.map(p => p.name).join(', ')}</p>
   <p>Completed Processes: ${completedProcesses.map(p => p.name).join(', ')}</p>
`;
}

function getProcessColor(processName) {
const colors = ['#FF6F91', '#FF9671', '#FFC75F', '#F9F871', '#D65DB1', '#845EC2', '#00C9A7', '#4D8076'];
const index = parseInt(processName.replace('P', '')) % colors.length;
return colors[index];
}

function handleStep() {
stepMode = true;
if (!isScheduling) {
   startScheduling();
} else {
   stepMode = false;
}
}

function waitForStep() {
return new Promise(resolve => {
   const stepInterval = setInterval(() => {
       if (!stepMode) {
           clearInterval(stepInterval);
           resolve();
       }
   }, 100);
});
}

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

function reset() {
processes = [];
currentTime = 0;
runningProcess = null;
readyQueue = [];
completedProcesses = [];
isScheduling = false;
stepMode = false;
updateProcessTable();
document.getElementById('ganttChart').innerHTML = '';
document.getElementById('statusInfo').innerHTML = '';
}

// Initialize with some random processes
for (let i = 0; i < 5; i++) {
generateRandomProcess();
}
