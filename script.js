const ideasTemplates = [
    "Build an ESP32 sensor that uses offline AI to {action} based on {challenge}. Low-power for real-world entrepreneurship!",
    "EdgeAI prototype: A {device} app predicting {challenge} outcomes with Grok-like smarts—prototype in a weekend!",
    "Innovate with MIB spirit: {challenge} solver via embedded chat, caching responses for zero-latency ideas."
];
const actions = ['monitor', 'optimize', 'alert on', 'automate'];
const devices = ['wearable', 'IoT hub', 'mobile addon'];

document.getElementById('idea-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const challenge = document.getElementById('challenge').value.toLowerCase();
    const output = document.getElementById('output');
    const ideasList = document.getElementById('ideas-list');
    ideasList.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const template = ideasTemplates[Math.floor(Math.random() * ideasTemplates.length)];
        const idea = template.replace('{challenge}', challenge).replace('{action}', actions[Math.floor(Math.random() * actions.length)]).replace('{device}', devices[Math.floor(Math.random() * devices.length)]);
        const li = document.createElement('li');
        li.textContent = idea;
        ideasList.appendChild(li);
    }
    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth' });
});

function saveIdea() {
    const ideas = document.querySelectorAll('#ideas-list li');
    let saved = JSON.parse(localStorage.getItem('savedSparks') || '[]');
    ideas.forEach(li => saved.push(li.textContent));
    localStorage.setItem('savedSparks', JSON.stringify(saved));
    loadSaved();
    alert('Idea saved locally! Refresh to see.');
}

function exportCard() {
    const ideas = Array.from(document.querySelectorAll('#ideas-list li')).map(li => li.textContent).join('\n');
    const card = `EdgeAI Spark for: ${document.getElementById('challenge').value}\n\n${ideas}\n\n#MIBInnovation`;
    alert('Copy this for sharing:\n' + card);  // In a real app, could generate a downloadable PNG via canvas.
}

function loadSaved() {
    const saved = JSON.parse(localStorage.getItem('savedSparks') || '[]');
    const list = document.getElementById('saved-list');
    list.innerHTML = '';
    saved.forEach(idea => {
        const li = document.createElement('li');
        li.textContent = idea;
        list.appendChild(li);
    });
}
loadSaved();  // Load on start