document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_KEY = 'YOUR_API_KEY'; // IMPORTANT: Paste your Google AI Studio API key here
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    // --- DOM ELEMENTS ---
    const ideaForm = document.getElementById('idea-form');
    const challengeInput = document.getElementById('challenge');
    const generateBtn = document.getElementById('generate-btn');
    const outputSection = document.getElementById('output-section');
    const loader = document.getElementById('loader');
    const ideasList = document.getElementById('ideas-list');
    const savedList = document.getElementById('saved-list');
    
    // --- STATE ---
    let savedIdeas = JSON.parse(localStorage.getItem('savedSparks')) || [];

    // --- FUNCTIONS ---

    /**
     * Generates a prompt for the AI model.
     * @param {string} challenge The user's input challenge.
     * @returns {string} The formatted prompt.
     */
    const createPrompt = (challenge) => {
        return `
        You are an expert in Edge AI, IoT, and low-power devices. 
        Your task is to brainstorm innovative, concise, and actionable ideas.
        For the challenge "${challenge}", generate exactly 3 distinct project ideas.
        Each idea must be a single, compelling sentence.
        Format your response as a numbered list, like this:
        1. [First idea here]
        2. [Second idea here]
        3. [Third idea here]
        `;
    };

    /**
     * Fetches ideas from the Generative AI API.
     * @param {string} challenge The user's input.
     */
    const generateIdeasWithAI = async (challenge) => {
        setLoading(true);
        ideasList.innerHTML = '';
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });

        try {
            const prompt = createPrompt(challenge);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            if (!response.ok) {
                throw new Error(`API error! Status: ${response.status}`);
            }

            const data = await response.json();
            const ideasText = data.candidates[0].content.parts[0].text;
            const parsedIdeas = ideasText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line);
            
            displayGeneratedIdeas(parsedIdeas);

        } catch (error) {
            console.error("Error fetching AI ideas:", error);
            ideasList.innerHTML = `<p style="color: #e53e3e;">Failed to generate ideas. Please check your API key or try again later.</p>`;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Controls the visibility of the loading spinner and button state.
     * @param {boolean} isLoading True to show loader, false to hide.
     */
    const setLoading = (isLoading) => {
        loader.style.display = isLoading ? 'flex' : 'none';
        generateBtn.disabled = isLoading;
        generateBtn.innerHTML = isLoading ? '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...' : '<i class="fa-solid fa-lightbulb"></i> Spark Ideas!';
    };

    /**
     * Creates an HTML element for an idea (either generated or saved).
     * @param {object} idea - The idea object containing id and text.
     * @param {string} type - 'generated' or 'saved'.
     * @returns {HTMLElement} The created list item element.
     */
    const createIdeaElement = (idea, type) => {
        const li = document.createElement(type === 'saved' ? 'li' : 'div');
        li.className = 'idea-item';
        li.dataset.id = idea.id;

        const p = document.createElement('p');
        p.textContent = idea.text;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'idea-actions';

        if (type === 'generated') {
            actionsDiv.innerHTML = `
                <button class="save-btn" title="Save Idea"><i class="fa-solid fa-save"></i></button>
                <button class="copy-btn" title="Copy Idea"><i class="fa-solid fa-copy"></i></button>
            `;
        } else { // 'saved'
             actionsDiv.innerHTML = `
                <button class="copy-btn" title="Copy Idea"><i class="fa-solid fa-copy"></i></button>
                <button class="delete-btn" title="Delete Idea"><i class="fa-solid fa-trash"></i></button>
            `;
        }
        
        li.appendChild(p);
        li.appendChild(actionsDiv);
        return li;
    };
    
    /**
     * Renders the AI-generated ideas to the DOM.
     * @param {string[]} ideas - An array of idea strings.
     */
    const displayGeneratedIdeas = (ideas) => {
        ideasList.innerHTML = '';
        ideas.forEach(text => {
            const idea = { id: Date.now() + Math.random(), text }; // unique temp ID
            const ideaElement = createIdeaElement(idea, 'generated');
            ideasList.appendChild(ideaElement);
        });
    };
    
    /**
     * Renders the saved ideas from localStorage to the DOM.
     */
    const renderSavedIdeas = () => {
        savedList.innerHTML = '';
        if (savedIdeas.length === 0) {
            savedList.innerHTML = '<li>No ideas saved yet. Spark some and save your favorites!</li>';
        } else {
            savedIdeas.forEach(idea => {
                const ideaElement = createIdeaElement(idea, 'saved');
                savedList.appendChild(ideaElement);
            });
        }
    };
    
    /**
     * Saves a single idea to localStorage and re-renders the saved list.
     * @param {string} ideaText - The text of the idea to save.
     */
    const saveIdea = (ideaText) => {
        if (savedIdeas.some(idea => idea.text === ideaText)) {
            alert("This idea is already saved!");
            return;
        }
        const newIdea = { id: Date.now(), text: ideaText };
        savedIdeas.push(newIdea);
        localStorage.setItem('savedSparks', JSON.stringify(savedIdeas));
        renderSavedIdeas();
    };

    /**
     * Deletes an idea from localStorage and re-renders the saved list.
     * @param {number} id - The ID of the idea to delete.
     */
    const deleteIdea = (id) => {
        savedIdeas = savedIdeas.filter(idea => idea.id !== id);
        localStorage.setItem('savedSparks', JSON.stringify(savedIdeas));
        renderSavedIdeas();
    };
    
    /**
     * Copies text to the user's clipboard.
     * @param {string} text The text to copy.
     * @param {HTMLElement} button The button that was clicked.
     */
    const copyToClipboard = (text, button) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check"></i>';
            button.style.color = 'var(--success-color)';
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.color = '';
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert("Failed to copy text.");
        });
    };

    // --- EVENT LISTENERS ---
    ideaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const challenge = challengeInput.value.trim();
        if (challenge) {
            generateIdeasWithAI(challenge);
        }
    });

    // Event delegation for dynamically created buttons
    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const ideaItem = button.closest('.idea-item');
        if (!ideaItem) return;

        const ideaText = ideaItem.querySelector('p').textContent;
        const ideaId = Number(ideaItem.dataset.id);

        if (button.classList.contains('save-btn')) {
            saveIdea(ideaText);
            button.innerHTML = '<i class="fa-solid fa-check"></i>';
            button.disabled = true;
        }
        if (button.classList.contains('copy-btn')) {
            copyToClipboard(ideaText, button);
        }
        if (button.classList.contains('delete-btn')) {
            deleteIdea(ideaId);
        }
    });
    
    // --- INITIALIZATION ---
    renderSavedIdeas();
});