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
        stardate: document.getElementById('stardate-display'),
        
        // Model toggles
        modelSelect: document.querySelector('.model-select'),
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

        // Sports View
        sportsNavBtn: document.getElementById('sports-nav-btn'),
        sportsView: document.getElementById('sports-view'),
        sportSelect: document.getElementById('sport-select'),
        sportDynamicInputs: document.getElementById('sport-dynamic-inputs'),
        sportTime: document.getElementById('sport-time'),
        sportContext: document.getElementById('sport-context'),
        sportSubmitBtn: document.getElementById('sport-submit-btn'),

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
        
        updateStardate();
        setInterval(updateStardate, 60000);
    }

    function updateStardate() {
        if (!DOM.stardate) return;
        const now = new Date();
        const opts = { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
        const formatter = new Intl.DateTimeFormat('en-US', opts);
        const parts = formatter.formatToParts(now);
        let ds = {};
        parts.forEach(p => ds[p.type] = p.value);
        DOM.stardate.textContent = `${ds.year}${ds.month}${ds.day}.${ds.hour}${ds.minute}`;
    }

    function updateDynamicPillars() {
        if (!DOM.scannerView || DOM.scannerView.classList.contains('hidden')) return;
        
        DOM.pillar1.textContent = 'GALLERY'; DOM.pillar1.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar1.style.cursor = 'pointer';
        DOM.pillar2.textContent = 'SENSOR'; DOM.pillar2.className = 'lcars-bar lcars-bar-standard bg-purple'; DOM.pillar2.style.cursor = 'pointer';
        
        // Default interaction bars
        DOM.pillar3.textContent = 'ANALYZE'; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-cyan'; DOM.pillar3.style.cursor = 'default';
        DOM.pillar4.textContent = ''; DOM.pillar4.className = 'lcars-bar lcars-bar-standard bg-peach'; DOM.pillar4.style.cursor = 'default';
        DOM.pillar5.textContent = ''; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-red'; DOM.pillar5.style.cursor = 'default';

        const hasImage = !DOM.preview.classList.contains('hidden');
        const hasText = DOM.contextInput.value.trim().length > 0;
        const canAnalyze = hasImage || hasText;
        const hasResults = !DOM.resultsCard.classList.contains('hidden');

        if (canAnalyze && !hasResults) {
            DOM.pillar3.style.flexGrow = '';
            DOM.pillar3.style.minHeight = '100px';
            DOM.pillar3.style.height = 'auto';

            DOM.pillar3.textContent = 'ANALYZE'; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-cyan'; DOM.pillar3.style.cursor = 'pointer';
            DOM.pillar5.textContent = 'ABORT'; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-red'; DOM.pillar5.style.cursor = 'pointer';
            DOM.analyzeBtn.disabled = false;
            DOM.analyzeBtn.classList.remove('hidden');
            DOM.contextInput.classList.remove('hidden');
            DOM.modelSelect.classList.remove('hidden');
        } 
        else if (hasResults) {
            DOM.pillar4.textContent = 'COMMIT'; DOM.pillar4.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar4.style.cursor = 'pointer';
            DOM.pillar5.textContent = 'ABORT'; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-red'; DOM.pillar5.style.cursor = 'pointer';
            DOM.analyzeBtn.classList.add('hidden');
            DOM.contextInput.classList.add('hidden');
            DOM.modelSelect.classList.add('hidden');

            // Magic JS Vertical Splicing aligner - robust timing guarantees
            const alignPillars = () => {
                DOM.pillar3.style.flexGrow = '0';
                const p3Top = DOM.pillar3.getBoundingClientRect().top;
                const targetTop = DOM.commitBtn.getBoundingClientRect().top;
                const targetHeight = targetTop - p3Top - 2;
                if (targetHeight > 0) {
                    DOM.pillar3.style.minHeight = targetHeight + 'px';
                    DOM.pillar3.style.height = targetHeight + 'px';
                }
            };
            setTimeout(alignPillars, 50);
            setTimeout(alignPillars, 300);
            setTimeout(alignPillars, 800); // Super-safe fallback for slow mobile rendering
        } else {
            DOM.pillar3.style.flexGrow = '';
            DOM.pillar3.style.minHeight = '100px';
            DOM.pillar3.style.height = 'auto';

            DOM.analyzeBtn.disabled = true;
            DOM.analyzeBtn.classList.add('hidden');
            DOM.contextInput.classList.remove('hidden');
            DOM.modelSelect.classList.remove('hidden');
        }
    }

    function openView(target) {
        DOM.scannerView.classList.add('hidden');
        DOM.tricorderView.classList.add('hidden');
        DOM.databankView.classList.add('hidden');
        DOM.sportsView.classList.add('hidden');
        
        DOM.navBtn.textContent = 'TRICORDER';
        DOM.navBtn.style.backgroundColor = 'var(--lcars-teal)';
        DOM.databankNavBtn.textContent = 'DATABANK';
        DOM.databankNavBtn.style.backgroundColor = 'var(--lcars-dark-orange)';
        DOM.sportsNavBtn.textContent = 'ACTIVITY LOG';
        DOM.sportsNavBtn.style.backgroundColor = 'var(--lcars-gold)';
        
        DOM.app.classList.remove('tricorder-mode');

        if (target === 'tricorder') {
            DOM.tricorderView.classList.remove('hidden');
            DOM.navBtn.textContent = 'SCANNER';
            DOM.navBtn.style.backgroundColor = 'var(--lcars-peach)';
            DOM.app.classList.add('tricorder-mode');
            fetchDiagnostics();
        } else if (target === 'databank') {
            DOM.databankView.classList.remove('hidden');
            DOM.databankNavBtn.textContent = 'SCANNER';
            DOM.databankNavBtn.style.backgroundColor = 'var(--lcars-peach)';
            
            DOM.pillar1.textContent = 'SCANNER'; DOM.pillar1.className = 'lcars-bar lcars-bar-standard bg-peach'; DOM.pillar1.style.cursor = 'pointer';
            DOM.pillar2.textContent = 'TRICORDER'; DOM.pillar2.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar2.style.cursor = 'pointer';
            DOM.pillar3.textContent = 'TRANSMIT'; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-dark-orange'; DOM.pillar3.style.cursor = 'pointer';
            DOM.pillar4.textContent = 'CLEAR'; DOM.pillar4.className = 'lcars-bar lcars-bar-standard bg-tan'; DOM.pillar4.style.cursor = 'pointer';
            DOM.pillar5.textContent = 'CONFIG'; DOM.pillar5.className = 'lcars-bar lcars-bar-stretch bg-purple'; DOM.pillar5.style.cursor = 'pointer';

        } else if (target === 'sports') {
            DOM.sportsView.classList.remove('hidden');
            DOM.sportsNavBtn.textContent = 'SCANNER';
            DOM.sportsNavBtn.style.backgroundColor = 'var(--lcars-peach)';
            
            DOM.pillar1.textContent = 'SCANNER'; DOM.pillar1.className = 'lcars-bar lcars-bar-standard bg-peach'; DOM.pillar1.style.cursor = 'pointer';
            DOM.pillar2.textContent = 'TRICORDER'; DOM.pillar2.className = 'lcars-bar lcars-bar-standard bg-blue'; DOM.pillar2.style.cursor = 'pointer';
            DOM.pillar3.textContent = 'INJECT LOG'; DOM.pillar3.className = 'lcars-bar lcars-bar-stretch bg-gold'; DOM.pillar3.style.cursor = 'pointer';
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
        if (DOM.pillar3.textContent === 'INJECT LOG') DOM.sportSubmitBtn.click();
    });
    DOM.pillar4.addEventListener('click', () => {
        if (DOM.pillar4.textContent === 'COMMIT' && !DOM.resultsCard.classList.contains('hidden')) DOM.commitBtn.click();
        if (DOM.pillar4.textContent === 'CLEAR') { 
            DOM.omniInput.value = ''; 
            DOM.sportContext.value = ''; 
            DOM.omniResponse.classList.add('hidden'); 
            DOM.sportSelect.value = '';
            DOM.sportDynamicInputs.innerHTML = '';
        }
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

    DOM.sportsNavBtn.addEventListener('click', () => {
        if (DOM.sportsNavBtn.textContent === 'ACTIVITY LOG') {
            openView('sports');
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            DOM.sportTime.value = now.toISOString().slice(0, 16);
        } else {
            openView('scanner');
        }
    });

    DOM.sportSelect.addEventListener('change', (e) => {
        const sport = e.target.value;
        const container = DOM.sportDynamicInputs;
        container.innerHTML = '';
        
        const createInput = (label, id, type='number', placeholder='') => `
            <div style="display: flex; gap: 10px; align-items: center;">
                <label style="color: var(--lcars-peach); font-size: 14px; min-width: 100px;">${label}:</label>
                <input type="${type}" id="${id}" placeholder="${placeholder}" style="flex-grow: 1; padding: 8px; background: #000; color: var(--lcars-peach); border: 1px solid var(--lcars-peach); border-radius: 5px; font-family: 'Oswald', sans-serif; font-size: 14px;">
            </div>
        `;
        
        const createSelect = (label, id, options) => `
            <div style="display: flex; gap: 10px; align-items: center;">
                <label style="color: var(--lcars-peach); font-size: 14px; min-width: 100px;">${label}:</label>
                <select id="${id}" style="flex-grow: 1; padding: 8px; background: #000; color: var(--lcars-peach); border: 1px solid var(--lcars-peach); border-radius: 5px; font-family: 'Oswald', sans-serif; font-size: 14px;">
                    ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            </div>
        `;

        if (sport === 'pilates') {
            container.innerHTML = createInput('DURATION (min)', 's-time', 'number', '50');
        } else if (sport === 'running') {
            container.innerHTML = createSelect('TYPE', 's-subtype', ['4x4 Interval', 'Long Run', 'Tempo', 'Recovery']) + 
                                  createInput('DURATION (min)', 's-time') + 
                                  createInput('DISTANCE (km)', 's-dist', 'number');
        } else if (sport === 'gym') {
            container.innerHTML = createSelect('BACK STRETCH', 's-gym-back', ['YES', 'NO']) + 
                                  createSelect('LEG STRETCH', 's-gym-leg', ['YES', 'NO']) + 
                                  `<div style="color: var(--lcars-blue); font-size: 12px; margin-top: 5px;">USE FREEFORM BOX FOR SPECIFIC LIFTS (E.G. 'bench press 3x8 80kg')</div>`;
        } else if (sport === 'cycling') {
            container.innerHTML = createInput('DURATION (min)', 's-time') + 
                                  createInput('DISTANCE (km)', 's-dist', 'number') + 
                                  createInput('ELEVATION (m)', 's-elev', 'number');
        } else if (sport === 'swim') {
            container.innerHTML = createInput('DURATION (min)', 's-time') + 
                                  createInput('LAPS', 's-laps', 'number');
        } else if (sport === 'cc_ski') {
            container.innerHTML = createInput('DISTANCE (km)', 's-dist', 'number');
        }
    });

    DOM.sportSubmitBtn.addEventListener('click', async () => {
        if (!DOM.sportSelect.value || !DOM.sportTime.value) {
            alert("ACTIVITY AND LOCAL TIME REQUIRED.");
            return;
        }
        
        DOM.loader.classList.remove('hidden'); 
        DOM.loaderText.textContent = "TRANSMITTING TELEMETRY...";
        
        const payloadData = {
            sport: DOM.sportSelect.value,
            local_time: DOM.sportTime.value,
            context: DOM.sportContext.value.trim()
        };
        
        // Harvest dynamic fields
        ['s-time', 's-dist', 's-elev', 's-laps', 's-subtype', 's-gym-back', 's-gym-leg'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value) payloadData[id.replace('s-', '')] = el.value;
        });

        const pat = localStorage.getItem('ml_github_pat'), repo = localStorage.getItem('ml_github_repo'), geminiKey = localStorage.getItem('ml_gemini_key');
        if (!pat || !repo || !geminiKey) { 
            alert("CONFIG/KEYS MISSING."); 
            DOM.loader.classList.add('hidden'); 
            return; 
        }
        
        const payload = { 
            event_type: "sport_log_update", 
            client_payload: { 
                timestamp: new Date().toISOString(),
                gemini_key: geminiKey,
                sport_data: payloadData
            } 
        };
        
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
                method: 'POST', headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("GitHub dispatch failed.");
            alert("ACTIVITY TRANSMITTED TO GITHUB!"); 
            DOM.sportContext.value = '';
        } catch (e) { 
            alert(e.message); 
        } finally { 
            DOM.loader.classList.add('hidden'); 
        }
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

    async function fetchDiagnostics() {
        const diagFooter = document.getElementById('diagnostic-footer');
        if (!diagFooter) return;
        
        try {
            const cacheBuster = Date.now();
            const res = await fetch(`https://raw.githubusercontent.com/dkaszas/withings-display/refs/heads/main/diagnostics.json?v=${cacheBuster}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            
            const formatTime = (ts) => {
                if (!ts) return "OFFLINE";
                const d = new Date(ts);
                const h = String(d.getHours()).padStart(2, '0');
                const m = String(d.getMinutes()).padStart(2, '0');
                const mn = String(d.getMonth() + 1).padStart(2, '0');
                const dy = String(d.getDate()).padStart(2, '0');
                return `${dy}/${mn} ${h}${m}`;
            };

            diagFooter.innerHTML = `
                <div class="diag-row">
                    <span class="diag-label">WITHINGS SENSORS</span>
                    <span class="diag-val">${formatTime(data.last_withings)}</span>
                </div>
                <div class="diag-row">
                    <span class="diag-label">NUTRITION LOG</span>
                    <span class="diag-val">${formatTime(data.last_nutrition)}</span>
                </div>
                <div class="diag-row">
                    <span class="diag-label">CUSTOM TASKER PUSH</span>
                    <span class="diag-val" style="${data.tasker_stale ? 'color: var(--lcars-red);' : ''}">${formatTime(data.last_tasker)}</span>
                </div>
            `;
            diagFooter.classList.remove('hidden');
        } catch (e) {
            console.error("Failed to load diagnostics", e);
            diagFooter.innerHTML = `<div class="diag-row"><span class="diag-label">SYSTEM_STATUS</span><span class="diag-val" style="color: var(--lcars-red)">OFFLINE</span></div>`;
            diagFooter.classList.remove('hidden');
        }
    }

    function processImageSelection(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentBase64Images.push(e.target.result.split(',')[1]);
            DOM.preview.src = e.target.result;
            DOM.preview.classList.remove('hidden');
            DOM.placeholder.style.display = 'none';
            DOM.badge.textContent = `IMG: ${currentBase64Images.length}/3`;
            if (currentBase64Images.length > 1) {
                DOM.badge.classList.remove('hidden');
            } else {
                DOM.badge.classList.add('hidden');
            }
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
            ? `Identify food items and estimate macros. If you see something half eaten or empty, assume it has been fully eaten. If you see a drink next to the meal, assume it was a full sized drink that I drank.${contextStr}\nReturn ONLY JSON: {"calories": int, "protein": int, "carbs": int, "fat": int, "food_items": "string", "confidence": "string"}.`
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
            const promptText = `Analyze records: ${databank}\n\nCRITICAL INSTRUCTION: If the USER QUERY explicitly contains new health metrics (like HRV, Sleep Score, Health Score, Vitalite) that they want to explicitly log, you MUST:
1. Thoroughly verify if today's date already contains these genuinely new/fresh values in the METRICS database. If a fresh value explicitly exists for today, perfectly reply with a warning that it exists and IGNORE the upload.
2. If it is genuinely missing from today's active variables, reply confirming you will manually inject it, AND append this exact literal string to the very end of your response: __LOG_METRIC_PAYLOAD__ followed securely by the minified valid JSON of the explicitly detected metrics. Example:
Yes Captain, logging it now. __LOG_METRIC_PAYLOAD__{"hrv": 35, "vitalite": 66}

USER QUERY: ${query}`;
            let resultData = await queryGemini('gemini-2.5-flash', promptText, [], false);
            let aiResp = resultData.candidates[0].content.parts[0].text;
            
            // Check for payload extraction
            const payloadMatch = aiResp.match(/__LOG_METRIC_PAYLOAD__\s*({.*})/);
            if (payloadMatch) {
                try {
                    const metricsJSON = JSON.parse(payloadMatch[1]);
                    aiResp = aiResp.replace(payloadMatch[0], "").trim();
                    
                    const pat = localStorage.getItem('ml_github_pat'), repo = localStorage.getItem('ml_github_repo');
                    const payload = { 
                        event_type: "withings_manual_injection", 
                        client_payload: { 
                            timestamp: new Date().toISOString(), 
                            metrics: metricsJSON 
                        } 
                    };
                    await fetch(`https://api.github.com/repos/dkaszas/withings/dispatches`, {
                        method: 'POST', headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                    });
                } catch(e) { console.error("Interception parsing failed", e); }
            }
            
            aiResp = aiResp.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
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
