document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        app: document.getElementById('app'),
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
        badge: document.getElementById('image-count-badge'),
        
        // Model toggles
        btnFlash: document.getElementById('btn-flash'),
        btnPro: document.getElementById('btn-pro'),
        
        // Inputs
        geminiKey: document.getElementById('gemini-key'),
        githubPat: document.getElementById('github-pat'),
        githubRepo: document.getElementById('github-repo'),

        // Pillars
        pillar1: document.getElementById('pillar-bar-1'),
        pillar2: document.getElementById('pillar-bar-2'),
        pillar3: document.getElementById('pillar-bar-3'),
        pillar4: document.getElementById('pillar-bar-4'),
        pillar5: document.getElementById('pillar-bar-5'),

        // Navigation
        navBtn: document.getElementById('nav-btn'),
        databankNavBtn: document.getElementById('databank-nav-btn'),
        scannerView: document.getElementById('scanner-view'),
        tricorderView: document.getElementById('tricorder-view'),
        databankView: document.getElementById('databank-view'),

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

    function updateDynamicPillars() {
        if (!DOM.scannerView || DOM.scannerView.classList.contains('hidden')) return;
        
        DOM.pillar1.textContent = 'GALLERY'; DOM.pillar1.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar1.style.cursor = 'pointer';
        DOM.pillar2.textContent = 'SENSOR'; DOM.pillar2.className = 'lcars-bar lcars-bar-standard bg-purple'; DOM.pillar2.style.cursor = 'pointer';
        
        // Default interaction bars
        DOM.pillar3.textContent = ''; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-dark-orange'; DOM.pillar3.style.cursor = 'default';
        DOM.pillar4.textContent = ''; DOM.pillar4.className = 'lcars-bar lcars-bar-standard bg-peach'; DOM.pillar4.style.cursor = 'default';
        DOM.pillar5.textContent = ''; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-red'; DOM.pillar5.style.cursor = 'default';

        const hasImage = !DOM.preview.classList.contains('hidden');
        const hasText = DOM.contextInput.value.trim().length > 0;
        const canAnalyze = hasImage || hasText;
        const hasResults = !DOM.resultsCard.classList.contains('hidden');

        if (canAnalyze && !hasResults) {
            DOM.pillar3.textContent = 'ANALYZE'; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-blue'; DOM.pillar3.style.cursor = 'pointer';
            DOM.pillar5.textContent = 'ABORT'; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-red'; DOM.pillar5.style.cursor = 'pointer';
            DOM.analyzeBtn.disabled = false;
            DOM.analyzeBtn.classList.remove('hidden');
        } 
        else if (hasResults) {
            DOM.pillar4.textContent = 'COMMIT'; DOM.pillar4.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar4.style.cursor = 'pointer';
            DOM.pillar5.textContent = 'ABORT'; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-red'; DOM.pillar5.style.cursor = 'pointer';
            DOM.analyzeBtn.classList.add('hidden');
        } else {
            DOM.analyzeBtn.disabled = true;
            DOM.analyzeBtn.classList.add('hidden');
        }
    }

    function openView(target) {
        DOM.scannerView.classList.add('hidden');
        DOM.tricorderView.classList.add('hidden');
        DOM.databankView.classList.add('hidden');
        
        DOM.navBtn.textContent = 'TRICORDER';
        DOM.navBtn.style.backgroundColor = 'var(--lcars-blue)';
        DOM.databankNavBtn.textContent = 'DATABANK';
        DOM.databankNavBtn.style.backgroundColor = 'var(--lcars-dark-orange)';
        
        DOM.app.classList.remove('tricorder-mode');

        if (target === 'tricorder') {
            DOM.tricorderView.classList.remove('hidden');
            DOM.navBtn.textContent = 'SCANNER';
            DOM.navBtn.style.backgroundColor = 'var(--lcars-peach)';
            DOM.app.classList.add('tricorder-mode');
        } else if (target === 'databank') {
            DOM.databankView.classList.remove('hidden');
            DOM.databankNavBtn.textContent = 'SCANNER';
            DOM.databankNavBtn.style.backgroundColor = 'var(--lcars-peach)';
            
            DOM.pillar1.textContent = 'SCANNER'; DOM.pillar1.className = 'lcars-bar lcars-bar-standard bg-peach'; DOM.pillar1.style.cursor = 'pointer';
            DOM.pillar2.textContent = 'TRICORDER'; DOM.pillar2.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar2.style.cursor = 'pointer';
            DOM.pillar3.textContent = 'TRANSMIT'; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-dark-orange'; DOM.pillar3.style.cursor = 'pointer';
            DOM.pillar4.textContent = 'CLEAR'; DOM.pillar4.className = 'lcars-bar lcars-bar-standard bg-tan'; DOM.pillar4.style.cursor = 'pointer';
            DOM.pillar5.textContent = 'CONFIG'; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-purple'; DOM.pillar5.style.cursor = 'pointer';

        } else {
            DOM.scannerView.classList.remove('hidden');
            updateDynamicPillars();
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

    DOM.pillar1.addEventListener('click', () => {
        if (DOM.pillar1.textContent === 'GALLERY') DOM.galleryInput.click();
        if (DOM.pillar1.textContent === 'SCANNER') openView('scanner');
    });
    DOM.pillar2.addEventListener('click', () => {
        if (DOM.pillar2.textContent === 'SENSOR') DOM.cameraInput.click();
        if (DOM.pillar2.textContent === 'TRICORDER') openView('tricorder');
    });
    DOM.pillar3.addEventListener('click', () => {
        if (DOM.pillar3.textContent === 'ANALYZE') DOM.analyzeBtn.click();
        if (DOM.pillar3.textContent === 'TRANSMIT') DOM.omniBtn.click();
    });
    DOM.pillar4.addEventListener('click', () => {
        if (DOM.pillar4.textContent === 'COMMIT' && !DOM.resultsCard.classList.contains('hidden')) DOM.commitBtn.click();
        if (DOM.pillar4.textContent === 'CLEAR') { DOM.omniInput.value = ''; DOM.omniResponse.classList.add('hidden'); }
    });
    DOM.pillar5.addEventListener('click', () => {
        if (DOM.pillar5.textContent === 'ABORT' && !DOM.resultsCard.classList.contains('hidden')) DOM.cancelBtn.click();
        if (DOM.pillar5.textContent === 'CONFIG') DOM.settingsModal.classList.remove('hidden');
    });

    DOM.navBtn.addEventListener('click', () => {
        if (DOM.navBtn.textContent === 'TRICORDER') openView('tricorder');
        else openView('scanner');
    });

    DOM.databankNavBtn.addEventListener('click', () => {
        if (DOM.databankNavBtn.textContent === 'DATABANK') openView('databank');
        else openView('scanner');
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

    DOM.contextInput.addEventListener('input', updateDynamicPillars);

    function processImageSelection(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentBase64Images.push(e.target.result.split(',')[1]);
            DOM.preview.src = e.target.result;
            DOM.preview.classList.remove('hidden');
            DOM.placeholder.style.display = 'none';
            DOM.badge.textContent = `IMG: ${currentBase64Images.length}/3`;
            DOM.badge.classList.remove('hidden');
            updateDynamicPillars();
        };
        reader.readAsDataURL(file);
    }

    DOM.cameraInput.addEventListener('change', (e) => processImageSelection(e.target.files[0]));
    DOM.galleryInput.addEventListener('change', (e) => processImageSelection(e.target.files[0]));

    DOM.cancelBtn.addEventListener('click', () => {
        currentBase64Images = [];
        DOM.preview.src = '';
        DOM.preview.classList.add('hidden');
        DOM.placeholder.style.display = 'flex';
        DOM.contextInput.value = '';
        DOM.resultsCard.classList.add('hidden');
        DOM.badge.classList.add('hidden');
        DOM.cameraInput.value = '';
        DOM.galleryInput.value = '';
        updateDynamicPillars();
    });

    async function queryGemini(model, promptText, base64ImagesArray, isJsonMode = true) {
        const apiKey = localStorage.getItem('ml_gemini_key');
        if (!apiKey) throw new Error("Gemini API Key missing.");

        const parts = [{ "text": promptText }];
        if (base64ImagesArray && base64ImagesArray.length > 0) {
            for (let b64 of base64ImagesArray) {
                parts.push({ "inlineData": { "mimeType": "image/jpeg", "data": b64 } });
            }
        }

        const payload = { "contents": [{ "parts": parts }] };
        if (isJsonMode) payload.generationConfig = { "responseMimeType": "application/json" };

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
        return await response.json();
    }

    async function analyzeMeal() {
        DOM.loader.classList.remove('hidden');
        DOM.loaderText.textContent = "ESTABLISHING SECURE UPLINK...";
        const contextStr = DOM.contextInput.value.trim() ? `\nUser Context: ${DOM.contextInput.value.trim()}` : '';
        const hasImages = currentBase64Images && currentBase64Images.length > 0;
        const promptText = hasImages
            ? `Identify food items and estimate macros.${contextStr}\nReturn ONLY JSON: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string", "confidence": "string"}.`
            : `Estimate macros from description: ${contextStr}\nReturn ONLY JSON: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string", "confidence": "string"}.`;

        try {
            let resultData;
            const primaryModel = selectedModel;
            const fallbackModel = (primaryModel === 'gemini-2.5-flash') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
            try {
                DOM.loaderText.textContent = `QUERYING ${primaryModel.toUpperCase()}...`;
                resultData = await queryGemini(primaryModel, promptText, currentBase64Images, true);
            } catch (e) {
                console.warn(`${primaryModel} failed, falling back...`, e);
                DOM.loaderText.textContent = "FALLBACK UPLINK...";
                resultData = await queryGemini(fallbackModel, promptText, currentBase64Images, true);
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
            updateDynamicPillars();
        } catch (e) { alert(e.message); } finally { DOM.loader.classList.add('hidden'); }
    }

    DOM.analyzeBtn.addEventListener('click', analyzeMeal);

    DOM.commitBtn.addEventListener('click', async () => {
        DOM.loader.classList.remove('hidden'); DOM.loaderText.textContent = "TRANSMITTING TELEMETRY...";
        const pat = localStorage.getItem('ml_github_pat'), repo = localStorage.getItem('ml_github_repo');
        if (!pat || !repo) { alert("GitHub configuration missing."); DOM.loader.classList.add('hidden'); return; }
        const payload = { event_type: "food_log_update", client_payload: { timestamp: new Date().toISOString(), ...currentMacros } };
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
                method: 'POST', headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("GitHub dispatch failed.");
            alert("Saved to Dashboard!"); DOM.cancelBtn.click();
        } catch (e) { alert(e.message); } finally { DOM.loader.classList.add('hidden'); }
    });

    DOM.omniBtn.addEventListener('click', async () => {
        const query = DOM.omniInput.value.trim();
        if (!query) return;
        DOM.loader.classList.remove('hidden'); DOM.loaderText.textContent = "SYNCHRONIZING...";
        try {
            const databank = await fetchDatabank();
            const promptText = `Analyze records: ${databank}\n\nUSER QUERY: ${query}`;
            let resultData = await queryGemini('gemini-2.5-flash', promptText, [], false);
            let aiResp = resultData.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
            DOM.omniResponse.classList.remove('hidden'); DOM.omniResponse.innerHTML = aiResp; DOM.omniInput.value = '';
        } catch (e) { alert(e.message); } finally { DOM.loader.classList.add('hidden'); }
    });

    async function fetchDatabank() {
        const pat = localStorage.getItem('ml_github_pat'), repo = localStorage.getItem('ml_github_repo');
        if (!pat || !repo) return null;
        const headers = { 'Accept': 'application/vnd.github.v3.raw', 'Authorization': `token ${pat}` };
        try {
            const [nut, hr, vit] = await Promise.all([
                fetch(`https://api.github.com/repos/${repo}/contents/nutrition_log.jsonl`, { headers }),
                fetch(`https://api.github.com/repos/${repo}/contents/tasker_health_metrics.jsonl`, { headers }),
                fetch(`https://api.github.com/repos/${repo}/contents/health_data.csv`, { headers })
            ]);
            return `NUTRITION:\n${nut.ok ? await nut.text() : ''}\n\nMETRICS:\n${hr.ok ? await hr.text() : ''}\n\nVITALS:\n${vit.ok ? await vit.text() : ''}`;
        } catch { return null; }
    }

    init();
});
