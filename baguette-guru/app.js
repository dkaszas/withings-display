// BREAD GURU — Core Application Engine
// Dual Mode: Artisanal Baguettes & Sourdough Boules / Bâtards
// Dynamic Flour Profiler, Interactive Hydration Slider, Exact Grams,
// Unified Master Formulations & Authentic Literature Archive (52 Master Formulas),
// and Immersive Guided Baking Mode with Alarms

(function() {
    'use strict';

    // Application State
    let currentFormatMode = 'baguette'; // 'baguette' | 'boule'
    let currentBase64Images = [];
    let selectedModel = 'gemini-2.5-flash';
    let currentRecipeId = 'modernist_a_plus';
    let currentSourceFilter = 'all';
    let currentFlourBasis = 500;
    let currentLoavesCount = 3;
    let currentHydration = 70.5;
    let activeFlour = null;

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
        navMethods: document.getElementById('nav-methods'),
        navPills: document.querySelectorAll('.nav-tab'),
        tabViews: document.querySelectorAll('.tab-view'),

        // Settings
        settingsBtn: document.getElementById('settings-btn'),
        settingsModal: document.getElementById('settings-modal'),
        btnCloseSettings: document.getElementById('btn-close-settings'),
        btnSaveSettings: document.getElementById('btn-save-settings'),
        geminiKey: document.getElementById('gemini-key'),
        modelPreference: document.getElementById('model-preference'),
        settingsStatus: document.getElementById('settings-status'),
        btnTestKey: document.getElementById('btn-test-key'),

        // Telemetry
        headerFlourSelector: document.getElementById('header-flour-selector'),
        telemetryProtein: document.getElementById('telemetry-protein'),
        telemetryHydr: document.getElementById('telemetry-hydr'),

        // Camera & Diagnosis
        cameraPlaceholder: document.getElementById('camera-placeholder'),
        cameraInput: document.getElementById('camera-input'),
        galleryInput: document.getElementById('gallery-input'),
        previewContainer: document.getElementById('preview-container'),
        imageBadge: document.getElementById('image-count-badge'),
        contextInput: document.getElementById('context-input'),
        btnAnalyze: document.getElementById('btn-analyze'),
        diagnosticPanel: document.getElementById('diagnostic-panel'),
        diagnosticContent: document.getElementById('diagnostic-content'),
        btnClearResult: document.getElementById('btn-clear-result'),
        loaderOverlay: document.getElementById('loader-overlay'),
        loaderText: document.getElementById('loader-text'),
        btnFlash: document.getElementById('btn-flash'),
        btnPro: document.getElementById('btn-pro'),
        activeModelDisplay: document.getElementById('active-model-display'),

        // Unified Recipe Section
        recipeBookFilters: document.getElementById('recipe-book-filters'),
        recipeSelectorPills: document.getElementById('recipe-selector-pills'),
        recipeBookBadge: document.getElementById('recipe-book-badge'),
        displayRecipeTitle: document.getElementById('display-recipe-title'),
        displayRecipeDesc: document.getElementById('display-recipe-desc'),
        recipeAuthorNotes: document.getElementById('recipe-author-notes'),
        btnStartBakingMode: document.getElementById('btn-start-baking-mode'),

        // Flour Profiler
        recipeFlourSelector: document.getElementById('recipe-flour-selector'),
        inputProtein: document.getElementById('input-protein'),
        selectBio: document.getElementById('select-bio'),
        flourNotesBanner: document.getElementById('flour-notes-banner'),

        // Hydration & Bassinage Slider
        sliderHydration: document.getElementById('slider-hydration'),
        valHydrationDisplay: document.getElementById('val-hydration-display'),
        displayTotalWater: document.getElementById('display-total-water'),
        hydrZoneBadge: document.getElementById('hydr-zone-badge'),

        // Batch Scaler
        labelUnitCount: document.getElementById('label-unit-count'),
        btnDecLoaves: document.getElementById('btn-dec-loaves'),
        btnIncLoaves: document.getElementById('btn-inc-loaves'),
        displayLoaves: document.getElementById('display-loaves'),
        displayPortionEstimate: document.getElementById('display-portion-estimate'),
        inputFlourBasis: document.getElementById('input-flour-basis'),

        // Recipe Table & Steps
        recipeTableBody: document.getElementById('recipe-table-body'),
        recipeStepsList: document.getElementById('recipe-steps-list'),

        // Knowledge Base
        kbChips: document.querySelectorAll('.kb-chip[data-kb]'),
        kbMarkdownContent: document.getElementById('kb-markdown-content'),

        // Immersive Baking Mode Overlay
        bakingModeOverlay: document.getElementById('baking-mode-overlay'),
        bmRecipeName: document.getElementById('bm-recipe-name'),
        bmRecipeSpecs: document.getElementById('bm-recipe-specs'),
        bmCloseBtn: document.getElementById('bm-close-btn'),
        bmSoundToggle: document.getElementById('bm-sound-toggle'),
        bmStepBadge: document.getElementById('bm-step-badge'),
        bmStepCounter: document.getElementById('bm-step-counter'),
        bmStepTitle: document.getElementById('bm-step-title'),
        bmStepInstructions: document.getElementById('bm-step-instructions'),
        bmStepCues: document.getElementById('bm-step-cues'),
        bmTimerDisplay: document.getElementById('bm-timer-display'),
        bmTimerStatus: document.getElementById('bm-timer-status'),
        bmBtnToggleTimer: document.getElementById('bm-btn-toggle-timer'),
        bmBtnResetTimer: document.getElementById('bm-btn-reset-timer'),
        bmBtnAdd5: document.getElementById('bm-btn-add5'),
        bmBtnSub5: document.getElementById('bm-btn-sub5'),
        bmBtnPrev: document.getElementById('bm-btn-prev'),
        bmBtnComplete: document.getElementById('bm-btn-complete'),
        bmProgressFill: document.getElementById('bm-progress-fill'),
        bmStepPills: document.getElementById('bm-step-pills'),
        bmAlarmModal: document.getElementById('bm-alarm-modal'),
        bmAlarmTitle: document.getElementById('bm-alarm-title'),
        bmAlarmDesc: document.getElementById('bm-alarm-desc'),
        bmBtnDismissAlarm: document.getElementById('bm-btn-dismiss-alarm')
    };

    // =========================================================================
    // UNIFIED RECIPE CATALOG (MASTER + OG LITERATURE)
    // =========================================================================
    function getAllRecipes() {
        const list = [];

        // 1. Master Baguettes
        if (typeof RECIPES_BAGUETTE !== 'undefined') {
            RECIPES_BAGUETTE.forEach(r => {
                list.push(Object.assign({
                    is_master: true,
                    book_id: 'master',
                    book: 'Master Method',
                    citation: 'Calibrated Synthesis',
                    format: 'baguette',
                    author_notes: r.subtitle || 'Synthesized master method for artisanal baguette baking.',
                    base_yield: r.base_yield || 3,
                    flour_basis: r.flour_basis || 500,
                    unit_name: 'Baguette'
                }, r));
            });
        }

        // 2. Master Boules
        if (typeof RECIPES_BOULE !== 'undefined') {
            RECIPES_BOULE.forEach(r => {
                list.push(Object.assign({
                    is_master: true,
                    book_id: 'master',
                    book: 'Master Method',
                    citation: 'Calibrated Synthesis',
                    format: 'boule',
                    author_notes: r.subtitle || 'Synthesized master method for hearth boule & bâtard baking.',
                    base_yield: r.base_yield || 2,
                    flour_basis: r.flour_basis || 500,
                    unit_name: 'Boule'
                }, r));
            });
        }

        // 3. Authentic OG Literature Recipes
        if (typeof OG_RECIPES !== 'undefined') {
            OG_RECIPES.forEach(r => {
                list.push(Object.assign({
                    is_master: false,
                    subtitle: `${r.author} • ${r.citation}`,
                    flour_basis: 500,
                    base_yield: (r.format === 'baguette') ? 3 : 2,
                    unit_name: (r.format === 'baguette') ? 'Baguette' : 'Boule'
                }, r));
            });
        }

        return list;
    }

    const SOURCE_FILTERS = [
        { id: 'all', label: 'All Sources' },
        { id: 'master', label: '🌟 Master Methods' },
        { id: 'modernist', label: 'Modernist Bread' },
        { id: 'tartine', label: 'Tartine Bread' },
        { id: 'lanio', label: 'All About Baguette' },
        { id: 'perfect_loaf', label: 'The Perfect Loaf' },
        { id: 'forkish', label: 'Flour Water Salt Yeast' },
        { id: 'poilane', label: 'Poilâne' },
        { id: 'king_arthur', label: 'King Arthur' },
        { id: 'greenway', label: 'Discovering Sourdough' }
    ];

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    function init() {
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

        // Set initial format
        setFormatMode(currentFormatMode, false);

        // Initial Calculations & UI
        updateHydrationUI();
        renderKBContent('10_SOURDOUGH_BOULE_AND_BATARD_MASTERY.md');

        renderSourceFilters();
        renderRecipePills();

        bindEvents();
    }

    // Set Format Mode (Baguette vs Boule)
    function setFormatMode(mode, triggerRender = true) {
        currentFormatMode = mode;
        localStorage.setItem('baguette_format_mode', mode);

        DOM.btnFormatBaguette.classList.toggle('active', mode === 'baguette');
        DOM.btnFormatBoule.classList.toggle('active', mode === 'boule');

        if (mode === 'baguette') {
            DOM.telemetryFormat.textContent = 'Baguette (Couche)';
            DOM.recipeFormatTitle.textContent = 'Artisanal Baguettes';
            DOM.recipeFormatSubtitle.textContent = 'Curated master formulas & authentic literature recipes scaled to exact grams with interactive hydration';
            DOM.labelUnitCount.textContent = 'BAGUETTE COUNT:';
            currentLoavesCount = 3;
            currentFlourBasis = 500;
        } else {
            DOM.telemetryFormat.textContent = 'Boule (Dutch Oven)';
            DOM.recipeFormatTitle.textContent = 'Sourdough Boules & Bâtards';
            DOM.recipeFormatSubtitle.textContent = 'Cast iron combo cooker & Dutch oven hearth loaves scaled to exact grams with bassinage staging';
            DOM.labelUnitCount.textContent = 'BOULE COUNT:';
            currentLoavesCount = 2;
            currentFlourBasis = 500;
        }

        DOM.displayLoaves.textContent = currentLoavesCount;
        DOM.inputFlourBasis.value = currentFlourBasis;

        renderRecipePills();
    }

    // =========================================================================
    // SOURCE FILTERS & RECIPE SELECTION
    // =========================================================================
    function renderSourceFilters() {
        if (!DOM.recipeBookFilters) return;
        DOM.recipeBookFilters.innerHTML = '';

        SOURCE_FILTERS.forEach(sf => {
            const btn = document.createElement('button');
            btn.className = `kb-chip ${sf.id === currentSourceFilter ? 'active' : ''}`;
            btn.textContent = sf.label;
            btn.addEventListener('click', () => {
                DOM.recipeBookFilters.querySelectorAll('.kb-chip').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                currentSourceFilter = sf.id;
                renderRecipePills();
            });
            DOM.recipeBookFilters.appendChild(btn);
        });
    }

    function renderRecipePills() {
        if (!DOM.recipeSelectorPills) return;
        DOM.recipeSelectorPills.innerHTML = '';

        const all = getAllRecipes();
        let filtered = all.filter(r => r.format === currentFormatMode);

        if (currentSourceFilter !== 'all') {
            filtered = filtered.filter(r => r.book_id === currentSourceFilter);
        }

        if (filtered.length === 0) {
            DOM.recipeSelectorPills.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); padding: 8px 0;">No recipes found for this filter. Try selecting "All Sources" or switching format.</span>';
            return;
        }

        // Validate active recipe in filtered set
        if (!filtered.some(r => r.id === currentRecipeId)) {
            currentRecipeId = filtered[0].id;
        }

        filtered.forEach(r => {
            const btn = document.createElement('button');
            const isActive = (r.id === currentRecipeId);
            btn.className = `recipe-pill-btn ${isActive ? 'active' : ''}`;
            btn.dataset.recipe = r.id;

            const icon = r.is_master ? '🌟' : ((r.format === 'baguette') ? '🥖' : '🍞');
            const sourceTag = r.is_master ? 'Master' : (r.book || '');
            btn.innerHTML = `${icon} <strong>${r.title}</strong> <small style="opacity: 0.8; font-size: 10px; margin-left: 4px;">(${sourceTag})</small>`;

            btn.addEventListener('click', () => {
                DOM.recipeSelectorPills.querySelectorAll('.recipe-pill-btn').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                selectRecipe(r.id);
            });
            DOM.recipeSelectorPills.appendChild(btn);
        });

        selectRecipe(currentRecipeId);
    }

    function selectRecipe(recipeId) {
        const all = getAllRecipes();
        const recipe = all.find(r => r.id === recipeId) || all[0];
        if (!recipe) return;

        currentRecipeId = recipe.id;

        // Update active banner
        DOM.recipeBookBadge.textContent = recipe.is_master
            ? `Master Formula • ${recipe.format.toUpperCase()}`
            : `${recipe.book} • ${recipe.citation}`;
        DOM.displayRecipeTitle.textContent = recipe.title;
        DOM.displayRecipeDesc.textContent = `${recipe.author} • Base Hydration: ${recipe.base_hydration}%`;

        // Update author commentary
        if (DOM.recipeAuthorNotes) {
            DOM.recipeAuthorNotes.innerHTML = recipe.author_notes || recipe.subtitle || 'Authentic unadulterated formulation directly from foundational literature.';
        }

        // Sync hydration to recipe base
        if (recipe.base_hydration) {
            currentHydration = recipe.base_hydration;
            DOM.sliderHydration.value = currentHydration;
            updateHydrationUI();
        }

        renderRecipesTable();
        renderRecipeSteps(recipe);
    }

    // =========================================================================
    // FLOUR PROFILES ENGINE
    // =========================================================================
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

    // =========================================================================
    // FORMULA TABLE & BATCH SCALER
    // =========================================================================
    function renderRecipesTable() {
        const all = getAllRecipes();
        const recipe = all.find(r => r.id === currentRecipeId) || all[0];
        if (!recipe || !activeFlour) return;

        const flourBasis = currentFlourBasis;
        const targetHydr = currentHydration;
        const bassinageThreshold = activeFlour.bassinage_threshold || (currentFormatMode === 'boule' ? 66.0 : 64.0);

        const totalWaterGrams = Math.round(flourBasis * (targetHydr / 100));
        DOM.displayTotalWater.textContent = `${totalWaterGrams}g (${targetHydr.toFixed(1)}%)`;

        DOM.recipeTableBody.innerHTML = '';
        let formulaRows = [];
        let totalDoughWeight = 0;

        if (recipe.is_master && recipe.ingredients) {
            // Master hybrid formulas
            const baseWaterPct = Math.min(targetHydr, bassinageThreshold);
            const bassinageWaterPct = Math.max(0, targetHydr - baseWaterPct);

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
                        originalWeight: '—',
                        note: `Autolysed with base water for ${activeFlour.autolyse_min} min.`
                    };
                } else if (ing.type === 'water_base') {
                    grams = Math.round(flourBasis * (netBaseWaterPct / 100));
                    return {
                        item: 'Base Water (Autolyse / Mix)',
                        grams: grams,
                        pct: netBaseWaterPct.toFixed(1),
                        originalWeight: '—',
                        note: 'At room / ambient temp. Deducts pre-ferment water.'
                    };
                } else if (ing.type === 'water_bassinage') {
                    grams = Math.round(flourBasis * (bassinageWaterPct / 100));
                    return {
                        item: 'Bassinage Water (Late Addition)',
                        grams: grams,
                        pct: bassinageWaterPct.toFixed(1),
                        originalWeight: '—',
                        note: bassinageWaterPct > 0 ? 'Add slowly in final 2 minutes of mix with salt.' : 'Zero bassinage needed (target <= threshold).'
                    };
                } else {
                    grams = Math.round(flourBasis * (ing.pct / 100) * 10) / 10;
                    if (grams < 1 && grams > 0) grams = grams.toFixed(1);
                    else grams = Math.round(grams);
                    return {
                        item: ing.name,
                        grams: grams,
                        pct: ing.pct.toFixed(1),
                        originalWeight: '—',
                        note: note
                    };
                }
            });
        } else if (recipe.ingredients) {
            // Authentic Literature Formulas
            formulaRows = recipe.ingredients.map(ing => {
                const pct = ing.pct || 0;
                let grams = Math.round(flourBasis * (pct / 100) * 10) / 10;
                if (grams < 1 && grams > 0) grams = grams.toFixed(1);
                else grams = Math.round(grams);

                let itemName = ing.name;
                if (itemName.toLowerCase().includes('flour') && !itemName.toLowerCase().includes('levain') && !itemName.toLowerCase().includes('poolish')) {
                    itemName = `${itemName} [Active: ${activeFlour.name}]`;
                }

                return {
                    item: itemName,
                    grams: grams,
                    pct: pct > 0 ? pct.toFixed(1) : '—',
                    originalWeight: ing.weight || '—',
                    note: ing.note || ''
                };
            });
        }

        formulaRows.forEach(row => {
            totalDoughWeight += parseFloat(row.grams) || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.item}</strong></td>
                <td class="col-grams">${row.grams}g</td>
                <td class="col-pct">${row.pct}%</td>
                <td class="recipe-desc-text" style="font-weight: 600; color: var(--text-primary);">${row.originalWeight}</td>
                <td><small>${row.note}</small></td>
            `;
            DOM.recipeTableBody.appendChild(tr);
        });

        // Update portions estimate
        const pieceGrams = Math.round(totalDoughWeight / Math.max(1, currentLoavesCount));
        DOM.displayPortionEstimate.textContent = `(~${pieceGrams}g each)`;
    }

    function renderRecipeSteps(recipe) {
        if (!DOM.recipeStepsList || !recipe || !recipe.steps) return;
        DOM.recipeStepsList.innerHTML = '';

        recipe.steps.forEach((step, idx) => {
            const card = document.createElement('div');
            card.className = 'phase-step-item';
            card.innerHTML = `
                <div class="phase-step-header">
                    <span class="phase-step-name">Phase ${idx + 1}: ${step.title}</span>
                    <span class="phase-step-time">${step.time || ''}</span>
                </div>
                <div class="phase-step-desc">${step.text}</div>
                ${step.cues ? `<div class="phase-step-cues"><strong>Sensory Cues:</strong> ${step.cues}</div>` : ''}
            `;
            DOM.recipeStepsList.appendChild(card);
        });
    }

    // =========================================================================
    // HYDRATION UI EVALUATION
    // =========================================================================
    function updateHydrationUI() {
        const val = parseFloat(DOM.sliderHydration.value) || 70.5;
        currentHydration = val;
        DOM.valHydrationDisplay.textContent = `${val.toFixed(1)}%`;
        DOM.telemetryHydr.textContent = `${val.toFixed(1)}%`;

        const totalWater = Math.round(currentFlourBasis * (val / 100));
        DOM.displayTotalWater.textContent = `${totalWater}g (${val.toFixed(1)}%)`;

        if (!activeFlour) return;

        const rec = activeFlour.rec_hydration;
        const max = activeFlour.max_safe_hydration;
        const badge = DOM.hydrZoneBadge;

        if (val < activeFlour.min_safe_hydration) {
            badge.textContent = `Zone 1: Stiff (< ${activeFlour.min_safe_hydration}%)`;
            badge.style.backgroundColor = "rgba(100, 116, 139, 0.2)";
            badge.style.color = "#94a3b8";
        } else if (val <= rec + 1.0 && val >= rec - 1.5) {
            badge.textContent = `Sweet Spot (${rec}%) for ${activeFlour.name}`;
            badge.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
            badge.style.color = "#34d399";
        } else if (val <= max) {
            badge.textContent = `Zone 2: High Hydration (Late Bassinage Required)`;
            badge.style.backgroundColor = "rgba(245, 158, 11, 0.2)";
            badge.style.color = "#fbbf24";
        } else {
            badge.textContent = `Zone 3: Puddle Limit Exceeded (> ${max}%)`;
            badge.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            badge.style.color = "#f87171";
        }
    }

    // =========================================================================
    // IMMERSIVE BAKING MODE ENGINE
    // =========================================================================
    function startBakingMode(recipe) {
        if (!recipe || !recipe.steps || recipe.steps.length === 0) {
            alert('Recipe has no defined step-by-step procedure.');
            return;
        }

        bakingState.recipe = recipe;
        bakingState.stepIndex = 0;
        bakingState.timerRunning = false;
        clearInterval(bakingState.timerInterval);

        DOM.bmRecipeName.textContent = recipe.title;
        DOM.bmRecipeSpecs.textContent = `${recipe.book || 'Bread Guru'} • ${currentFlourBasis}g Flour • ${currentHydration}% Hydr • ${activeFlour?.name || 'T65'}`;

        DOM.bakingModeOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        renderBakingStep(0);
    }

    function exitBakingMode() {
        DOM.bakingModeOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        clearInterval(bakingState.timerInterval);
        clearInterval(bakingState.alarmInterval);
        bakingState.timerRunning = false;
    }

    function renderBakingStep(idx) {
        const recipe = bakingState.recipe;
        if (!recipe || idx < 0 || idx >= recipe.steps.length) return;

        bakingState.stepIndex = idx;
        const step = recipe.steps[idx];

        DOM.bmStepBadge.textContent = step.phase ? `Phase ${idx + 1}: ${step.phase}` : `Step ${idx + 1}`;
        DOM.bmStepCounter.textContent = `Step ${idx + 1} of ${recipe.steps.length}`;
        DOM.bmStepTitle.textContent = step.title;
        DOM.bmStepInstructions.textContent = step.text;
        DOM.bmStepCues.textContent = step.cues || 'Follow tactile resistance and visual volume expansion.';

        // Progress Fill
        const pct = ((idx + 1) / recipe.steps.length) * 100;
        DOM.bmProgressFill.style.width = `${pct}%`;

        // Navigation Buttons
        DOM.bmBtnPrev.disabled = (idx === 0);
        DOM.bmBtnComplete.textContent = (idx === recipe.steps.length - 1) ? 'Finish Bake 🎉' : 'Next Step →';

        // Timer Setup
        clearInterval(bakingState.timerInterval);
        bakingState.timerRunning = false;
        bakingState.timerTotalSeconds = step.timer_seconds || 1800;
        bakingState.timerRemainingSeconds = bakingState.timerTotalSeconds;
        updateTimerDisplay();

        DOM.bmTimerStatus.textContent = 'READY';
        DOM.bmBtnToggleTimer.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Start</span>';
    }

    function toggleTimer() {
        if (bakingState.timerRunning) {
            // Pause
            clearInterval(bakingState.timerInterval);
            bakingState.timerRunning = false;
            DOM.bmTimerStatus.textContent = 'PAUSED';
            DOM.bmBtnToggleTimer.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Resume</span>';
        } else {
            // Start / Resume
            bakingState.timerRunning = true;
            bakingState.timerEndTime = Date.now() + (bakingState.timerRemainingSeconds * 1000);
            DOM.bmTimerStatus.textContent = 'RUNNING';
            DOM.bmBtnToggleTimer.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span>Pause</span>';

            bakingState.timerInterval = setInterval(() => {
                const now = Date.now();
                const diff = Math.round((bakingState.timerEndTime - now) / 1000);

                if (diff <= 0) {
                    bakingState.timerRemainingSeconds = 0;
                    clearInterval(bakingState.timerInterval);
                    bakingState.timerRunning = false;
                    updateTimerDisplay();
                    triggerStepAlarm();
                } else {
                    bakingState.timerRemainingSeconds = diff;
                    updateTimerDisplay();
                }
            }, 500);
        }
    }

    function resetTimer() {
        clearInterval(bakingState.timerInterval);
        bakingState.timerRunning = false;
        const step = bakingState.recipe.steps[bakingState.stepIndex];
        bakingState.timerRemainingSeconds = step.timer_seconds || 1800;
        updateTimerDisplay();
        DOM.bmTimerStatus.textContent = 'RESET';
        DOM.bmBtnToggleTimer.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Start</span>';
    }

    function adjustTimer(deltaSeconds) {
        bakingState.timerRemainingSeconds = Math.max(0, bakingState.timerRemainingSeconds + deltaSeconds);
        if (bakingState.timerRunning) {
            bakingState.timerEndTime = Date.now() + (bakingState.timerRemainingSeconds * 1000);
        }
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const total = bakingState.timerRemainingSeconds;
        const hrs = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;

        let displayStr = '';
        if (hrs > 0) {
            displayStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            displayStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        DOM.bmTimerDisplay.textContent = displayStr;
    }

    function triggerStepAlarm() {
        DOM.bmTimerStatus.textContent = 'TIME UP!';
        const step = bakingState.recipe.steps[bakingState.stepIndex];

        DOM.bmAlarmTitle.textContent = `Phase Complete: ${step.title}`;
        DOM.bmAlarmDesc.textContent = step.cues || 'Check your dough and proceed to the next step.';
        DOM.bmAlarmModal.classList.remove('hidden');

        playProceduralChime();

        if (navigator.vibrate) {
            navigator.vibrate([400, 200, 400, 200, 800]);
        }
    }

    function playProceduralChime() {
        if (!bakingState.soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.3, ctx.currentTime + (idx * 0.14));
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.14) + 0.8);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + (idx * 0.14));
                    osc.stop(ctx.currentTime + (idx * 0.14) + 0.85);
                });
            }
        } catch (e) {
            console.warn('Audio chime error', e);
        }
    }

    // =========================================================================
    // EVENT BINDINGS
    // =========================================================================
    function bindEvents() {
        // Tab Navigation
        DOM.navPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const tab = pill.dataset.tab;
                DOM.navPills.forEach(p => p.classList.remove('active'));
                DOM.tabViews.forEach(v => v.classList.remove('active'));
                pill.classList.add('active');
                const targetView = document.getElementById(`view-${tab}`);
                if (targetView) targetView.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Format Switcher
        DOM.btnFormatBaguette.addEventListener('click', () => setFormatMode('baguette'));
        DOM.btnFormatBoule.addEventListener('click', () => setFormatMode('boule'));

        // Settings Modal
        DOM.settingsBtn.addEventListener('click', () => DOM.settingsModal.classList.remove('hidden'));
        DOM.btnCloseSettings.addEventListener('click', () => DOM.settingsModal.classList.add('hidden'));
        DOM.btnSaveSettings.addEventListener('click', () => {
            const key = DOM.geminiKey.value.trim();
            const model = DOM.modelPreference.value;
            localStorage.setItem('baguette_gemini_key', key);
            localStorage.setItem('baguette_gemini_model', model);
            selectedModel = model;
            updateModelUI(model);
            DOM.settingsStatus.textContent = 'Settings saved successfully!';
            setTimeout(() => {
                DOM.settingsStatus.textContent = '';
                DOM.settingsModal.classList.add('hidden');
            }, 1200);
        });

        // Flour Selection
        [DOM.headerFlourSelector, DOM.recipeFlourSelector].forEach(sel => {
            sel.addEventListener('change', (e) => setFlourProfile(e.target.value, true));
        });

        DOM.inputProtein.addEventListener('input', (e) => {
            if (activeFlour) {
                activeFlour.protein = parseFloat(e.target.value) || 11.5;
                DOM.telemetryProtein.textContent = `${activeFlour.protein.toFixed(1)}%`;
                renderRecipesTable();
            }
        });

        DOM.selectBio.addEventListener('change', (e) => {
            if (activeFlour) {
                activeFlour.is_bio = (e.target.value === 'true');
                renderRecipesTable();
            }
        });

        // Hydration Slider
        DOM.sliderHydration.addEventListener('input', () => {
            updateHydrationUI();
            renderRecipesTable();
        });

        // Batch Scaler
        DOM.inputFlourBasis.addEventListener('input', (e) => {
            currentFlourBasis = Math.max(100, parseInt(e.target.value) || 500);
            updateHydrationUI();
            renderRecipesTable();
        });

        DOM.btnDecLoaves.addEventListener('click', () => {
            if (currentLoavesCount > 1) {
                currentLoavesCount--;
                DOM.displayLoaves.textContent = currentLoavesCount;
                currentFlourBasis = Math.round(currentLoavesCount * (currentFormatMode === 'baguette' ? 166 : 250));
                DOM.inputFlourBasis.value = currentFlourBasis;
                updateHydrationUI();
                renderRecipesTable();
            }
        });

        DOM.btnIncLoaves.addEventListener('click', () => {
            if (currentLoavesCount < 24) {
                currentLoavesCount++;
                DOM.displayLoaves.textContent = currentLoavesCount;
                currentFlourBasis = Math.round(currentLoavesCount * (currentFormatMode === 'baguette' ? 166 : 250));
                DOM.inputFlourBasis.value = currentFlourBasis;
                updateHydrationUI();
                renderRecipesTable();
            }
        });

        // Start Baking Mode Button
        DOM.btnStartBakingMode.addEventListener('click', () => {
            const all = getAllRecipes();
            const rec = all.find(r => r.id === currentRecipeId) || all[0];
            if (rec) startBakingMode(rec);
        });

        // Baking Mode Controls
        DOM.bmCloseBtn.addEventListener('click', exitBakingMode);
        DOM.bmBtnToggleTimer.addEventListener('click', toggleTimer);
        DOM.bmBtnResetTimer.addEventListener('click', resetTimer);
        DOM.bmBtnAdd5.addEventListener('click', () => adjustTimer(300));
        DOM.bmBtnSub5.addEventListener('click', () => adjustTimer(-300));
        DOM.bmBtnPrev.addEventListener('click', () => renderBakingStep(bakingState.stepIndex - 1));
        DOM.bmBtnComplete.addEventListener('click', () => {
            if (bakingState.stepIndex < bakingState.recipe.steps.length - 1) {
                renderBakingStep(bakingState.stepIndex + 1);
            } else {
                alert('🎉 Congratulations! You have completed this bake according to master artisanal methodology.');
                exitBakingMode();
            }
        });

        DOM.bmBtnDismissAlarm.addEventListener('click', () => {
            DOM.bmAlarmModal.classList.add('hidden');
        });

        DOM.bmSoundToggle.addEventListener('click', () => {
            bakingState.soundEnabled = !bakingState.soundEnabled;
            DOM.bmSoundToggle.style.opacity = bakingState.soundEnabled ? '1' : '0.4';
        });

        // Knowledge Base Chips
        DOM.kbChips.forEach(chip => {
            chip.addEventListener('click', () => {
                DOM.kbChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                renderKBContent(chip.dataset.kb);
            });
        });

        // Camera & Upload Handlers
        initImageUploadEvents();
    }

    // =========================================================================
    // IMAGE UPLOAD & MULTIMODAL DIAGNOSTICS
    // =========================================================================
    function initImageUploadEvents() {
        DOM.cameraInput.addEventListener('change', (e) => handleImageFiles(e.target.files));
        DOM.galleryInput.addEventListener('change', (e) => handleImageFiles(e.target.files));

        DOM.cameraPlaceholder.addEventListener('dragover', (e) => {
            e.preventDefault();
            DOM.cameraPlaceholder.classList.add('dragover');
        });
        DOM.cameraPlaceholder.addEventListener('dragleave', () => DOM.cameraPlaceholder.classList.remove('dragover'));
        DOM.cameraPlaceholder.addEventListener('drop', (e) => {
            e.preventDefault();
            DOM.cameraPlaceholder.classList.remove('dragover');
            handleImageFiles(e.dataTransfer.files);
        });

        DOM.btnClearResult.addEventListener('click', () => {
            DOM.diagnosticPanel.classList.add('hidden');
        });

        DOM.btnFlash.addEventListener('click', () => updateModelUI('gemini-2.5-flash'));
        DOM.btnPro.addEventListener('click', () => updateModelUI('gemini-2.5-pro'));

        DOM.btnAnalyze.addEventListener('click', runGeminiAnalysis);
    }

    function updateModelUI(model) {
        selectedModel = model;
        DOM.btnFlash.classList.toggle('active', model === 'gemini-2.5-flash');
        DOM.btnPro.classList.toggle('active', model === 'gemini-2.5-pro');
        DOM.activeModelDisplay.textContent = (model === 'gemini-2.5-flash') ? 'Gemini 2.5 Flash' : 'Gemini 2.5 Pro';
    }

    async function handleImageFiles(fileList) {
        if (!fileList || fileList.length === 0) return;

        DOM.loaderOverlay.classList.remove('hidden');
        DOM.loaderText.textContent = 'Optimizing photos...';

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

    async function runGeminiAnalysis() {
        const apiKey = localStorage.getItem('baguette_gemini_key') || localStorage.getItem('ml_gemini_key') || '';
        if (!apiKey) {
            alert('Please configure your Gemini API Key in Settings (gear icon in the top right).');
            DOM.settingsModal.classList.remove('hidden');
            return;
        }

        if (currentBase64Images.length === 0) {
            alert('Please snap or upload at least one photo of your baguette / boule crumb, crust, or dough.');
            return;
        }

        DOM.loaderOverlay.classList.remove('hidden');
        DOM.loaderText.textContent = 'Guru analyzing photometric crumb...';

        const all = getAllRecipes();
        const activeRec = all.find(r => r.id === currentRecipeId);

        const promptText = `You are the master Boulanger and Sourdough Guru.
Analyze the attached photo(s) of crumb, crust, ear/grigne, or dough.

CURRENT TELEMETRY:
- FORMAT: ${currentFormatMode.toUpperCase()}
- ACTIVE RECIPE: ${activeRec ? activeRec.title : 'Artisanal'} (${activeRec ? activeRec.book : ''})
- ACTIVE FLOUR: ${activeFlour.name} (${activeFlour.protein}% Protein, ${activeFlour.ash}% Ash, Bio: ${activeFlour.is_bio})
- TARGET HYDRATION: ${currentHydration}%
- USER NOTES: ${DOM.contextInput.value || 'None'}

Provide a rigorous diagnosis:
1. Primary Diagnostic Classification (Alveoli, Ear/Grigne, Blistering, Gluten Webbing)
2. Root Cause Analysis (Hydration, Fermentation kinetics, Shaping tension, Steam/Thermal mass)
3. Actionable Baking Prescriptions (Exact numerical adjustments for water, folds, timings)`;

        const contents = [
            {
                role: 'user',
                parts: [
                    { text: promptText },
                    ...currentBase64Images.map(b64 => ({
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: b64
                        }
                    }))
                ]
            }
        ];

        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: contents })
            });

            if (!res.ok) {
                const errJson = await res.json();
                throw new Error(errJson.error?.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No diagnosis generated.';

            DOM.diagnosticPanel.classList.remove('hidden');
            DOM.diagnosticContent.innerHTML = renderMarkdown(text);
            DOM.diagnosticPanel.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            alert('Gemini Analysis Failed: ' + err.message);
        } finally {
            DOM.loaderOverlay.classList.add('hidden');
        }
    }

    // Markdown Parser
    function renderKBContent(filename) {
        if (!DOM.kbMarkdownContent || typeof BAGUETTE_KB === 'undefined') return;
        const md = BAGUETTE_KB[filename] || '# Topic not found';
        DOM.kbMarkdownContent.innerHTML = renderMarkdown(md);
    }

    function renderMarkdown(md) {
        if (!md) return '';
        let html = md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Tables
        html = html.replace(/\|(.+)\|/g, function (match) {
            const cells = match.split('|').filter(c => c.trim().length > 0);
            if (match.includes('---')) return '';
            const row = cells.map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${row}</tr>`;
        });
        html = html.replace(/(<tr>.*?<\/tr>(\s*<tr>.*?<\/tr>)*)/g, '<div class="table-responsive"><table class="scale-table">$1</table></div>');

        html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
        html = html.replace(/\n\n+/g, '</p><p>');
        html = `<p>${html}</p>`;

        return html;
    }

    // Initialize application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
