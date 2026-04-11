const DOM = {
    cameraInput: document.getElementById('camera-input'),
    preview: document.getElementById('image-preview'),
    placeholder: document.getElementById('camera-placeholder'),
    contextInput: document.getElementById('context-input'),
    analyzeBtn: document.getElementById('analyze-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loader-text'),
    resultsCard: document.getElementById('results-card'),
    commitBtn: document.getElementById('commit-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    
    // Inputs
    geminiKey: document.getElementById('gemini-key'),
    githubPat: document.getElementById('github-pat'),
    githubRepo: document.getElementById('github-repo'),

    // Result values
    resConfidence: document.getElementById('res-confidence'),
    resFoodItems: document.getElementById('res-food-items'),
    resCals: document.getElementById('res-cals'),
    resPro: document.getElementById('res-pro'),
    resCarb: document.getElementById('res-carb'),
    resFat: document.getElementById('res-fat'),
};

let currentBase64Images = [];
let currentMacros = null;

// Initialization
function init() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW setup failed', err));
    }

    DOM.geminiKey.value = localStorage.getItem('ml_gemini_key') || '';
    DOM.githubPat.value = localStorage.getItem('ml_github_pat') || '';
    DOM.githubRepo.value = localStorage.getItem('ml_github_repo') || 'dkaszas/withings';
    
    if (!DOM.geminiKey.value || !DOM.githubPat.value) {
        DOM.settingsModal.classList.remove('hidden');
    }
}

// Event Listeners
DOM.settingsBtn.addEventListener('click', () => DOM.settingsModal.classList.remove('hidden'));
DOM.closeSettingsBtn.addEventListener('click', () => DOM.settingsModal.classList.add('hidden'));
DOM.saveSettingsBtn.addEventListener('click', () => {
    localStorage.setItem('ml_gemini_key', DOM.geminiKey.value.trim());
    localStorage.setItem('ml_github_pat', DOM.githubPat.value.trim());
    localStorage.setItem('ml_github_repo', DOM.githubRepo.value.trim());
    DOM.settingsModal.classList.add('hidden');
});

function updateAnalyzeButtonState() {
    const hasImages = currentBase64Images && currentBase64Images.length > 0;
    const hasText = DOM.contextInput.value.trim().length > 0;
    DOM.analyzeBtn.disabled = !(hasImages || hasText);
}

DOM.contextInput.addEventListener('input', updateAnalyzeButtonState);

DOM.cameraInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        currentBase64Images = [];
        
        for (let file of files) {
            const b64 = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            currentBase64Images.push(b64);
        }
        
        DOM.preview.src = currentBase64Images[0];
        DOM.preview.style.display = 'block';
        DOM.placeholder.style.display = 'none';
        
        const badge = document.getElementById('image-count-badge');
        if (currentBase64Images.length > 1) {
            badge.textContent = `${currentBase64Images.length} Images`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
        
        updateAnalyzeButtonState();
    }
});

DOM.cancelBtn.addEventListener('click', resetView);

DOM.analyzeBtn.addEventListener('click', analyzeMeal);
DOM.commitBtn.addEventListener('click', saveToDashboard);

function resetView() {
    currentBase64Images = [];
    currentMacros = null;
    DOM.preview.style.display = 'none';
    DOM.preview.src = '';
    document.getElementById('image-count-badge').classList.add('hidden');
    DOM.placeholder.style.display = 'flex';
    DOM.analyzeBtn.disabled = true;
    DOM.contextInput.value = '';
    DOM.resultsCard.classList.add('hidden');
    DOM.cameraInput.value = '';
}

async function queryGemini(model, promptText, base64ImagesArray) {
    const apiKey = localStorage.getItem('ml_gemini_key');
    if (!apiKey) throw new Error("Gemini API Key missing.");

    const parts = [{ "text": promptText }];
    
    if (base64ImagesArray && base64ImagesArray.length > 0) {
        for (let b64 of base64ImagesArray) {
            const base64MimeType = b64.split(';')[0].split(':')[1];
            const base64Raw = b64.split(',')[1];
            parts.push({ "inlineData": { "mimeType": base64MimeType, "data": base64Raw } });
        }
    }

    const payload = {
        "contents": [{ "parts": parts }],
        "generationConfig": { "responseMimeType": "application/json" }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Gemini API Error (${model}): ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
}

async function analyzeMeal() {
    DOM.loader.classList.remove('hidden');
    DOM.loaderText.textContent = "Analyzing with AI...";
    
    
    const contextStr = DOM.contextInput.value.trim() ? `\nUser Context/Overrides: ${DOM.contextInput.value.trim()}` : '';
    const hasImages = currentBase64Images && currentBase64Images.length > 0;
    
    const promptText = hasImages
        ? `Analyze the provided meal imagery.${contextStr}\nEstimate its nutritional content. Return ONLY a valid JSON object in EXACTLY this format, nothing else: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string explaining what you think the food is", "confidence": "string e.g. '80% - hard to see sauce'"}.`
        : `Estimate the nutritional content based on the following meal description: ${contextStr}\nReturn ONLY a valid JSON object in EXACTLY this format, nothing else: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string explaining what you think the food is", "confidence": "string e.g. '90% - text description'"}.`;

    try {
        let resultData;
        try {
            // First try gemini-2.5-pro (Current stable public vision model)
            DOM.loaderText.textContent = "Querying Gemini 2.5 Pro...";
            resultData = await queryGemini('gemini-2.5-pro', promptText, currentBase64Images);
        } catch (e) {
            console.warn("Pro preview failed, falling back...", e);
            alert("Google API blocked Pro: " + e.message + "\n\nFalling back to Flash!");
            DOM.loaderText.textContent = "Pro failed. Fallback to Gemini 2.5 Flash...";
            resultData = await queryGemini('gemini-2.5-flash', promptText, currentBase64Images);
        }

        const jsonText = resultData.candidates[0].content.parts[0].text;
        currentMacros = JSON.parse(jsonText);

        currentMacros.timestamp = new Date().toISOString();

        DOM.resConfidence.textContent = `Confidence: ${currentMacros.confidence}`;
        DOM.resFoodItems.textContent = currentMacros.food_items;
        DOM.resCals.textContent = currentMacros.calories;
        DOM.resPro.textContent = currentMacros.protein;
        DOM.resCarb.textContent = currentMacros.carbs;
        DOM.resFat.textContent = currentMacros.fat;

        DOM.resultsCard.classList.remove('hidden');
    } catch (e) {
        alert(e.message);
    } finally {
        DOM.loader.classList.add('hidden');
    }
}

async function saveToDashboard() {
    DOM.loader.classList.remove('hidden');
    DOM.loaderText.textContent = "Dispatching to GitHub...";
    
    const pat = localStorage.getItem('ml_github_pat');
    const repo = localStorage.getItem('ml_github_repo');

    if (!pat || !repo) {
        alert("GitHub configuration missing.");
        DOM.loader.classList.add('hidden');
        return;
    }

    const payload = {
        event_type: "food_log_update",
        client_payload: {
            timestamp: new Date().toISOString(),
            ...currentMacros
        }
    };

    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${pat}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to dispatch to GitHub.");
        
        DOM.resultsCard.classList.add('hidden');
        DOM.loader.classList.add('hidden');
        alert("Successfully saved to Dashboard!");
        resetView();
    } catch (e) {
        alert(e.message);
        DOM.loader.classList.add('hidden');
    }
}

init();
