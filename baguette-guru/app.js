// BREAD GURU LCARS — Core Application Engine
// Dual Mode: Artisanal Baguettes & Sourdough Boules / Bâtards
// Dynamic Flour Profiler, Interactive Hydration Slider, and Exact Gram Calculations

(function() {
    'use strict';

    // Application State
    let currentFormatMode = 'baguette'; // 'baguette' | 'boule'
    let currentBase64Images = [];
    let selectedModel = 'gemini-2.5-flash';
    let currentRecipeId = 'sourdough';
    let currentFlourBasis = 500;
    let currentLoavesCount = 3;
    let currentHydration = 70.0;
    let activeFlour = null;

    // DOM References
    const DOM = {
        // Format Switcher
        btnFormatBaguette: document.getElementById('btn-format-baguette'),
        btnFormatBoule: document.getElementById('btn-format-boule'),
        telemetryFormat: document.getElementById('telemetry-format'),
        recipeFormatTitle: document.getElementById('recipe-format-title'),
        recipeFormatSubtitle: document.getElementById('recipe-format-subtitle'),

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

        // Telemetry
        headerFlourSelector: document.getElementById('header-flour-selector'),
        telemetryProtein: document.getElementById('telemetry-protein'),
        telemetryHydr: document.getElementById('telemetry-hydr'),
        activeModelDisplay: document.getElementById('active-model-display'),

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
        quickChipsContainer: document.getElementById('quick-chips-container'),

        // Flour Profiler (Recipe View)
        recipeFlourSelector: document.getElementById('recipe-flour-selector'),
        inputProtein: document.getElementById('input-protein'),
        selectBio: document.getElementById('select-bio'),
        flourNotesBanner: document.getElementById('flour-notes-banner'),

        // Hydration Control
        sliderHydration: document.getElementById('slider-hydration'),
        valHydrationDisplay: document.getElementById('val-hydration-display'),
        hydrZoneBadge: document.getElementById('hydr-zone-badge'),

        // Recipe Scaler
        recipeSelectorPills: document.getElementById('recipe-selector-pills'),
        labelUnitCount: document.getElementById('label-unit-count'),
        btnDecLoaves: document.getElementById('btn-dec-loaves'),
        btnIncLoaves: document.getElementById('btn-inc-loaves'),
        displayLoaves: document.getElementById('display-loaves'),
        displayPortionEstimate: document.getElementById('display-portion-estimate'),
        inputFlourBasis: document.getElementById('input-flour-basis'),
        displayTotalWater: document.getElementById('display-total-water'),
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

    // Quick Chip Templates for Baguette vs Boule
    const QUICK_CHIPS_DATA = {
        baguette: [
            { label: '🔍 CRUMB DIAGNOSIS', prompt: 'Analyze this baguette crumb structure. Diagnose alveoli distribution, gelatinization, and whether it shows under-fermentation, over-fermentation, or shaping flaws. Correlate with my current flour protein and hydration.' },
            { label: '⏱️ BULK PROOF CHECK', prompt: 'Evaluate this dough during bulk fermentation. Are the bubbles, doming, and surface tension at the right expansion point for shaping into baguettes?' },
            { label: '🔪 BAGUETTE SCORING (5 CUTS)', prompt: 'Diagnose the scoring angle, blade depth, and overlap on this baguette. Why did the ear (grigne) open or fail to open along the central longitudinal axis?' },
            { label: '💧 HYDRATION & BASSINAGE', prompt: 'Analyze my hydration and bassinage calculation for this flour in a baguette format. Am I pushing past its safe absorption limit without chemical oxidizers?' },
            { label: '🔥 CRUST & STEAM VENTING', prompt: 'Diagnose my baguette crust: blisters, color, thickness, and crunch. How should I adjust my oven steam setup (lava rocks/ice) and the 10-minute steam venting timing?' }
        ],
        boule: [
            { label: '🔍 CRUMB & ALVEOLI (BOULE)', prompt: 'Analyze this sourdough boule / bâtard crumb. Evaluate openness, cell wall translucency, honeycombing, and check for signs of dense gummy streaks or fool\'s holes.' },
            { label: '🧺 BANNETON PROOF & POKE TEST', prompt: 'Evaluate my sourdough loaf in the banneton basket. Is it ready to bake or should I extend the cold retardation? How does the finger poke test rebound feel?' },
            { label: '🔪 EAR & CRESCENT SCORE (30°)', prompt: 'Evaluate the scoring cut on this boule/bâtard. Did the razor angle (target 30°) and depth (10mm) produce a prominent jagged ear (grigne) and belly burst?' },
            { label: '🍲 DUTCH OVEN STEAM & CRUST', prompt: 'Diagnose the blistering and crust caramelization on this sourdough boule. How can I optimize the lid-on steam phase (20 min) vs lid-off browning phase (25 min)?' },
            { label: '🥐 SHAPING & STITCH TENSION', prompt: 'Evaluate the surface tension and shape of my boule / bâtard. Did the envelope folding and stitching technique build adequate lateral support?' }
        ]
    };

    // Initialize App
    function init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
        }

        // Restore Format Mode
        currentFormatMode = localStorage.getItem('baguette_format_mode') || 'baguette';

        // Initialize Flour Profiles
        initFlourProfiles();

        // Load saved settings
        const savedKey = localStorage.getItem('baguette_gemini_key') || localStorage.getItem('ml_gemini_key') || '';
        DOM.geminiKey.value = savedKey;
        const savedModel = localStorage.getItem('baguette_gemini_model') || 'gemini-2.5-flash';
        selectedModel = savedModel;
        DOM.modelPreference.value = savedModel;
        updateModelUI(savedModel);

        if (!savedKey) {
            setTimeout(() => DOM.settingsModal.classList.remove('hidden'), 500);
        }

        // Apply Format Mode
        setFormatMode(currentFormatMode, false);

        // Initial Calculations
        updateHydrationUI();
        renderKBContent('10_SOURDOUGH_BOULE_AND_BATARD_MASTERY.md');
        calculateCoulage();
        bindEvents();
    }

    // Set Format Mode (Baguette vs Boule)
    function setFormatMode(mode, triggerRender = true) {
        currentFormatMode = mode;
        localStorage.setItem('baguette_format_mode', mode);

        DOM.btnFormatBaguette.classList.toggle('active', mode === 'baguette');
        DOM.btnFormatBoule.classList.toggle('active', mode === 'boule');

        if (mode === 'baguette') {
            DOM.telemetryFormat.textContent = 'BAGUETTE (COUCHE & LAME)';
            DOM.recipeFormatTitle.textContent = 'ARTISANAL BAGUETTES (COUCHE & LAME)';
            DOM.recipeFormatSubtitle.textContent = 'SCALED TO EXACT GRAMS WITH INTERACTIVE HYDRATION SLIDER';
            DOM.labelUnitCount.textContent = 'BAGUETTE COUNT:';
            currentLoavesCount = 3;
            currentFlourBasis = 500;
            currentRecipeId = 'sourdough';
        } else {
            DOM.telemetryFormat.textContent = 'SOURDOUGH BOULE (BANNETON & DUTCH OVEN)';
            DOM.recipeFormatTitle.textContent = 'SOURDOUGH HEARTH LOAVES (BANNETON & DUTCH OVEN)';
            DOM.recipeFormatSubtitle.textContent = 'SCALED TO EXACT GRAMS FOR CAST IRON DUTCH OVEN BAKING';
            DOM.labelUnitCount.textContent = 'BOULE / BÂTARD COUNT:';
            currentLoavesCount = 1;
            currentFlourBasis = 450;
            currentRecipeId = 'tartine_country';
        }

        DOM.displayLoaves.textContent = currentLoavesCount;
        DOM.inputFlourBasis.value = currentFlourBasis;

        renderQuickChips();
        renderRecipeTabs();

        if (triggerRender) {
            updateHydrationUI();
            renderRecipesTable();
        }
    }

    // Render Quick Prompt Chips
    function renderQuickChips() {
        DOM.quickChipsContainer.innerHTML = '';
        const chips = QUICK_CHIPS_DATA[currentFormatMode] || QUICK_CHIPS_DATA.baguette;
        chips.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'chip-btn';
            btn.textContent = c.label;
            btn.dataset.prompt = c.prompt;
            btn.addEventListener('click', () => {
                DOM.contextInput.value = c.prompt;
                DOM.contextInput.focus();
            });
            DOM.quickChipsContainer.appendChild(btn);
        });
    }

    // Render Recipe Tab Pills (Baguette vs Boule)
    function renderRecipeTabs() {
        DOM.recipeSelectorPills.innerHTML = '';
        const recipes = (currentFormatMode === 'baguette') ? RECIPES_BAGUETTE : RECIPES_BOULE;
        if (!recipes) return;

        recipes.forEach(r => {
            const btn = document.createElement('button');
            btn.className = `recipe-tab ${r.id === currentRecipeId ? 'active' : ''}`;
            btn.dataset.recipe = r.id;
            btn.textContent = r.title.split('(')[0].trim();
            btn.addEventListener('click', () => {
                DOM.recipeSelectorPills.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                currentRecipeId = r.id;
                renderRecipesTable();
            });
            DOM.recipeSelectorPills.appendChild(btn);
        });
    }

    // Flour Profiles Initialization
    function initFlourProfiles() {
        if (typeof FLOUR_PROFILES === 'undefined') return;

        [DOM.headerFlourSelector, DOM.recipeFlourSelector].forEach(select => {
            select.innerHTML = '';
            FLOUR_PROFILES.forEach(fp => {
                const opt = document.createElement('option');
                opt.value = fp.id;
                opt.textContent = `${fp.name} (${fp.protein}%)`;
                select.appendChild(opt);
            });
        });

        const savedFlourId = localStorage.getItem('baguette_active_flour') || 't65_bio';
        setFlourProfile(savedFlourId, false);
    }

    function setFlourProfile(flourId, syncSliders = true) {
        const fp = FLOUR_PROFILES.find(f => f.id === flourId) || FLOUR_PROFILES[0];
        activeFlour = Object.assign({}, fp);

        DOM.headerFlourSelector.value = flourId;
        DOM.recipeFlourSelector.value = flourId;
        DOM.inputProtein.value = activeFlour.protein;
        DOM.selectBio.value = activeFlour.is_bio ? 'true' : 'false';
        DOM.telemetryProtein.textContent = `${activeFlour.protein.toFixed(1)}%`;
        DOM.flourNotesBanner.innerHTML = `<strong>RHEOLOGY PROFILE:</strong> ${activeFlour.notes} | <em>Recommended Hydration: ${activeFlour.rec_hydration}% (Safe Limit: ${activeFlour.max_safe_hydration}%)</em>`;

        localStorage.setItem('baguette_active_flour', flourId);

        if (syncSliders) {
            currentHydration = (currentFormatMode === 'boule') ? Math.min(activeFlour.max_safe_hydration + 2, 76.0) : activeFlour.rec_hydration;
            DOM.sliderHydration.value = currentHydration;
        }

        updateHydrationUI();
        renderRecipesTable();
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
        // Format Switcher
        DOM.btnFormatBaguette.addEventListener('click', () => setFormatMode('baguette', true));
        DOM.btnFormatBoule.addEventListener('click', () => setFormatMode('boule', true));

        // Nav header clicks
        DOM.navPills.forEach(pill => {
            pill.addEventListener('click', () => switchTab(pill.dataset.tab));
        });

        // Flour synchronization
        DOM.headerFlourSelector.addEventListener('change', (e) => setFlourProfile(e.target.value, true));
        DOM.recipeFlourSelector.addEventListener('change', (e) => setFlourProfile(e.target.value, true));

        DOM.inputProtein.addEventListener('input', (e) => {
            const p = parseFloat(e.target.value);
            if (p && p >= 8.0 && p <= 18.0) {
                activeFlour.protein = p;
                DOM.telemetryProtein.textContent = `${p.toFixed(1)}%`;
                activeFlour.max_safe_hydration = parseFloat((p * 2.2 + 48.0).toFixed(1));
                updateHydrationUI();
                renderRecipesTable();
            }
        });

        DOM.selectBio.addEventListener('change', (e) => {
            activeFlour.is_bio = (e.target.value === 'true');
            if (activeFlour.is_bio) {
                activeFlour.max_safe_hydration = Math.min(activeFlour.max_safe_hydration, 75.0);
            }
            updateHydrationUI();
            renderRecipesTable();
        });

        // Hydration Slider Event
        DOM.sliderHydration.addEventListener('input', (e) => {
            currentHydration = parseFloat(e.target.value);
            updateHydrationUI();
            renderRecipesTable();
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

        // Analyze button
        DOM.btnAnalyze.addEventListener('click', analyzePhotos);
        DOM.btnClearResult.addEventListener('click', () => DOM.diagnosticPanel.classList.add('hidden'));

        // Stepper Controls
        DOM.btnDecLoaves.addEventListener('click', () => {
            if (currentLoavesCount > 1) {
                currentLoavesCount--;
                const flourPerUnit = (currentFormatMode === 'baguette') ? (500 / 3) : 450;
                currentFlourBasis = Math.round(currentLoavesCount * flourPerUnit);
                DOM.displayLoaves.textContent = currentLoavesCount;
                DOM.inputFlourBasis.value = currentFlourBasis;
                renderRecipesTable();
            }
        });

        DOM.btnIncLoaves.addEventListener('click', () => {
            currentLoavesCount++;
            const flourPerUnit = (currentFormatMode === 'baguette') ? (500 / 3) : 450;
            currentFlourBasis = Math.round(currentLoavesCount * flourPerUnit);
            DOM.displayLoaves.textContent = currentLoavesCount;
            DOM.inputFlourBasis.value = currentFlourBasis;
            renderRecipesTable();
        });

        DOM.inputFlourBasis.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val && val >= 100) {
                currentFlourBasis = val;
                const flourPerUnit = (currentFormatMode === 'baguette') ? (500 / 3) : 450;
                currentLoavesCount = Math.max(1, Math.round(val / flourPerUnit));
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

    // Hydration UI & Rheology Zone Feedback
    function updateHydrationUI() {
        DOM.valHydrationDisplay.textContent = `${currentHydration.toFixed(1)}%`;
        DOM.telemetryHydr.textContent = `${currentHydration.toFixed(1)}%`;

        if (!activeFlour) return;

        // Boules in a banneton tolerate ~2% higher hydration than free-standing baguettes
        const maxSafe = (currentFormatMode === 'boule') ? (activeFlour.max_safe_hydration + 2.5) : activeFlour.max_safe_hydration;
        const minSafe = activeFlour.min_safe_hydration;

        if (currentHydration > maxSafe) {
            DOM.hydrZoneBadge.className = 'badge-danger';
            DOM.hydrZoneBadge.textContent = `⚠️ DANGER: PUDDLE RISK! Exceeds safe limit for ${activeFlour.name} (${maxSafe.toFixed(1)}%). Risk of slumping & lost ear.`;
        } else if (currentHydration < minSafe) {
            DOM.hydrZoneBadge.className = 'badge-warning';
            DOM.hydrZoneBadge.textContent = `🟡 TIGHT / DRY ZONE (< ${minSafe}%). Crumb will be tight; dense hearth loaf.`;
        } else {
            DOM.hydrZoneBadge.className = 'badge-optimal';
            DOM.hydrZoneBadge.textContent = `🟢 OPTIMAL ZONE (${minSafe}% – ${maxSafe.toFixed(1)}%). Ideal for open alveoli, crisp ear & oven spring.`;
        }
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
                    contents: [{ parts: [{ text: "Ping. Reply with 'Artisan Bread Guru Uplink Online' only." }] }]
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

    // Build Guru System Context Prompt (Adapts to Baguette vs Boule!)
    function constructGuruPrompt(userQuery) {
        const formatDesc = (currentFormatMode === 'baguette')
            ? 'ARTISANAL BAGUETTES (Linen Couche Proofed, Elongated Hand Shaping, 5-7 Slashes, Open Stone Baked with Steam)'
            : 'SOURDOUGH BOULE / BÂTARD (Rattan Banneton Proofed, Round/Oval Tension Stitch Shaping, Single Curved Crescent Ear Slash, Cast Iron Dutch Oven Baked)';

        return `You are the World-Class Artisan Bread & Sourdough Guru, trained across INBP French viennoiserie and West Coast artisan sourdough traditions.
Your expertise is founded on the definitive synthesis of 9 major bread authorities:
1. Modernist Bread (Nathan Myhrvold & Francisco Migoya - A-Plus Baguette, Country Loaves, Parametric formulas, Steam physics)
2. Jean-Marie Lanio & Jérémy Ballester (*All About Baguette* - French T65, Pointage au bac, Couche techniques)
3. Chad Robertson (*Tartine Bread* - Basic Country Boule & Hybrid Baguettes)
4. Maurizio Leo (*The Perfect Loaf* - Sourdough Boules, Bâtards, Demi-baguettes)
5. Addie Roberts (*Secrets of Open Crumb* - Extensibility, protein quality, open alveoli)
6. Ken Forkish (*Flour Water Salt Yeast* - Dutch oven baking, Overnight Country Blonde)
7. King Arthur Baking Company (*Big Book of Bread*)
8. Teresa Greenway (*Discovering Sourdough*)
9. Apollonia Poilâne (*Poilâne*)

CURRENT BAKE FORMAT:
${formatDesc}

CURRENT INGREDIENT & FLOUR PARAMETERS CONFIGURED BY USER:
- ACTIVE FLOUR: ${activeFlour.name}
- PROTEIN CONTENT: ${activeFlour.protein}%
- ASH CONTENT / TYPE: ${activeFlour.ash}%
- ORGANIC / BIO STATUS: ${activeFlour.is_bio ? 'YES (Strictly NO chemical oxidizers/ascorbic acid, native enzymes only)' : 'NO (Conventional / Malted flour)'}
- TARGET HYDRATION DIALED IN: ${currentHydration.toFixed(1)}% (Recommended: ${activeFlour.rec_hydration}%, Safe Ceiling: ${activeFlour.max_safe_hydration}%)
- DOUGH BASE TEMPERATURE (*Coulage*): Target 23.5°C–24.5°C

DIAGNOSTIC DIRECTIVES:
When analyzing photos or troubleshooting:
1. ADAPT TO ACTIVE FORMAT (${currentFormatMode.toUpperCase()}):
   - If BOULE: Focus on banneton tension, ear development (grigne) from 30° crescent slash, Dutch oven steam retention (lid on 20 min), and open honeycomb crumb.
   - If BAGUETTE: Focus on elongation without tearing gluten, 5 overlapping cuts along centerline, couche linen folds, and thin crisp crust.
2. EVALUATE FLOUR RHEOLOGY: Explicitly judge if ${currentHydration}% hydration is appropriate for ${activeFlour.name} (${activeFlour.protein}% protein).
3. PROVIDE EXACT GRAMS & ACTIONABLE REMEDIES: Quote exact weights in grams and Baker's percentages, times, temperatures, and hand movements.

USER INQUIRY / CONTEXT:
"${userQuery || "Please examine my bread photos and current configuration. Provide a full master diagnostic report identifying defects, root causes, and exact corrective actions."}"`;
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

    // Dynamic Recipe Scaler & Ingredients Table (ALWAYS ADAPTS BAKER'S % TO EXACT GRAMS!)
    function renderRecipesTable() {
        const recipeList = (currentFormatMode === 'baguette') ? RECIPES_BAGUETTE : RECIPES_BOULE;
        if (!recipeList) return;

        const recipe = recipeList.find(r => r.id === currentRecipeId) || recipeList[0];

        const flourBasis = currentFlourBasis;
        const targetHydr = currentHydration;

        // Base water capped at 64% (or 66% for boules). Excess water is bassinage.
        const baseThreshold = (currentFormatMode === 'boule') ? 66.0 : 64.0;
        const baseWaterPct = Math.min(targetHydr, baseThreshold);
        const bassinageWaterPct = Math.max(0, targetHydr - baseWaterPct);

        const totalWaterGrams = Math.round(flourBasis * (targetHydr / 100));
        DOM.displayTotalWater.textContent = `${totalWaterGrams}g (${targetHydr.toFixed(1)}%)`;

        // Update portion estimate display
        const totalDoughGrams = flourBasis + totalWaterGrams + Math.round(flourBasis * 0.02) + Math.round(flourBasis * 0.002);
        const estWeight = Math.round(totalDoughGrams / Math.max(1, currentLoavesCount));
        DOM.displayPortionEstimate.textContent = `(~${estWeight}g each raw dough)`;

        DOM.recipeTableBody.innerHTML = '';

        let formulaRows = [];

        // Build Formula rows dynamically with EXACT GRAMS ALWAYS FRONT AND CENTER!
        if (currentFormatMode === 'baguette') {
            if (recipe.id === 'sourdough') {
                const levainFlour = flourBasis * 0.08;
                const mainFlour = flourBasis - levainFlour;
                const levainWater = flourBasis * 0.08;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - levainWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Dough)`, grams: Math.round(mainFlour), pct: 92.0, note: `Autolysed with base water for ${activeFlour.autolyse_min} min.` },
                    { item: 'Base Water (Mix / Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 8.0).toFixed(1), note: 'Adjusted to Coulage temperature. Develops gluten sheath.' },
                    { item: 'Young Liquid Levain (100% Hydr.)', grams: Math.round(flourBasis * 0.16), pct: 16.0, note: 'Built with active flour, 5h prior. Sweet yogurt lactic aroma.' },
                    { item: 'Bassinage Water (Late Addition)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Added with salt to open crumb alveoli without slumping.' },
                    { item: 'Fine Sea Salt', grams: Math.round(flourBasis * 0.02), pct: 2.0, note: 'Controls enzymatic breakdown and strengthens gluten.' }
                ];
            } else if (recipe.id === 'hybrid') {
                const prefermentFlour = flourBasis * 0.12;
                const mainFlour = flourBasis - prefermentFlour;
                const prefermentWater = flourBasis * 0.12;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - prefermentWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Dough)`, grams: Math.round(mainFlour), pct: 88.0, note: 'Autolysed without leavening.' },
                    { item: 'Base Water (Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 12.0).toFixed(1), note: 'Mix to shaggy mass; rest 45 min.' },
                    { item: 'Young Liquid Levain (100%)', grams: Math.round(flourBasis * 0.12), pct: 12.0, note: 'Tartine style young leaven for complex lactic aroma.' },
                    { item: 'Poolish (100% Hydration)', grams: Math.round(flourBasis * 0.12), pct: 12.0, note: '12h poolish for sweet wheat notes and extensibility.' },
                    { item: 'Bassinage Water (Late)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Dissolves yeast and salt; emulsified into dough.' },
                    { item: 'Instant Dry Yeast (Pinch)', grams: (flourBasis * 0.002).toFixed(1), pct: 0.2, note: 'Micro-dose commercial yeast for explosive ear opening.' },
                    { item: 'Fine Sea Salt', grams: Math.round(flourBasis * 0.02), pct: 2.0, note: 'Standard artisan dosage.' }
                ];
            } else if (recipe.id === 'poolish') {
                const poolishFlour = flourBasis * 0.30;
                const mainFlour = flourBasis - poolishFlour;
                const poolishWater = flourBasis * 0.30;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - poolishWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Dough)`, grams: Math.round(mainFlour), pct: 70.0, note: 'Blended with poolish and base water for 30 min autolyse.' },
                    { item: 'Base Water (Main Mix)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 30.0).toFixed(1), note: 'Calculated via Base Temperature Coulage formula.' },
                    { item: 'Overnight Poolish (100% Hydr.)', grams: Math.round(flourBasis * 0.60), pct: 60.0, note: 'Contains 150g flour + 150g water + 0.2g yeast per 500g.' },
                    { item: 'Bassinage Water (Late)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Added with salt and final yeast bump.' },
                    { item: 'Instant Dry Yeast (Final)', grams: (flourBasis * 0.0026).toFixed(1), pct: 0.26, note: 'Uniform gas generation during cold bulk.' },
                    { item: 'Fine Sea Salt', grams: Math.round(flourBasis * 0.02), pct: 2.0, note: 'Controls yeast motility.' }
                ];
            } else if (recipe.id === 'modernist_a_plus') {
                const toastedCornFlour = flourBasis * 0.022;
                const poolishFlour = flourBasis * 0.15;
                const levainFlour = flourBasis * 0.108;
                const mainFlour = flourBasis - (poolishFlour + levainFlour + toastedCornFlour);
                const prefermentWater = flourBasis * (0.15 + 0.108);
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - prefermentWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Flour)`, grams: Math.round(mainFlour), pct: 72.0, note: 'Modernist base flour.' },
                    { item: 'Toasted Corn Flour (Inclusion)', grams: Math.round(toastedCornFlour), pct: 2.2, note: 'Toasted 20m @ 175°C. Imparts sweet, nutty caramel Maillard notes.' },
                    { item: 'Base Water (Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 25.8).toFixed(1), note: 'Combined with flours and preferments for 30m autolyse.' },
                    { item: 'Poolish (100% Hydration)', grams: Math.round(flourBasis * 0.30), pct: 30.0, note: 'Extensibility and alpha-amylase sugar breakdown.' },
                    { item: 'Mature Liquid Levain', grams: Math.round(flourBasis * 0.216), pct: 21.6, note: 'Acidic strength and shelf-life extension.' },
                    { item: 'Bassinage Water (Late Addition)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Modernist delayed hydration method.' },
                    { item: 'Instant Dry Yeast', grams: (flourBasis * 0.005).toFixed(1), pct: 0.5, note: 'Rapid spring and high lift.' },
                    { item: 'Fine Salt', grams: Math.round(flourBasis * 0.02), pct: 2.0, note: 'Modernist standard.' }
                ];
            }
        } else {
            // BOULE & BÂTARD RECIPES
            if (recipe.id === 'tartine_country') {
                const levainFlour = flourBasis * 0.10;
                const mainFlour = flourBasis - levainFlour;
                const levainWater = flourBasis * 0.10;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - levainWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Flour)`, grams: Math.round(mainFlour), pct: 90.0, note: 'Autolysed with base water for 45 min.' },
                    { item: 'Base Water (Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 10.0).toFixed(1), note: 'Tepid water (26°C / 79°F).' },
                    { item: 'Young Liquid Leaven (100% Hydr.)', grams: Math.round(flourBasis * 0.20), pct: 20.0, note: 'Built young (1:5:5 or float stage). Sweet milky aroma.' },
                    { item: 'Bassinage Water (Late Addition)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Added with salt to open crumb alveoli.' },
                    { item: 'Fine Sea Salt', grams: Math.round(flourBasis * 0.02), pct: 2.0, note: 'Added after autolyse.' }
                ];
            } else if (recipe.id === 'leo_country') {
                const levainFlour = flourBasis * 0.08;
                const mainFlour = flourBasis - levainFlour;
                const levainWater = flourBasis * 0.08;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - levainWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Dough)`, grams: Math.round(mainFlour), pct: 92.0, note: 'Maurizio Leo high-hydration white base.' },
                    { item: 'Base Water (Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 8.0).toFixed(1), note: 'Rest 60 min at 24°C DDT.' },
                    { item: 'Ripe Liquid Levain', grams: Math.round(flourBasis * 0.16), pct: 16.0, note: 'Well aerated, domed, mild sour aroma.' },
                    { item: 'Bassinage Water (Mix 2)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Dissolves salt; worked in with slap-and-fold.' },
                    { item: 'Fine Sea Salt', grams: Math.round(flourBasis * 0.018), pct: 1.8, note: '1.8% fine sea salt standard.' }
                ];
            } else if (recipe.id === 'forkish_blonde') {
                const levainFlour = flourBasis * 0.108;
                const mainFlour = flourBasis - levainFlour;
                const levainWater = flourBasis * 0.108;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - levainWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Flour)`, grams: Math.round(mainFlour), pct: 89.2, note: 'Forkish pure levain blend.' },
                    { item: 'Water (Warm 34°C Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 10.8).toFixed(1), note: 'Warm water to sustain cool overnight fermentation.' },
                    { item: 'Mature Levain (FWSY)', grams: Math.round(flourBasis * 0.216), pct: 21.6, note: 'Ripe levain fed with active flour.' },
                    { item: 'Bassinage / Excess Water', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Folded in during hand mixing.' },
                    { item: 'Fine Sea Salt', grams: Math.round(flourBasis * 0.021), pct: 2.1, note: 'Pincer method incorporation.' }
                ];
            } else if (recipe.id === 'modernist_country') {
                const levainFlour = flourBasis * 0.10;
                const mainFlour = flourBasis - levainFlour;
                const levainWater = flourBasis * 0.10;
                const netBaseWater = Math.max(0, (flourBasis * (baseWaterPct / 100)) - levainWater);
                const bassinageWater = flourBasis * (bassinageWaterPct / 100);

                formulaRows = [
                    { item: `${activeFlour.name} (Main Flour)`, grams: Math.round(mainFlour), pct: 90.0, note: 'Modernist country blend.' },
                    { item: 'Base Water (Autolyse)', grams: Math.round(netBaseWater), pct: (baseWaterPct - 10.0).toFixed(1), note: 'Autolysed 40 min to shaggy mass.' },
                    { item: 'Mature Liquid Levain', grams: Math.round(flourBasis * 0.20), pct: 20.0, note: 'Controlled fermentation leaven.' },
                    { item: 'Bassinage Water (Late)', grams: Math.round(bassinageWater), pct: bassinageWaterPct.toFixed(1), note: 'Added with salt on medium speed.' },
                    { item: 'Fine Salt', grams: Math.round(flourBasis * 0.02), pct: 2.0, note: '2% standard.' }
                ];
            }
        }

        // Render Formula Rows (EXACT GRAMS IN BOLD HIGHLIGHT FIRST!)
        formulaRows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.item}</strong></td>
                <td><strong>${row.grams}g</strong></td>
                <td>${row.pct}%</td>
                <td>${row.note}</td>
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
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\|(.+)\|/g, (match) => {
                const cells = match.split('|').filter(c => c.trim().length > 0);
                if (cells.some(c => c.includes('---'))) return '';
                return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
            })
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '<br><br>');

        return html;
    }

    // Launch App
    document.addEventListener('DOMContentLoaded', init);
})();
