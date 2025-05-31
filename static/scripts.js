document.getElementById('uploadForm').onsubmit = async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (response.ok) {
        const fileActions = document.getElementById('fileActions');
        fileActions.style.display = 'block';

        const filesList = document.querySelector('.nav.flex-column');
        result.filenames.forEach(filename => {
            const newFileItem = document.createElement('li');
            newFileItem.className = 'nav-item';
            newFileItem.innerHTML = `
                <a class="nav-link active" href="#">${filename}</a>
                <button class="btn btn-success btn-sm" id="runBtn-${filename}" onclick="runFile('${encodeURIComponent(filename)}', this)">Run</button>
                <button class="btn btn-danger btn-sm ml-2" onclick="deleteFile('${encodeURIComponent(filename)}')">Delete</button>
            `;
            filesList.appendChild(newFileItem);
        });
    } else {
        alert(result.error);
    }
};

async function runFile(filename, button) {
    const response = await fetch(`/run/${filename}`, { method: 'POST' });
    const result = await response.json();

    if (response.ok) {
        button.classList.remove('btn-success');
        button.classList.add('btn-warning'); 
        button.innerText = 'Running';
        showStatusMessage(`${filename} is running...`);
    } else {
        alert(result.error);
    }
}

async function stopFile(filename) {
    const response = await fetch(`/stop/${filename}`, { method: 'POST' });
    const result = await response.json();
    
    if (response.ok) {
        const button = document.getElementById(`runBtn-${filename}`);
        button.classList.remove('btn-warning'); 
        button.classList.add('btn-success');
        button.innerText = 'Run';
        showStatusMessage(`${filename} has been stopped.`);
    } else {
        alert(result.error);
    }
}

async function deleteFile(filename) {
    await stopFile(filename); 
    const response = await fetch(`/delete/${filename}`, { method: 'POST' });
    const result = await response.json();
    alert(result.message || result.error);

    const filesList = document.querySelector('.nav.flex-column');
    filesList.innerHTML = ''; 
    location.reload(); 
}

async function runTerminalCommand() {
    const commandInput = document.getElementById('terminalInput');
    const command = commandInput.value.trim();
    if (!command) {
        alert('Please enter a command to run.'); 
        return;
    }
    
    const formData = new FormData();
    formData.append('command', command);
    const response = await fetch('/terminal', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    displayOutput(result);
}

function displayOutput(result) {
    const output = document.getElementById('output');
    output.textContent = `Output:\n${result.stdout}\n\nErrors:\n${result.stderr}`;
}

function showStatusMessage(message) {
    const statusBar = document.getElementById('statusBar');
    statusBar.innerText = message;
    statusBar.style.display = 'block';
    setTimeout(() => {
        statusBar.style.display = 'none';
    }, 3000);
}