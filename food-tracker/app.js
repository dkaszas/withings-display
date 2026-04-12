const DOM = {
    cameraInput: document.getElementById('camera-input'),
    galleryInput: document.getElementById('gallery-input'),
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
    
    // Model toggles
    btnFlash: document.getElementById('btn-flash'),
    btnPro: document.getElementById('btn-pro'),
    
    // Inputs
    geminiKey: document.getElementById('gemini-key'),
    githubPat: document.getElementById('github-pat'),
    githubRepo: document.getElementById('github-repo'),

    // Omni-Panel
    omniInput: document.getElementById('omni-input'),
    omniBtn: document.getElementById('omni-btn'),
    omniResponse: document.getElementById('omni-response'),

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
let imageLastModified = null;
let selectedModel = 'gemini-2.5-flash';

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

DOM.btnFlash.addEventListener('click', () => {
    selectedModel = 'gemini-2.5-flash';
    DOM.btnFlash.classList.add('active');
    DOM.btnPro.classList.remove('active');
});

DOM.btnPro.addEventListener('click', () => {
    selectedModel = 'gemini-2.5-pro';
    DOM.btnPro.classList.add('active');
    DOM.btnFlash.classList.remove('active');
});

function updateAnalyzeButtonState() {
    const hasImages = currentBase64Images && currentBase64Images.length > 0;
    const hasText = DOM.contextInput.value.trim().length > 0;
    DOM.analyzeBtn.disabled = !(hasImages || hasText);
}

DOM.contextInput.addEventListener('input', updateAnalyzeButtonState);

async function handleFileInput(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        if (files[0] && files[0].lastModified) {
            imageLastModified = new Date(files[0].lastModified).toISOString();
        } else {
            imageLastModified = null;
        }
        
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
}

DOM.cameraInput.addEventListener('change', handleFileInput);
DOM.galleryInput.addEventListener('change', handleFileInput);

DOM.cancelBtn.addEventListener('click', resetView);

DOM.analyzeBtn.addEventListener('click', analyzeMeal);
DOM.commitBtn.addEventListener('click', saveToDashboard);

async function fetchDatabank() {
    const pat = localStorage.getItem('ml_github_pat');
    const repo = localStorage.getItem('ml_github_repo');
    if (!pat || !repo) return null;

    const headers = {
        'Accept': 'application/vnd.github.v3.raw',
        'Authorization': `token ${pat}`
    };

    try {
        const nutRes = await fetch(`https://api.github.com/repos/${repo}/contents/nutrition_log.jsonl`, { headers });
        const hrRes = await fetch(`https://api.github.com/repos/${repo}/contents/tasker_health_metrics.jsonl`, { headers });
        const vitalsRes = await fetch(`https://api.github.com/repos/${repo}/contents/health_data.csv`, { headers });
        
        let nutData = nutRes.ok ? await nutRes.text() : '';
        let hrData = hrRes.ok ? await hrRes.text() : '';
        let vitalsData = vitalsRes.ok ? await vitalsRes.text() : '';

        return `NUTRITION LOG:\n${nutData.slice(-15000)}\n\nHEALTH METRICS:\n${hrData.slice(-15000)}\n\nRAW VITALS (incl BP/Weight):\n${vitalsData.slice(-15000)}`;
    } catch(e) {
        console.warn("Databank fetch issue:", e);
        return null;
    }
}

DOM.omniBtn.addEventListener('click', async () => {
    const query = DOM.omniInput.value.trim();
    if (!query) return;

    DOM.loader.classList.remove('hidden');
    DOM.loaderText.textContent = "SYNCHRONIZING DATABANKS...";
    
    try {
        const databank = await fetchDatabank();
        if (!databank) {
            throw new Error("Unable to authenticate or fetch Databank. Check CONFIG parameters.");
        }

        const promptText = `You are a Star Trek LCARS Medical UI analyzing the user's longitudinal health data. Analyze the provided structured logs and answer the user's query clearly, scientifically, and concisely (using Markdown if helpful, but DO NOT enclose the entire response in JSON codeblocks). \n\nDATABANK RECORDS:\n${databank}\n\nUSER QUERY:\n${query}`;

        DOM.loaderText.textContent = `QUERYING OMNICORE...`;
        
        let resultData = await queryGemini('gemini-2.5-flash', promptText, []);
        let aiResp = resultData.candidates[0].content.parts[0].text;
        
        DOM.omniResponse.classList.remove('hidden');
        DOM.omniResponse.textContent = aiResp;
        DOM.omniInput.value = '';

    } catch (e) {
        alert(e.message);
    } finally {
        DOM.loader.classList.add('hidden');
    }
});

function resetView() {
    currentBase64Images = [];
    currentMacros = null;
    imageLastModified = null;
    DOM.preview.style.display = 'none';
    DOM.preview.src = '';
    document.getElementById('image-count-badge').classList.add('hidden');
    DOM.placeholder.style.display = 'flex';
    DOM.analyzeBtn.disabled = true;
    DOM.contextInput.value = '';
    DOM.resultsCard.classList.add('hidden');
    DOM.cameraInput.value = '';
    DOM.galleryInput.value = '';
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
    DOM.loaderText.textContent = "ESTABLISHING SECURE UPLINK...";
    
    
    const contextStr = DOM.contextInput.value.trim() ? `\nUser Context/Overrides: ${DOM.contextInput.value.trim()}` : '';
    const hasImages = currentBase64Images && currentBase64Images.length > 0;
    
    const promptText = hasImages
        ? `Analyze the provided meal imagery.${contextStr}\nEstimate its nutritional content. Return ONLY a valid JSON object in EXACTLY this format, nothing else: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string explaining what you think the food is", "confidence": "string e.g. '80% - hard to see sauce'"}.`
        : `Estimate the nutritional content based on the following meal description: ${contextStr}\nReturn ONLY a valid JSON object in EXACTLY this format, nothing else: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string explaining what you think the food is", "confidence": "string e.g. '90% - text description'"}.`;

    try {
        let resultData;
        if (selectedModel === 'gemini-2.5-flash') {
            try {
                DOM.loaderText.textContent = "QUERYING FLASH DATABANK...";
                resultData = await queryGemini('gemini-2.5-flash', promptText, currentBase64Images);
            } catch (e) {
                console.warn("Flash failed, falling back...", e);
                DOM.loaderText.textContent = "FLASH FAILED. FALLBACK UPLINK...";
                resultData = await queryGemini('gemini-2.5-pro', promptText, currentBase64Images);
            }
        } else {
            // Pro selected
            try {
                DOM.loaderText.textContent = "QUERYING PRO DATABANK...";
                resultData = await queryGemini('gemini-2.5-pro', promptText, currentBase64Images);
            } catch (e) {
                console.warn("Pro failed, falling back...", e);
                DOM.loaderText.textContent = "PRO FAILED. FALLBACK UPLINK...";
                resultData = await queryGemini('gemini-2.5-flash', promptText, currentBase64Images);
            }
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
    DOM.loaderText.textContent = "TRANSMITTING TELEMETRY...";
    
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
            image_timestamp: imageLastModified || new Date().toISOString(),
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
