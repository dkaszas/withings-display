// BAGUETTE GURU LCARS — Core Application Engine
// Integrates multimodal Gemini API with deep-context Baguette Knowledge Base

(function() {
    'use strict';

    // State Variables
    let currentBase64Images = [];
    let selectedModel = 'gemini-2.5-flash';
    let currentRecipeId = 'sourdough';
    let currentFlourBasis = 500;
    let currentLoavesCount = 3;

    // DOM References
    const DOM = {
        // Nav Pills
        navDiagnose: document.getElementById('nav-diagnose'),
        navRecipes: document.getElementById('nav-recipes'),
        navMethods: document.getElementById('nav-methods'),
        navCoulage: document.getElementById('nav-coulage'),
        navPills: document.querySelectorAll('.nav-pill'),
        tabViews: document.querySelectorAll('.tab-view'),

        // Pillar items
        settingsBtn: document.getElementById('settings-btn'),
        pillarGallery: document.getElementById('pillar-gallery'),
        pillarCamera: document.getElementById('pillar-camera'),
        pillarAnalyze: document.getElementById('pillar-analyze'),
        pillarRecipes: document.getElementById('pillar-recipes'),
        pillarCoulage: document.getElementById('pillar-coulage'),
        pillarClear: document.getElementById('pillar-clear'),

        // Sensor inputs
        galleryInput: document.getElementById('gallery-input'),
        cameraInput: document.getElementById('camera-input'),
        cameraPlaceholder: document.getElementById('camera-placeholder'),
        previewContainer: document.getElementById('preview-container'),
        imageBadge: document.getElementById('image-count-badge'),

        // Context & Prompt
        contextInput: document.getElementById('context-input'),
        btnFlash: document.getElementById('btn-flash'),
        btnPro: document.getElementById('btn-pro'),
        btnAnalyze: document.getElementById('btn-analyze'),
        diagnosticPanel: document.getElementById('diagnostic-panel'),
        diagnosticContent: document.getElementById('diagnostic-content'),
        btnClearResult: document.getElementById('btn-clear-result'),
        quickChips: document.querySelectorAll('.chip-btn'),

        // Telemetry
        activeModelDisplay: document.getElementById('active-model-display'),

        // Recipes View
        recipeTabs: document.querySelectorAll('.recipe-tab'),
        btnDecLoaves: document.getElementById('btn-dec-loaves'),
        btnIncLoaves: document.getElementById('btn-inc-loaves'),
        displayLoaves: document.getElementById('display-loaves'),
        inputFlourBasis: document.getElementById('input-flour-basis'),
        displayHydration: document.getElementById('display-hydration'),
        recipeTableBody: document.getElementById('recipe-table-body'),
        recipeStepsList: document.getElementById('recipe-steps-list'),

        // Methods View
        kbChips: document.querySelectorAll('.kb-chip'),
        kbContent: document.getElementById('kb-markdown-content'),

        // Coulage View
        coulageTd: document.getElementById('coulage-td'),
        coulageTr: document.getElementById('coulage-tr'),
        coulageTf: document.getElementById('coulage-tf'),
        coulageFriction: document.getElementById('coulage-friction'),
        coulageWaterResult: document.getElementById('coulage-water-result'),
        coulageAdvice: document.getElementById('coulage-advice'),

        // Settings Modal
        settingsModal: document.getElementById('settings-modal'),
        btnCloseSettings: document.getElementById('btn-close-settings'),
        btnSaveSettings: document.getElementById('btn-save-settings'),
        btnTestKey: document.getElementById('btn-test-key'),
        geminiKey: document.getElementById('gemini-key'),
        modelPreference: document.getElementById('model-preference'),
        settingsStatus: document.getElementById('settings-status'),

        // Loader
        loaderOverlay: document.getElementById('loader-overlay'),
        loaderText: document.getElementById('loader-text')
    };

    // Initialize App
    function init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration error:', err));
        }

        // Load saved settings
        const savedKey = localStorage.getItem('baguette_gemini_key') || localStorage.getItem('ml_gemini_key') || '';
        DOM.geminiKey.value = savedKey;
        const savedModel = localStorage.getItem('baguette_gemini_model') || 'gemini-2.5-flash';
        selectedModel = savedModel;
        DOM.modelPreference.value = savedModel;
        updateModelUI(savedModel);

        if (!savedKey) {
            // Prompt settings modal on first load if key is missing
            setTimeout(() => DOM.settingsModal.classList.remove('hidden'), 500);
        }

        // Initialize Views
        renderRecipesTable();
        renderKBContent('01_FOUNDATIONS_AND_FLOUR.md');
        calculateCoulage();
        bindEvents();
    }

    // Tab Navigation
    function switchTab(tabId) {
        DOM.navPills.forEach(p => p.classList.toggle('active', p.dataset.tab === tabId));
        DOM.tabViews.forEach(v => v.classList.toggle('active', v.id === `view-${tabId}`));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update Model Display
    function updateModelUI(model) {
        selectedModel = model;
        DOM.activeModelDisplay.textContent = model.replace('gemini-', 'GEMINI ').toUpperCase();
        DOM.btnFlash.classList.toggle('active', model.includes('flash'));
        DOM.btnPro.classList.toggle('active', model.includes('pro'));
    }

    // Bind UI Events
    function bindEvents() {
        // Nav header clicks
        DOM.navPills.forEach(pill => {
            pill.addEventListener('click', () => switchTab(pill.dataset.tab));
        });

        // Left Pillar buttons
        DOM.settingsBtn.addEventListener('click', () => DOM.settingsModal.classList.remove('hidden'));
        DOM.pillarGallery.addEventListener('click', () => DOM.galleryInput.click());
        DOM.pillarCamera.addEventListener('click', () => DOM.cameraInput.click());
        DOM.pillarAnalyze.addEventListener('click', () => {
            switchTab('diagnose');
            analyzePhotos();
        });
        DOM.pillarRecipes.addEventListener('click', () => switchTab('recipes'));
        DOM.pillarCoulage.addEventListener('click', () => switchTab('coulage'));
        DOM.pillarClear.addEventListener('click', clearInputs);

        // Settings Modal
        DOM.btnCloseSettings.addEventListener('click', () => DOM.settingsModal.classList.add('hidden'));
        DOM.btnSaveSettings.addEventListener('click', () => {
            const key = DOM.geminiKey.value.trim();
            const model = DOM.modelPreference.value;
            localStorage.setItem('baguette_gemini_key', key);
            localStorage.setItem('baguette_gemini_model', model);
            updateModelUI(model);
            DOM.settingsModal.classList.add('hidden');
        });
        DOM.btnTestKey.addEventListener('click', testGeminiConnection);

        // Model selector buttons in Diagnose view
        DOM.btnFlash.addEventListener('click', () => {
            updateModelUI('gemini-2.5-flash');
            localStorage.setItem('baguette_gemini_model', 'gemini-2.5-flash');
        });
        DOM.btnPro.addEventListener('click', () => {
            updateModelUI('gemini-2.5-pro');
            localStorage.setItem('baguette_gemini_model', 'gemini-2.5-pro');
        });

        // Photo Inputs
        DOM.galleryInput.addEventListener('change', (e) => handleImageFiles(e.target.files));
        DOM.cameraInput.addEventListener('change', (e) => handleImageFiles(e.target.files));

        // Quick prompt chips
        DOM.quickChips.forEach(chip => {
            chip.addEventListener('click', () => {
                DOM.contextInput.value = chip.dataset.prompt;
                DOM.contextInput.focus();
            });
        });

        // Analyze button
        DOM.btnAnalyze.addEventListener('click', analyzePhotos);
        DOM.btnClearResult.addEventListener('click', () => DOM.diagnosticPanel.classList.add('hidden'));

        // Recipe View
        DOM.recipeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                DOM.recipeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentRecipeId = tab.dataset.recipe;
                renderRecipesTable();
            });
        });

        DOM.btnDecLoaves.addEventListener('click', () => {
            if (currentLoavesCount > 1) {
                currentLoavesCount--;
                currentFlourBasis = Math.round(currentLoavesCount * (500 / 3));
                DOM.displayLoaves.textContent = currentLoavesCount;
                DOM.inputFlourBasis.value = currentFlourBasis;
                renderRecipesTable();
            }
        });

        DOM.btnIncLoaves.addEventListener('click', () => {
            currentLoavesCount++;
            currentFlourBasis = Math.round(currentLoavesCount * (500 / 3));
            DOM.displayLoaves.textContent = currentLoavesCount;
            DOM.inputFlourBasis.value = currentFlourBasis;
            renderRecipesTable();
        });

        DOM.inputFlourBasis.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val && val >= 100) {
                currentFlourBasis = val;
                currentLoavesCount = Math.max(1, Math.round(val / (500 / 3)));
                DOM.displayLoaves.textContent = currentLoavesCount;
                renderRecipesTable();
            }
        });

        // Methods View
        DOM.kbChips.forEach(chip => {
            chip.addEventListener('click', () => {
                DOM.kbChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                renderKBContent(chip.dataset.kb);
            });
        });

        // Coulage View
        [DOM.coulageTd, DOM.coulageTr, DOM.coulageTf, DOM.coulageFriction].forEach(el => {
            el.addEventListener('input', calculateCoulage);
        });
    }

    // Image File Processing & Canvas Compression (1200px max)
    async function handleImageFiles(files) {
        if (!files || files.length === 0) return;

        for (let file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;
            try {
                const b64 = await compressImageToJPEG(file, 1200, 0.82);
                currentBase64Images.push(b64);
            } catch (err) {
                console.error("Compression error:", err);
            }
        }
        updateImagePreviews();
    }

    function compressImageToJPEG(file, maxDimension, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;
                    if (w > maxDimension || h > maxDimension) {
                        if (w > h) {
                            h = Math.round((h * maxDimension) / w);
                            w = maxDimension;
                        } else {
                            w = Math.round((w * maxDimension) / h);
                            h = maxDimension;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const base64 = dataUrl.split(',')[1];
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function updateImagePreviews() {
        if (currentBase64Images.length > 0) {
            DOM.cameraPlaceholder.classList.add('hidden');
            DOM.previewContainer.classList.remove('hidden');
            DOM.imageBadge.classList.remove('hidden');
            DOM.imageBadge.textContent = `${currentBase64Images.length} PHOTO${currentBase64Images.length > 1 ? 'S' : ''}`;

            DOM.previewContainer.innerHTML = '';
            currentBase64Images.forEach((b64, idx) => {
                const item = document.createElement('div');
                item.className = 'preview-item';
                item.innerHTML = `
                    <img src="data:image/jpeg;base64,${b64}">
                    <button class="btn-remove-img" data-idx="${idx}">&times;</button>
                `;
                DOM.previewContainer.appendChild(item);
            });

            // Bind remove buttons
            DOM.previewContainer.querySelectorAll('.btn-remove-img').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.idx, 10);
                    currentBase64Images.splice(idx, 1);
                    updateImagePreviews();
                });
            });
        } else {
            DOM.cameraPlaceholder.classList.remove('hidden');
            DOM.previewContainer.classList.add('hidden');
            DOM.imageBadge.classList.add('hidden');
        }
    }

    function clearInputs() {
        currentBase64Images = [];
        updateImagePreviews();
        DOM.contextInput.value = '';
        DOM.galleryInput.value = '';
        DOM.cameraInput.value = '';
        DOM.diagnosticPanel.classList.add('hidden');
    }

    // Gemini API Query
    async function queryGemini(model, promptText, base64ImagesArray) {
        const apiKey = localStorage.getItem('baguette_gemini_key') || localStorage.getItem('ml_gemini_key');
        if (!apiKey) {
            DOM.settingsModal.classList.remove('hidden');
            throw new Error("Gemini API Key missing. Please configure it in settings.");
        }

        const parts = [{ text: promptText }];
        if (base64ImagesArray && base64ImagesArray.length > 0) {
            for (let b64 of base64ImagesArray) {
                parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: b64
                    }
                });
            }
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: parts }],
            generationConfig: {
                temperature: 0.35,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2500
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API Error (${model}): ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No response generated from Gemini.");
        }
        return data.candidates[0].content.parts[0].text;
    }

    // Test API Connection
    async function testGeminiConnection() {
        const key = DOM.geminiKey.value.trim();
        if (!key) {
            DOM.settingsStatus.textContent = "Please enter an API key first.";
            DOM.settingsStatus.className = "status-msg error";
            return;
        }

        DOM.settingsStatus.textContent = "Testing connection...";
        DOM.settingsStatus.className = "status-msg";
        DOM.settingsStatus.style.display = "block";

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Ping. Reply with 'Baguette Guru Uplink Online' only." }] }]
                })
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            const text = data.candidates[0].content.parts[0].text.trim();
            DOM.settingsStatus.textContent = `SUCCESS: ${text}`;
            DOM.settingsStatus.className = "status-msg success";
        } catch (e) {
            DOM.settingsStatus.textContent = `FAILED: ${e.message}`;
            DOM.settingsStatus.className = "status-msg error";
        }
    }

    // Build Guru System Context Prompt
    function constructGuruPrompt(userQuery) {
        return `You are the World-Class Sourdough Baguette Guru and Master Baker, trained in the prestigious INBP (Institut National de la Boulangerie-Pâtisserie) French tradition.
Your expertise is founded on the definitive synthesis of 8 major bread authorities:
1. Jean-Marie Lanio & Jérémy Ballester (*All About Baguette* / *Le grand livre de la baguette*)
2. Chad Robertson (*Tartine Bread*)
3. Maurizio Leo (*The Perfect Loaf*)
4. King Arthur Baking Company (*Big Book of Bread*)
5. Addie Roberts (*Secrets of Open Crumb*)
6. Ken Forkish (*Flour Water Salt Yeast*)
7. Teresa Greenway (*Discovering Sourdough*)
8. Apollonia Poilâne (*Poilâne*)

IMPORTANT CONTEXT ON INGREDIENTS:
- The user is baking with BIO WHITE FLOUR (Organic French T65 / Organic unbleached ~11-12% protein).
- Bio white flour has ZERO synthetic oxidizers (no ascorbic acid, no bromate) and native enzymes.
- Optimal hydration is strictly 68%–72% (70% standard). Never push above 74% with bio flour without risking flat puddles.
- Bassinage (holding back 5% water until late in mixing) is essential for gluten strength and open alveoli.
- Dough temperature at end of mixing (*Le Coulage*) must be 23°C–24°C.

YOUR ROLE & DIAGNOSTIC DIRECTIVES:
When analyzing photos and queries:
1. IDENTIFY THE STATE: Determine whether the image shows bulk dough, shaped baguettes on couche, pre-bake scoring, crust/oven spring, or interior crumb.
2. RIGOROUS DIAGNOSIS:
   - If Crumb: Evaluate alveolation, bubble uniformity, gelatinization, density streaks, and whether it was under-fermented (dense bottom with giant fool's holes), over-fermented (flattened uniform small bubbles, pale crust), or properly open.
   - If Scoring / Ear (*Grigne*): Check if the blade was held at 20°–30° (underneath flap) vs 90° (sausage cut), overlap (1/3), and alignment along the centerline.
   - If Bulk Fermentation: Evaluate doming, gas accumulation, and volume increase (target: 35%-45% for sourdough before cold retard).
   - If Crust: Check blistering (cold retardation effect), caramelization, and steam sufficiency.
3. CONCRETE ACTIONABLE REMEDY: Provide exact, measurable steps the baker must take next time (exact percentages, times, temperatures, and physical hand movements from Lanio or Robertson).
4. CITE THE MASTERS: Reference Lanio, Robertson, Leo, or Addie Roberts where their technique applies.

USER INQUIRY / CONTEXT:
"${userQuery || "Please examine my baguette photos and give me a full professional guru diagnosis, identifying strengths, defects, and exact corrective actions."}"`;
    }

    // Main Analysis Execution
    async function analyzePhotos() {
        const queryText = DOM.contextInput.value.trim();
        if (!queryText && currentBase64Images.length === 0) {
            alert("PLEASE PROVIDE A PHOTO OR TYPE A QUESTION FOR THE GURU.");
            return;
        }

        const prompt = constructGuruPrompt(queryText);

        DOM.loaderOverlay.classList.remove('hidden');
        DOM.loaderText.textContent = `CONSULTING GURU (${selectedModel.toUpperCase()})...`;

        try {
            let responseText = await queryGemini(selectedModel, prompt, currentBase64Images);
            renderDiagnosticResult(responseText);
        } catch (err) {
            console.error("Analysis failure:", err);
            DOM.diagnosticPanel.classList.remove('hidden');
            DOM.diagnosticContent.innerHTML = `<div style="color: var(--lcars-red); font-weight: bold;">DIAGNOSTIC ERROR: ${err.message}</div>`;
        } finally {
            DOM.loaderOverlay.classList.add('hidden');
        }
    }

    // Render Diagnostic Output
    function renderDiagnosticResult(text) {
        DOM.diagnosticPanel.classList.remove('hidden');
        DOM.diagnosticContent.innerHTML = parseSimpleMarkdown(text);
        DOM.diagnosticPanel.scrollIntoView({ behavior: 'smooth' });
    }

    // Recipe Scaler & Table Rendering
    function renderRecipesTable() {
        if (typeof MASTER_RECIPES_DATA === 'undefined') return;
        const recipe = MASTER_RECIPES_DATA.find(r => r.id === currentRecipeId) || MASTER_RECIPES_DATA[0];

        const flourBasis = currentFlourBasis;
        DOM.recipeTableBody.innerHTML = '';

        recipe.formula_breakdown.forEach(row => {
            const grams = (flourBasis * (row.pct / 100)).toFixed(row.pct < 1 ? 1 : 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.item}</strong></td>
                <td>${row.pct}%</td>
                <td>${grams}g</td>
                <td>${getHandlingNote(row.item)}</td>
            `;
            DOM.recipeTableBody.appendChild(tr);
        });

        // Steps List
        DOM.recipeStepsList.innerHTML = '';
        recipe.steps.forEach((step, idx) => {
            const card = document.createElement('div');
            card.className = 'step-card';
            card.innerHTML = `
                <h4>PHASE ${idx + 1}: ${step.title}</h4>
                <p>${step.text}</p>
            `;
            DOM.recipeStepsList.appendChild(card);
        });
    }

    function getHandlingNote(itemName) {
        if (itemName.includes('Main')) return 'Bio White T65 (ash 0.65%, protein ~11.5%). Gently autolysed.';
        if (itemName.includes('Autolyse')) return 'Water adjusted to Coulage temperature. Mix until no dry flour.';
        if (itemName.includes('Levain')) return 'Young liquid levain (100% hydr) fed 5h prior. Sweet milky aroma.';
        if (itemName.includes('Poolish')) return '100% hydration pre-ferment. Fragrant hazelnut aroma.';
        if (itemName.includes('Bassinage')) return 'Late water addition with salt to enhance cell wall elasticity.';
        if (itemName.includes('Salt')) return '2% fine sea salt. Stiffens gluten ionic bonds.';
        if (itemName.includes('Yeast')) return 'Micro-dose commercial yeast for explosive oven spring.';
        return 'Standard French artisanal processing.';
    }

    // Render Knowledge Base Module
    function renderKBContent(docName) {
        if (typeof BAGUETTE_KB === 'undefined' || !BAGUETTE_KB[docName]) {
            DOM.kbContent.innerHTML = `<p>Module ${docName} not loaded.</p>`;
            return;
        }
        DOM.kbContent.innerHTML = parseSimpleMarkdown(BAGUETTE_KB[docName]);
    }

    // Coulage Calculator
    function calculateCoulage() {
        const Td = parseFloat(DOM.coulageTd.value) || 24;
        const Tr = parseFloat(DOM.coulageTr.value) || 22;
        const Tf = parseFloat(DOM.coulageTf.value) || 21;
        const Tfr = parseFloat(DOM.coulageFriction.value) || 4;

        // Base Temperature formula: 3 * T_target = T_room + T_flour + T_water + T_friction
        // T_water = (3 * Td) - (Tr + Tf + Tfr)
        const Tw = (3 * Td) - (Tr + Tf + Tfr);
        DOM.coulageWaterResult.textContent = `${Tw.toFixed(1)}°C`;

        let advice = "";
        if (Tw < 12) {
            advice = "CAUTION: Required water is very cold! Use ice water or chilled water from refrigerator to avoid overheating the dough.";
        } else if (Tw <= 22) {
            advice = "Use cool tap water. Dough will maintain steady fermentation kinetics without early acid accumulation.";
        } else if (Tw <= 28) {
            advice = "Use tepid water. Ideal for autumn/winter ambient conditions to hit the 24°C target dough temperature.";
        } else {
            advice = "Room or flour is quite cold! Use warm water (30°C–35°C) to give the yeast and enzymes adequate thermal energy.";
        }
        DOM.coulageAdvice.textContent = advice;
    }

    // Lightweight Markdown Parser
    function parseSimpleMarkdown(md) {
        if (!md) return '';
        let html = md
            // Escape code blocks first
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold & Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Tables
            .replace(/\|(.+)\|/g, (match) => {
                const cells = match.split('|').filter(c => c.trim().length > 0);
                if (cells.some(c => c.includes('---'))) return '';
                return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
            })
            // Bullet points
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            // Paragraph breaks
            .replace(/\n\n/g, '<br><br>');

        return html;
    }

    // Launch App
    document.addEventListener('DOMContentLoaded', init);
})();
