// BREAD GURU — Core Application Engine
// Dual Mode: Artisanal Baguettes & Sourdough Boules / Bâtards
// Dynamic Flour Profiler, Interactive Hydration Slider, Exact Grams,
// OG Book Recipes Library (25 Master Formulas from 9 Books), and Immersive Guided Baking Mode

(function() {
    'use strict';

    // Application State
    let currentFormatMode = 'baguette'; // 'baguette' | 'boule'
    let currentBase64Images = [];
    let selectedModel = 'gemini-2.5-flash';
    let currentRecipeId = 'modernist_a_plus';
    let currentFlourBasis = 500;
    let currentLoavesCount = 3;
    let currentHydration = 70.5;
    let activeFlour = null;

    // OG Literature Archive State
    let currentOgBookFilter = 'all';
    let currentOgRecipeId = 'og_modernist_a_plus';

    // Immersive Baking Mode State
    const bakingState = {
        recipe: null,
        stepIndex: 0,
        timerTotalSeconds: 1200,
        timerRemainingSeconds: 1200,
        timerRunning: false,
        timerInterval: null,
        timerEndTime: null,
        soundEnabled: true,
        alarmInterval: null
    };

    // DOM References
    const DOM = {
        // Format Switcher
        btnFormatBaguette: document.getElementById('btn-format-baguette'),
        btnFormatBoule: document.getElementById('btn-format-boule'),
        telemetryFormat: document.getElementById('telemetry-format'),
        recipeFormatTitle: document.getElementById('recipe-format-title'),
        recipeFormatSubtitle: document.getElementById('recipe-format-subtitle'),

        // Nav Tabs
        navDiagnose: document.getElementById('nav-diagnose'),
        navRecipes: document.getElementById('nav-recipes'),
        navOg: document.getElementById('nav-og'),
        navMethods: document.getElementById('nav-methods'),
        navPills: document.querySelectorAll('.nav-tab'),
        tabViews: document.querySelectorAll('.tab-view'),

        // Settings
        settingsBtn: document.getElementById('settings-btn'),

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
        pillarClear: document.getElementById('pillar-clear'),
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

        // Recipe Scaler (Tab 2)
        recipeSelectorPills: document.getElementById('recipe-selector-pills'),
        displayRecipeTitle: document.getElementById('display-recipe-title'),
        displayRecipeDesc: document.getElementById('display-recipe-desc'),
        btnStartBakingMode: document.getElementById('btn-start-baking-mode'),
        labelUnitCount: document.getElementById('label-unit-count'),
        btnDecLoaves: document.getElementById('btn-dec-loaves'),
        btnIncLoaves: document.getElementById('btn-inc-loaves'),
        displayLoaves: document.getElementById('display-loaves'),
        displayPortionEstimate: document.getElementById('display-portion-estimate'),
        inputFlourBasis: document.getElementById('input-flour-basis'),
        displayTotalWater: document.getElementById('display-total-water'),
        recipeTableBody: document.getElementById('recipe-table-body'),
        recipeStepsList: document.getElementById('recipe-steps-list'),

        // OG Book Recipes Archive (Tab 3)
        ogBookFilters: document.getElementById('og-book-filters'),
        ogRecipePills: document.getElementById('og-recipe-pills'),
        ogBookBadge: document.getElementById('og-book-badge'),
        ogRecipeTitle: document.getElementById('og-recipe-title'),
        ogRecipeMeta: document.getElementById('og-recipe-meta'),
        ogAuthorNotes: document.getElementById('og-author-notes'),
        ogRecipeTableBody: document.getElementById('og-recipe-table-body'),
        ogRecipeStepsList: document.getElementById('og-recipe-steps-list'),
        btnStartOgBakingMode: document.getElementById('btn-start-og-baking-mode'),

        // Methods / Knowledge Base View (Tab 4)
        kbChips: document.querySelectorAll('.kb-chip'),
        kbContent: document.getElementById('kb-markdown-content'),

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
        loaderText: document.getElementById('loader-text'),

        // Immersive Baking Mode
        bakingModeOverlay: document.getElementById('baking-mode-overlay'),
        bmRecipeName: document.getElementById('bm-recipe-name'),
        bmRecipeSpecs: document.getElementById('bm-recipe-specs'),
        bmSoundToggle: document.getElementById('bm-sound-toggle'),
        bmCloseBtn: document.getElementById('bm-close-btn'),
        bmProgressFill: document.getElementById('bm-progress-fill'),
        bmStepPills: document.getElementById('bm-step-pills'),
        bmStepBadge: document.getElementById('bm-step-badge'),
        bmStepCounter: document.getElementById('bm-step-counter'),
        bmStepTitle: document.getElementById('bm-step-title'),
        bmStepInstructions: document.getElementById('bm-step-instructions'),
        bmStepCues: document.getElementById('bm-step-cues'),
        bmTimerDisplay: document.getElementById('bm-timer-display'),
        bmTimerStatus: document.getElementById('bm-timer-status'),
        bmBtnSub5: document.getElementById('bm-btn-sub5'),
        bmBtnToggleTimer: document.getElementById('bm-btn-toggle-timer'),
        bmBtnAdd5: document.getElementById('bm-btn-add5'),
        bmBtnResetTimer: document.getElementById('bm-btn-reset-timer'),
        bmBtnPrev: document.getElementById('bm-btn-prev'),
        bmBtnComplete: document.getElementById('bm-btn-complete'),
        bmAlarmModal: document.getElementById('bm-alarm-modal'),
        bmAlarmTitle: document.getElementById('bm-alarm-title'),
        bmAlarmDesc: document.getElementById('bm-alarm-desc'),
        bmBtnDismissAlarm: document.getElementById('bm-btn-dismiss-alarm')
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

        // Initial Calculations & OG View
        updateHydrationUI();
        renderKBContent('10_SOURDOUGH_BOULE_AND_BATARD_MASTERY.md');
        renderOgBookFilters();
        renderOgRecipePills();
        renderOgRecipeView();
        bindEvents();
    }

    // Set Format Mode (Baguette vs Boule)
    function setFormatMode(mode, triggerRender = true) {
        currentFormatMode = mode;
        localStorage.setItem('baguette_format_mode', mode);

        DOM.btnFormatBaguette.classList.toggle('active', mode === 'baguette');
        DOM.btnFormatBoule.classList.toggle('active', mode === 'boule');

        const recipeList = (mode === 'baguette') ? RECIPES_BAGUETTE : RECIPES_BOULE;

        if (mode === 'baguette') {
            DOM.telemetryFormat.textContent = 'Baguette (Couche)';
            DOM.recipeFormatTitle.textContent = 'Artisanal Baguettes';
            DOM.recipeFormatSubtitle.textContent = 'Curated master formulas from 9 texts scaled to exact grams with interactive hydration';
            DOM.labelUnitCount.textContent = 'BAGUETTE COUNT:';
            currentLoavesCount = 3;
            currentFlourBasis = 500;
            currentRecipeId = recipeList[0]?.id || 'modernist_a_plus';
            currentHydration = recipeList[0]?.base_hydration || 70.5;
            currentOgRecipeId = 'og_modernist_a_plus';
        } else {
            DOM.telemetryFormat.textContent = 'Sourdough Boule (Dutch Oven)';
            DOM.recipeFormatTitle.textContent = 'Sourdough Hearth Loaves (Boules & Bâtards)';
            DOM.recipeFormatSubtitle.textContent = 'Authoritative hearth formulas from Tartine, The Perfect Loaf, FWSY, and Modernist Bread';
            DOM.labelUnitCount.textContent = 'BOULE / BÂTARD COUNT:';
            currentLoavesCount = 1;
            currentFlourBasis = 450;
            currentRecipeId = recipeList[0]?.id || 'tartine_country';
            currentHydration = recipeList[0]?.base_hydration || 75.0;
            currentOgRecipeId = 'og_tartine_country';
        }

        DOM.sliderHydration.value = currentHydration;
        DOM.displayLoaves.textContent = currentLoavesCount;
        DOM.inputFlourBasis.value = currentFlourBasis;

        renderQuickChips();
        renderRecipeTabs();
        renderOgRecipePills();
        renderOgRecipeView();

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

    // Render Recipe Tab Pills for Interactive Scaler (Tab 2)
    function renderRecipeTabs() {
        DOM.recipeSelectorPills.innerHTML = '';
        const recipes = (currentFormatMode === 'baguette') ? RECIPES_BAGUETTE : RECIPES_BOULE;
        if (!recipes) return;

        recipes.forEach(r => {
            const btn = document.createElement('button');
            const isActive = (r.id === currentRecipeId);
            btn.className = `recipe-pill-btn ${isActive ? 'active' : ''}`;
            btn.dataset.recipe = r.id;
            
            const cleanTitle = r.title.replace(/^(Modernist Bread|Jean-Marie Lanio|Chad Robertson|Maurizio Leo|Ken Forkish|King Arthur|Apollonia Poilâne|Teresa Greenway):\s*/i, '');
            btn.innerHTML = `<strong>${cleanTitle}</strong> <small style="opacity: 0.8; font-size: 10px; margin-left: 4px;">(${r.author?.split('&')[0]?.split(' ')[0] || ''})</small>`;

            btn.addEventListener('click', () => {
                DOM.recipeSelectorPills.querySelectorAll('.recipe-pill-btn').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                currentRecipeId = r.id;
                
                if (r.base_hydration) {
                    currentHydration = r.base_hydration;
                    DOM.sliderHydration.value = currentHydration;
                    updateHydrationUI();
                }

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

        DOM.inputProtein.addEventListener('change', (e) => {
            activeFlour.protein = parseFloat(e.target.value) || 11.5;
            DOM.telemetryProtein.textContent = `${activeFlour.protein.toFixed(1)}%`;
            updateHydrationUI();
            renderRecipesTable();
        });

        DOM.selectBio.addEventListener('change', (e) => {
            activeFlour.is_bio = (e.target.value === 'true');
            updateHydrationUI();
            renderRecipesTable();
        });

        // Hydration Slider Event
        DOM.sliderHydration.addEventListener('input', (e) => {
            currentHydration = parseFloat(e.target.value);
            updateHydrationUI();
            renderRecipesTable();
        });

        // Navigation / Header buttons
        DOM.settingsBtn?.addEventListener('click', () => DOM.settingsModal?.classList.remove('hidden'));
        DOM.pillarClear?.addEventListener('click', clearInputs);

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

        // ======================================================================
        // BAKING MODE EVENT BINDINGS
        // ======================================================================
        DOM.btnStartBakingMode?.addEventListener('click', () => {
            const recipeList = (currentFormatMode === 'baguette') ? RECIPES_BAGUETTE : RECIPES_BOULE;
            const r = recipeList.find(x => x.id === currentRecipeId) || recipeList[0];
            startBakingMode(r);
        });

        DOM.btnStartOgBakingMode?.addEventListener('click', () => {
            if (typeof OG_RECIPES === 'undefined') return;
            const ogR = OG_RECIPES.find(x => x.id === currentOgRecipeId) || OG_RECIPES[0];
            startBakingMode(ogR);
        });

        DOM.bmCloseBtn?.addEventListener('click', exitBakingMode);
        DOM.bmSoundToggle?.addEventListener('click', toggleBakingSound);
        DOM.bmBtnToggleTimer?.addEventListener('click', toggleTimer);
        DOM.bmBtnSub5?.addEventListener('click', () => adjustTimer(-300));
        DOM.bmBtnAdd5?.addEventListener('click', () => adjustTimer(300));
        DOM.bmBtnResetTimer?.addEventListener('click', resetTimer);
        DOM.bmBtnPrev?.addEventListener('click', prevBakingStep);
        DOM.bmBtnComplete?.addEventListener('click', nextBakingStep);
        DOM.bmBtnDismissAlarm?.addEventListener('click', dismissAlarmAndAdvance);
    }

    // Hydration UI & Rheology Zone Feedback
    function updateHydrationUI() {
        DOM.valHydrationDisplay.textContent = `${currentHydration.toFixed(1)}%`;
        DOM.telemetryHydr.textContent = `${currentHydration.toFixed(1)}%`;

        if (!activeFlour) return;

        const rec = activeFlour.rec_hydration;
        const maxSafe = activeFlour.max_safe_hydration;
        const badge = DOM.hydrZoneBadge;

        if (currentHydration < 66.0) {
            badge.textContent = "STIFF / FIRM (Crisp Skin, Fine Alveoli)";
            badge.className = "zone-badge zone-optimal";
            badge.style.color = "#38bdf8";
        } else if (currentHydration <= rec + 1.0) {
            badge.textContent = `OPTIMAL FOR ${activeFlour.name.toUpperCase()} (High Extensibility, Honeycombed Crumb)`;
            badge.className = "zone-badge zone-optimal";
            badge.style.color = "#34d399";
        } else if (currentHydration <= maxSafe) {
            badge.textContent = "HIGH HYDRATION (Bassinage Required; Handle Gently to Avoid Slumping)";
            badge.className = "zone-badge zone-warning";
            badge.style.color = "#fb923c";
        } else {
            badge.textContent = "CRITICAL HYDRATION WARNING (Exceeds Native Protein Capacity - Risk of Flat Loaf)";
            badge.className = "zone-badge zone-warning";
            badge.style.color = "#f87171";
        }
    }

    // Handle Image Selection & Downscaling
    async function handleImageFiles(fileList) {
        if (!fileList || fileList.length === 0) return;

        DOM.loaderOverlay.classList.remove('hidden');
        DOM.loaderText.textContent = 'Processing & optimizing photos...';

        try {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (!file.type.startsWith('image/')) continue;
                const b64 = await resizeImageToBase64(file, 1600, 0.85);
                currentBase64Images.push(b64);
            }
            updateImagePreviews();
        } catch (err) {
            alert('Failed to process image: ' + err.message);
        } finally {
            DOM.loaderOverlay.classList.add('hidden');
        }
    }

    function resizeImageToBase64(file, maxDimension, quality) {
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
                item.className = 'preview-thumb-box';
                item.innerHTML = `
                    <img src="data:image/jpeg;base64,${b64}">
                    <button class="preview-remove-btn" data-idx="${idx}">&times;</button>
                `;
                DOM.previewContainer.appendChild(item);
            });

            DOM.previewContainer.querySelectorAll('.preview-remove-btn').forEach(btn => {
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
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        };

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errJson = await resp.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `Gemini API returned HTTP ${resp.status}`);
        }

        const data = await resp.json();
        return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }

    // Analyze Photos (Multimodal Diagnostic Engine)
    async function analyzePhotos() {
        const userPrompt = DOM.contextInput.value.trim();
        if (!userPrompt && currentBase64Images.length === 0) {
            alert('Please take or upload a photo, or write a question / select a diagnostic topic.');
            return;
        }

        DOM.loaderOverlay.classList.remove('hidden');
        DOM.loaderText.textContent = `Consulting Bread Guru (${selectedModel.toUpperCase()})...`;

        try {
            let systemContext = `YOU ARE BREAD GURU, an elite master baker specializing in artisanal French baguettes and sourdough hearth loaves (boules & bâtards).
You have deep mastery over the 9 foundational texts in your knowledge base: Modernist Bread (Myhrvold/Migoya), All About Baguette (Jean-Marie Lanio), Tartine Bread (Chad Robertson), The Perfect Loaf (Maurizio Leo), Flour Water Salt Yeast (Ken Forkish), Secrets of Open Crumb (Addie Roberts), Poilâne (Apollonia Poilâne), King Arthur Big Book of Bread, and Discovering Sourdough (Teresa Greenway).

CURRENT TELEMETRY & PHYSICAL CONDITIONS:
- ACTIVE BAKE FORMAT: ${currentFormatMode.toUpperCase()}
- ACTIVE FLOUR: ${activeFlour.name} (${activeFlour.protein}% Protein, ${activeFlour.ash}% Ash, Bio: ${activeFlour.is_bio})
- TARGET HYDRATION: ${currentHydration.toFixed(1)}% (Base: ${Math.min(currentHydration, 64)}%, Bassinage: ${Math.max(0, currentHydration - 64).toFixed(1)}%)
- SELECTED RECIPE: ${currentRecipeId}
- SCALED FLOUR BASIS: ${currentFlourBasis}g (${currentLoavesCount} loaves)

DIAGNOSTIC INSTRUCTIONS:
1. Examine any attached photos carefully. Inspect crumb alveolation (openness, distribution, cell wall translucency, honeycombing vs gumminess), crust color, blistering, ear (grigne) angle, bloom, or bulk dough tension.
2. Directly answer the user's prompt: "${userPrompt || 'Analyze and diagnose my bake based on visual cues.'}"
3. Ground your diagnosis in the physical principles of fermentation kinetics, hydration thresholds for this specific flour, enzymatic degradation, and steam mechanics.
4. Provide immediate, actionable adjustments for their next bake. Format in clean, readable markdown with bold key takeaways.`;

            const reply = await queryGemini(selectedModel, systemContext, currentBase64Images);

            DOM.diagnosticPanel.classList.remove('hidden');
            DOM.diagnosticContent.innerHTML = parseSimpleMarkdown(reply);
            DOM.diagnosticPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            alert('Analysis Error: ' + err.message);
        } finally {
            DOM.loaderOverlay.classList.add('hidden');
        }
    }

    // Test Gemini Key
    async function testGeminiConnection() {
        const key = DOM.geminiKey.value.trim();
        const model = DOM.modelPreference.value;
        if (!key) {
            DOM.settingsStatus.className = 'status-alert error';
            DOM.settingsStatus.textContent = 'Please enter an API key.';
            return;
        }

        DOM.settingsStatus.className = 'status-alert';
        DOM.settingsStatus.textContent = 'Testing connection...';

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'Respond with: "Connection successful."' }] }] })
            });

            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                throw new Error(e.error?.message || `HTTP ${res.status}`);
            }

            DOM.settingsStatus.className = 'status-alert success';
            DOM.settingsStatus.textContent = 'Connection verified! Key is active and valid.';
        } catch (e) {
            DOM.settingsStatus.className = 'status-alert error';
            DOM.settingsStatus.textContent = `Connection failed: ${e.message}`;
        }
    }

    // ==========================================================================
    // TAB 2: INTERACTIVE RECIPES & KITCHEN SCALE RENDERER
    // ==========================================================================
    function renderRecipesTable() {
        const recipeList = (currentFormatMode === 'baguette') ? RECIPES_BAGUETTE : RECIPES_BOULE;
        if (!recipeList || recipeList.length === 0) return;

        const recipe = recipeList.find(r => r.id === currentRecipeId) || recipeList[0];
        currentRecipeId = recipe.id;

        DOM.displayRecipeTitle.textContent = recipe.title;
        DOM.displayRecipeDesc.textContent = `${recipe.subtitle} [${recipe.book || recipe.author || ''}]`;

        const flourBasis = currentFlourBasis;
        const targetHydr = currentHydration;

        const baseThreshold = (currentFormatMode === 'boule') ? 66.0 : 64.0;
        const baseWaterPct = Math.min(targetHydr, baseThreshold);
        const bassinageWaterPct = Math.max(0, targetHydr - baseWaterPct);

        const totalWaterGrams = Math.round(flourBasis * (targetHydr / 100));
        DOM.displayTotalWater.textContent = `${totalWaterGrams}g (${targetHydr.toFixed(1)}%)`;

        DOM.recipeTableBody.innerHTML = '';
        let formulaRows = [];
        let totalDoughWeight = 0;

        if (recipe.ingredients && recipe.ingredients.length > 0) {
            let prefermentWaterPct = 0;
            recipe.ingredients.forEach(ing => {
                if (ing.water_pct) prefermentWaterPct += ing.water_pct;
            });

            const netBaseWaterPct = Math.max(0, baseWaterPct - prefermentWaterPct);

            formulaRows = recipe.ingredients.map(ing => {
                let grams = 0;
                let note = ing.note || '';

                if (ing.type === 'flour_main') {
                    grams = Math.round(flourBasis * (ing.pct / 100));
                    return {
                        item: `${activeFlour.name} (Main Dough)`,
                        grams: grams,
                        pct: ing.pct.toFixed(1),
                        note: `Autolysed with base water for ${activeFlour.autolyse_min} min.`
                    };
                } else if (ing.type === 'water_base') {
                    grams = Math.round(flourBasis * (netBaseWaterPct / 100));
                    return {
                        item: 'Base Water (Autolyse / Mix)',
                        grams: grams,
                        pct: netBaseWaterPct.toFixed(1),
                        note: 'At room / ambient temp. Deducts pre-ferment water.'
                    };
                } else if (ing.type === 'water_bassinage') {
                    grams = Math.round(flourBasis * (bassinageWaterPct / 100));
                    return {
                        item: 'Bassinage Water (Late Addition)',
                        grams: grams,
                        pct: bassinageWaterPct.toFixed(1),
                        note: (bassinageWaterPct > 0) ? 'Held back from autolyse; added with salt to hydrate without slumping.' : 'Zero bassinage required at this hydration.'
                    };
                } else if (ing.type === 'yeast') {
                    grams = (flourBasis * (ing.pct / 100)).toFixed(1);
                    return { item: ing.name, grams: grams, pct: ing.pct.toFixed(2), note: note };
                } else {
                    grams = Math.round(flourBasis * (ing.pct / 100));
                    return { item: ing.name, grams: grams, pct: ing.pct.toFixed(1), note: note };
                }
            });

            totalDoughWeight = formulaRows.reduce((sum, row) => sum + parseFloat(row.grams), 0);
        }

        const estWeight = Math.round(totalDoughWeight / Math.max(1, currentLoavesCount));
        DOM.displayPortionEstimate.textContent = `(~${estWeight}g each raw dough)`;

        formulaRows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.item}</strong></td>
                <td class="col-grams">${row.grams}g</td>
                <td class="col-pct">${row.pct}%</td>
                <td><small>${row.note}</small></td>
            `;
            DOM.recipeTableBody.appendChild(tr);
        });

        DOM.recipeStepsList.innerHTML = '';
        if (recipe.steps && recipe.steps.length > 0) {
            recipe.steps.forEach((step, idx) => {
                const card = document.createElement('div');
                card.className = 'phase-step-item';
                card.innerHTML = `
                    <div class="phase-step-header">
                        <span class="phase-step-name">Phase ${idx + 1}: ${step.title}</span>
                        <span class="phase-step-time">${step.time || ''}</span>
                    </div>
                    <p class="phase-step-desc">${step.text}</p>
                    ${step.cues ? `<div class="flour-advice-callout" style="margin-top: 8px; padding: 6px 10px;"><strong>SENSORY CUE:</strong> ${step.cues}</div>` : ''}
                `;
                DOM.recipeStepsList.appendChild(card);
            });
        }
    }

    // ==========================================================================
    // TAB 3: OG BOOK RECIPES (ORIGINAL LITERATURE ARCHIVE)
    // ==========================================================================
    const OG_BOOK_LIST = [
        { id: 'all', label: 'All Literature (25)' },
        { id: 'modernist', label: 'Modernist Bread' },
        { id: 'tartine', label: 'Tartine Bread' },
        { id: 'lanio', label: 'All About Baguette (Lanio)' },
        { id: 'perfect_loaf', label: 'The Perfect Loaf (Leo)' },
        { id: 'forkish', label: 'FWSY (Ken Forkish)' },
        { id: 'poilane', label: 'Poilâne' },
        { id: 'king_arthur', label: 'King Arthur' },
        { id: 'greenway', label: 'Discovering Sourdough' }
    ];

    function renderOgBookFilters() {
        if (!DOM.ogBookFilters) return;
        DOM.ogBookFilters.innerHTML = '';

        OG_BOOK_LIST.forEach(b => {
            const btn = document.createElement('button');
            btn.className = `kb-chip ${b.id === currentOgBookFilter ? 'active' : ''}`;
            btn.textContent = b.label;
            btn.addEventListener('click', () => {
                DOM.ogBookFilters.querySelectorAll('.kb-chip').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                currentOgBookFilter = b.id;
                renderOgRecipePills();
                renderOgRecipeView();
            });
            DOM.ogBookFilters.appendChild(btn);
        });
    }

    function renderOgRecipePills() {
        if (!DOM.ogRecipePills || typeof OG_RECIPES === 'undefined') return;
        DOM.ogRecipePills.innerHTML = '';

        // Filter by book filter AND active format mode (baguette vs boule)
        let filtered = OG_RECIPES.filter(r => r.format === currentFormatMode);
        if (currentOgBookFilter !== 'all') {
            filtered = filtered.filter(r => r.book_id === currentOgBookFilter);
        }

        if (filtered.length === 0) {
            DOM.ogRecipePills.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); padding: 6px 0;">No recipes in this format from this book. Switch book filter or bake format above.</span>';
            return;
        }

        // Ensure active recipe is valid
        if (!filtered.some(r => r.id === currentOgRecipeId)) {
            currentOgRecipeId = filtered[0].id;
        }

        filtered.forEach(r => {
            const btn = document.createElement('button');
            const isActive = (r.id === currentOgRecipeId);
            btn.className = `recipe-pill-btn ${isActive ? 'active' : ''}`;
            btn.innerHTML = `<strong>${r.title}</strong> <small style="opacity: 0.8; font-size: 10px; margin-left: 4px;">(${r.book})</small>`;
            btn.addEventListener('click', () => {
                DOM.ogRecipePills.querySelectorAll('.recipe-pill-btn').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                currentOgRecipeId = r.id;
                renderOgRecipeView();
            });
            DOM.ogRecipePills.appendChild(btn);
        });
    }

    function renderOgRecipeView() {
        if (typeof OG_RECIPES === 'undefined') return;
        const recipe = OG_RECIPES.find(r => r.id === currentOgRecipeId) || OG_RECIPES[0];
        if (!recipe) return;

        DOM.ogBookBadge.textContent = recipe.book;
        DOM.ogRecipeTitle.textContent = recipe.title;
        DOM.ogRecipeMeta.textContent = `${recipe.author} • ${recipe.citation}`;
        DOM.ogAuthorNotes.innerHTML = recipe.author_notes || 'Authentic unadulterated formula directly transcribed from original source literature.';

        // Formula Table
        DOM.ogRecipeTableBody.innerHTML = '';
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ing => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${ing.name}</strong></td>
                    <td class="col-grams">${ing.weight}</td>
                    <td class="col-pct">${ing.pct}%</td>
                    <td><small>${ing.note || ''}</small></td>
                `;
                DOM.ogRecipeTableBody.appendChild(tr);
            });
        }

        // Method Steps
        DOM.ogRecipeStepsList.innerHTML = '';
        if (recipe.steps && recipe.steps.length > 0) {
            recipe.steps.forEach((step, idx) => {
                const card = document.createElement('div');
                card.className = 'phase-step-item';
                card.innerHTML = `
                    <div class="phase-step-header">
                        <span class="phase-step-name">Phase ${idx + 1}: ${step.title}</span>
                        <span class="phase-step-time">${step.time || ''}</span>
                    </div>
                    <p class="phase-step-desc">${step.text}</p>
                    ${step.cues ? `<div class="flour-advice-callout" style="margin-top: 8px; padding: 6px 10px;"><strong>SENSORY CUE:</strong> ${step.cues}</div>` : ''}
                `;
                DOM.ogRecipeStepsList.appendChild(card);
            });
        }
    }

    // ==========================================================================
    // IMMERSIVE GUIDED BAKING MODE ENGINE (With Precision Alarms & Synthesizer)
    // ==========================================================================
    function startBakingMode(recipe) {
        if (!recipe || !recipe.steps || recipe.steps.length === 0) {
            alert('Please select a recipe with method steps to begin Baking Mode.');
            return;
        }

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }

        bakingState.recipe = recipe;
        bakingState.stepIndex = 0;

        DOM.bmRecipeName.textContent = recipe.title;
        DOM.bmRecipeSpecs.textContent = `${recipe.book || ''} • ${recipe.author || ''} • Target Hydr: ${recipe.base_hydration || 70}%`;

        DOM.bakingModeOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        loadBakingStep(0);
    }

    function exitBakingMode() {
        pauseTimer();
        dismissAlarm();
        DOM.bakingModeOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function toggleBakingSound() {
        bakingState.soundEnabled = !bakingState.soundEnabled;
        DOM.bmSoundToggle.textContent = bakingState.soundEnabled ? '🔔' : '🔕';
        DOM.bmSoundToggle.title = bakingState.soundEnabled ? 'Alarm Sound: Enabled' : 'Alarm Sound: Muted';
    }

    function loadBakingStep(idx) {
        const steps = bakingState.recipe.steps;
        if (idx < 0 || idx >= steps.length) return;

        pauseTimer();
        dismissAlarm();

        bakingState.stepIndex = idx;
        const step = steps[idx];

        const progressPct = Math.round(((idx + 1) / steps.length) * 100);
        DOM.bmProgressFill.style.width = `${progressPct}%`;

        DOM.bmStepPills.innerHTML = '';
        steps.forEach((s, sIdx) => {
            const btn = document.createElement('button');
            btn.className = `bm-step-pill-btn ${sIdx === idx ? 'active' : ''} ${sIdx < idx ? 'completed' : ''}`;
            btn.textContent = `${sIdx < idx ? '✓ ' : ''}${sIdx + 1}. ${s.title.split('(')[0].trim()}`;
            btn.addEventListener('click', () => loadBakingStep(sIdx));
            DOM.bmStepPills.appendChild(btn);
        });

        DOM.bmStepBadge.textContent = step.phase ? `PHASE: ${step.phase.toUpperCase()}` : `STEP ${idx + 1}`;
        DOM.bmStepCounter.textContent = `Step ${idx + 1} of ${steps.length}`;
        DOM.bmStepTitle.textContent = step.title;
        DOM.bmStepInstructions.textContent = step.text;
        DOM.bmStepCues.textContent = step.cues || 'Follow tactile cues and dough temperature specifications.';

        DOM.bmBtnPrev.disabled = (idx === 0);
        DOM.bmBtnComplete.textContent = (idx === steps.length - 1) ? 'Finish Bake 🎉' : 'Complete & Next Step ▶';

        bakingState.timerTotalSeconds = step.timer_seconds || 1200;
        bakingState.timerRemainingSeconds = bakingState.timerTotalSeconds;
        updateTimerDisplay();
        DOM.bmTimerStatus.textContent = `Timer Ready (${step.time || formatMinutes(bakingState.timerTotalSeconds)}) • Alarm Active`;
    }

    function prevBakingStep() {
        if (bakingState.stepIndex > 0) {
            loadBakingStep(bakingState.stepIndex - 1);
        }
    }

    function nextBakingStep() {
        const steps = bakingState.recipe.steps;
        if (bakingState.stepIndex < steps.length - 1) {
            loadBakingStep(bakingState.stepIndex + 1);
        } else {
            alert('🎉 Congratulations! You have completed all baking steps for this master formula!');
            exitBakingMode();
        }
    }

    // ==========================================================================
    // TIMER ENGINE (Background-Safe with Timestamp Calculations)
    // ==========================================================================
    function toggleTimer() {
        if (bakingState.timerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        if (bakingState.timerRemainingSeconds <= 0) {
            bakingState.timerRemainingSeconds = bakingState.timerTotalSeconds;
        }

        bakingState.timerRunning = true;
        bakingState.timerEndTime = Date.now() + (bakingState.timerRemainingSeconds * 1000);

        DOM.bmBtnToggleTimer.textContent = 'PAUSE TIMER';
        DOM.bmBtnToggleTimer.classList.add('running');
        DOM.bmTimerStatus.textContent = 'Timer Running...';

        if (bakingState.timerInterval) clearInterval(bakingState.timerInterval);

        bakingState.timerInterval = setInterval(() => {
            const now = Date.now();
            const diffSeconds = Math.max(0, Math.round((bakingState.timerEndTime - now) / 1000));
            bakingState.timerRemainingSeconds = diffSeconds;
            updateTimerDisplay();

            if (diffSeconds <= 0) {
                pauseTimer();
                triggerAlarm();
            }
        }, 250);
    }

    function pauseTimer() {
        bakingState.timerRunning = false;
        if (bakingState.timerInterval) {
            clearInterval(bakingState.timerInterval);
            bakingState.timerInterval = null;
        }
        DOM.bmBtnToggleTimer.textContent = 'START TIMER';
        DOM.bmBtnToggleTimer.classList.remove('running');
        DOM.bmTimerStatus.textContent = 'Timer Paused';
    }

    function resetTimer() {
        pauseTimer();
        bakingState.timerRemainingSeconds = bakingState.timerTotalSeconds;
        updateTimerDisplay();
        DOM.bmTimerStatus.textContent = 'Timer Reset';
    }

    function adjustTimer(deltaSeconds) {
        bakingState.timerRemainingSeconds = Math.max(0, bakingState.timerRemainingSeconds + deltaSeconds);
        if (bakingState.timerRunning) {
            bakingState.timerEndTime = Date.now() + (bakingState.timerRemainingSeconds * 1000);
        }
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const s = bakingState.timerRemainingSeconds;
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        DOM.bmTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatMinutes(seconds) {
        const m = Math.round(seconds / 60);
        return `${m} min`;
    }

    // ==========================================================================
    // AUDIO CHIME SYNTHESIZER & ALARM (Web Audio API, Vibration, Notification)
    // ==========================================================================
    function playAlarmChime() {
        if (!bakingState.soundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const notes = [587.33, 880.00, 1174.66, 1760.00];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (i * 0.12));
                gain.gain.setValueAtTime(0.28, ctx.currentTime + (i * 0.12));
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i * 0.12) + 0.7);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + (i * 0.12));
                osc.stop(ctx.currentTime + (i * 0.12) + 0.8);
            });
        } catch (e) {
            console.warn('AudioContext chime error:', e);
        }
    }

    function triggerAlarm() {
        const step = bakingState.recipe.steps[bakingState.stepIndex];
        DOM.bmAlarmTitle.textContent = `Time Up: ${step.title}!`;
        DOM.bmAlarmDesc.textContent = `Phase "${step.title}" is complete. ${step.cues || 'Proceed to the next baking step.'}`;
        DOM.bmAlarmModal.classList.remove('hidden');

        playAlarmChime();
        if (bakingState.alarmInterval) clearInterval(bakingState.alarmInterval);
        bakingState.alarmInterval = setInterval(playAlarmChime, 2500);

        if ('vibrate' in navigator) {
            try { navigator.vibrate([300, 150, 300, 150, 500]); } catch (e) {}
        }

        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification('Bread Guru — Step Complete!', {
                    body: `${step.title}: ${step.cues || 'Time for the next baking step.'}`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🥖</text></svg>'
                });
            } catch (e) {}
        }
    }

    function dismissAlarm() {
        DOM.bmAlarmModal.classList.add('hidden');
        if (bakingState.alarmInterval) {
            clearInterval(bakingState.alarmInterval);
            bakingState.alarmInterval = null;
        }
    }

    function dismissAlarmAndAdvance() {
        dismissAlarm();
        nextBakingStep();
    }

    // ==========================================================================
    // KNOWLEDGE BASE VIEWER
    // ==========================================================================
    function renderKBContent(docName) {
        if (typeof BAGUETTE_KB === 'undefined' || !BAGUETTE_KB[docName]) {
            DOM.kbContent.innerHTML = `<p>Module ${docName} not loaded.</p>`;
            return;
        }
        DOM.kbContent.innerHTML = parseSimpleMarkdown(BAGUETTE_KB[docName]);
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
