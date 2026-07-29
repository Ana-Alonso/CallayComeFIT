/**
 * CALLA Y COME FIT - MOTOR LÓGICO DE LA APLICACIÓN (SPA)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================================
    // 1. ESTADO DE LA APLICACIÓN (LOCAL STORAGE CON VALORES POR DEFECTO)
    // =========================================================================
    
    const defaultState = {
        userProfile: {
            name: 'Ana',
            age: 28,
            gender: 'female',
            height: 168,
            weight: 68.0,
            targetWeight: 63.0,
            activityLevel: 'moderate', // 1.55
            fitnessGoal: 'fat_loss', // -20%
            macroPreset: 'high_protein', // Default preset
            customProteinPct: 40,
            customCarbPct: 35,
            customFatPct: 25,
            waterLoggedMl: 1750,
            waterTargetMl: 2500
        },
        dailyLogs: [
            { id: '1', meal: 'breakfast', name: 'Tortilla Fit de Clara y Pavo', servings: 1, kcal: 260, protein: 32, carbs: 4, fat: 12 },
            { id: '2', meal: 'breakfast', name: 'Café solo con Bebida de Almendra', servings: 1, kcal: 25, protein: 1, carbs: 2, fat: 1 },
            { id: '3', meal: 'lunch', name: 'Pechuga de Pollo Calla y Come Fit + Arroz Integral', servings: 1, kcal: 520, protein: 55, carbs: 58, fat: 8 },
            { id: '4', meal: 'dinner', name: 'Ensalada de Atún al Natural y Aguacate', servings: 1, kcal: 335, protein: 35, carbs: 8, fat: 18 }
        ],
        stravaActivities: [
            { id: 'act-101', date: 'Hoy, 10:30 AM', source: 'strava', title: 'Carrera Mañanera por el Parque', duration: '32 min', distance: '6.4 km', calories: 380, hr: 152 }
        ],
        weightHistory: [
            { date: '01 Jul', weight: 70.2 },
            { date: '08 Jul', weight: 69.5 },
            { date: '15 Jul', weight: 68.9 },
            { date: '22 Jul', weight: 68.4 },
            { date: '29 Jul', weight: 68.0 }
        ]
    };

    // Carga de estado local
    let appState = JSON.parse(localStorage.getItem('callaycome_fit_state')) || defaultState;

    function saveState() {
        localStorage.setItem('callaycome_fit_state', JSON.stringify(appState));
    }

    // =========================================================================
    // 2. MOTOR DE CÁLCULO METABÓLICO (BMR, TDEE, MACROS)
    // =========================================================================

    function calculateMetabolism() {
        const { age, gender, height, weight, activityLevel, fitnessGoal, macroPreset, customProteinPct, customCarbPct, customFatPct } = appState.userProfile;

        // Fórmula Mifflin-St Jeor
        let bmr = 0;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        // Multiplicadores de Actividad
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

        // Ajuste por Objetivo Fitness
        let targetCalories = tdee;
        if (fitnessGoal === 'fat_loss') {
            targetCalories = Math.round(tdee * 0.80); // Déficit del 20%
        } else if (fitnessGoal === 'muscle_gain') {
            targetCalories = Math.round(tdee * 1.15); // Superávit del 15%
        }

        // Determinación de Ratios de Macronutrientes
        let pPct = 30, cPct = 40, fPct = 30;

        if (macroPreset === 'high_protein') {
            pPct = 40; cPct = 35; fPct = 25;
        } else if (macroPreset === 'balanced') {
            pPct = 30; cPct = 40; fPct = 30;
        } else if (macroPreset === 'low_carb') {
            pPct = 45; cPct = 20; fPct = 35;
        } else if (macroPreset === 'custom') {
            pPct = customProteinPct;
            cPct = customCarbPct;
            fPct = customFatPct;
        }

        // Conversión a Gramos (Proteína: 4kcal/g, Carbs: 4kcal/g, Grasa: 9kcal/g)
        const targetProteinGrams = Math.round((targetCalories * (pPct / 100)) / 4);
        const targetCarbsGrams = Math.round((targetCalories * (cPct / 100)) / 4);
        const targetFatGrams = Math.round((targetCalories * (fPct / 100)) / 9);

        return {
            bmr: Math.round(bmr),
            tdee,
            targetCalories,
            pPct, cPct, fPct,
            targetProteinGrams,
            targetCarbsGrams,
            targetFatGrams
        };
    }

    // =========================================================================
    // 3. NAVEGACIÓN SPA & PESTAÑAS
    // =========================================================================

    const navButtons = document.querySelectorAll('.nav-btn, .link-tab-trigger');
    const tabViews = document.querySelectorAll('.tab-view');

    function switchTab(tabId) {
        navButtons.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        tabViews.forEach(view => {
            if (view.id === `view-${tabId}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Inicializar o refrescar gráficos si se cambia a la pestaña de progreso
        if (tabId === 'progress') {
            renderCharts();
        }
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = btn.dataset.tab;
            if (targetTab) switchTab(targetTab);
        });
    });

    // =========================================================================
    // 4. RENDERIZADO DEL DASHBOARD & ANILLOS DE MACROS
    // =========================================================================

    function updateDashboardUI() {
        const meta = calculateMetabolism();

        // Totales Consumidos hoy
        let consumedKcal = 0;
        let consumedP = 0;
        let consumedC = 0;
        let consumedF = 0;

        appState.dailyLogs.forEach(item => {
            consumedKcal += item.kcal;
            consumedP += item.protein;
            consumedC += item.carbs;
            consumedF += item.fat;
        });

        // Totales Quemados en Strava
        let burnedKcal = 0;
        appState.stravaActivities.forEach(act => {
            burnedKcal += act.calories;
        });

        // Balance Neto
        const remainingKcal = meta.targetCalories - consumedKcal + burnedKcal;

        // Actualizar números del Dashboard
        document.getElementById('calories-remaining').textContent = remainingKcal.toLocaleString('es-ES');
        document.getElementById('cal-target-base').textContent = meta.targetCalories.toLocaleString('es-ES');
        document.getElementById('cal-consumed').textContent = consumedKcal.toLocaleString('es-ES');
        document.getElementById('cal-burned').textContent = burnedKcal.toLocaleString('es-ES');
        document.getElementById('summary-strava-kcal').textContent = `${burnedKcal} kcal`;

        // Barra de progreso de calorías
        const calPercent = Math.min(100, Math.round((consumedKcal / (meta.targetCalories + burnedKcal)) * 100));
        document.getElementById('calorie-bar-fill').style.width = `${calPercent}%`;

        // Actualizar Objetivos Rápidos del Banner
        document.getElementById('quick-target-weight').textContent = `${appState.userProfile.targetWeight.toFixed(1)} kg`;
        const goalNames = { fat_loss: 'Déficit (-20%)', maintenance: 'Mantenimiento', muscle_gain: 'Superávit (+15%)' };
        document.getElementById('quick-fitness-goal').textContent = goalNames[appState.userProfile.fitnessGoal] || 'Mantenimiento';

        // Actualizar Anillos de Macros
        document.getElementById('protein-current').textContent = consumedP.toFixed(1);
        document.getElementById('protein-target').textContent = meta.targetProteinGrams;
        const pPctReal = Math.min(100, Math.round((consumedP / meta.targetProteinGrams) * 100)) || 0;
        document.getElementById('protein-pct-text').textContent = `${pPctReal}%`;
        document.getElementById('ring-protein-fill').setAttribute('stroke-dasharray', `${pPctReal}, 100`);

        document.getElementById('carbs-current').textContent = consumedC.toFixed(1);
        document.getElementById('carbs-target').textContent = meta.targetCarbsGrams;
        const cPctReal = Math.min(100, Math.round((consumedC / meta.targetCarbsGrams) * 100)) || 0;
        document.getElementById('carbs-pct-text').textContent = `${cPctReal}%`;
        document.getElementById('ring-carbs-fill').setAttribute('stroke-dasharray', `${cPctReal}, 100`);

        document.getElementById('fats-current').textContent = consumedF.toFixed(1);
        document.getElementById('fats-target').textContent = meta.targetFatGrams;
        const fPctReal = Math.min(100, Math.round((consumedF / meta.targetFatGrams) * 100)) || 0;
        document.getElementById('fats-pct-text').textContent = `${fPctReal}%`;
        document.getElementById('ring-fats-fill').setAttribute('stroke-dasharray', `${fPctReal}, 100`);

        // Etiqueta de la plantilla activa
        const presetLabels = { high_protein: 'Alta en Proteína', balanced: 'Equilibrada', low_carb: 'Baja en Carb', custom: 'Personalizada' };
        document.getElementById('active-preset-tag').textContent = `Plantilla: ${presetLabels[appState.userProfile.macroPreset] || 'Personalizada'}`;

        // Hidratación
        document.getElementById('water-display').textContent = `${appState.userProfile.waterLoggedMl.toLocaleString('es-ES')} / ${appState.userProfile.waterTargetMl.toLocaleString('es-ES')} ml`;
        const waterPct = Math.min(100, Math.round((appState.userProfile.waterLoggedMl / appState.userProfile.waterTargetMl) * 100));
        document.getElementById('water-fill-level').style.height = `${waterPct}%`;

        // Widget Strava Preview
        if (appState.stravaActivities.length > 0) {
            const last = appState.stravaActivities[0];
            document.getElementById('dash-strava-title').textContent = last.title;
            document.getElementById('dash-strava-dist').textContent = last.distance;
            document.getElementById('dash-strava-dur').textContent = last.duration;
            document.getElementById('dash-strava-bpm').textContent = `${last.hr} ppm`;
            document.getElementById('dash-strava-kcal').textContent = `+${last.calories}`;
        }

        renderDiaryUI();
        renderActivitiesTable();
    }

    // Controles de Agua
    document.getElementById('btn-add-250').addEventListener('click', () => {
        appState.userProfile.waterLoggedMl += 250;
        saveState();
        updateDashboardUI();
    });

    document.getElementById('btn-add-500').addEventListener('click', () => {
        appState.userProfile.waterLoggedMl += 500;
        saveState();
        updateDashboardUI();
    });

    document.getElementById('btn-reset-water').addEventListener('click', () => {
        appState.userProfile.waterLoggedMl = 0;
        saveState();
        updateDashboardUI();
    });

    // =========================================================================
    // 5. GESTIÓN DEL DIARIO NUTRICIONAL
    // =========================================================================

    function renderDiaryUI() {
        const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        meals.forEach(meal => {
            const listContainer = document.getElementById(`list-${meal}`);
            listContainer.innerHTML = '';
            
            const filteredItems = appState.dailyLogs.filter(i => i.meal === meal);
            let totalKcalMeal = 0;

            filteredItems.forEach(item => {
                totalKcalMeal += item.kcal;

                const itemRow = document.createElement('div');
                itemRow.className = 'food-row-item';
                itemRow.innerHTML = `
                    <div class="food-row-info">
                        <h4>${item.name}</h4>
                        <div class="food-row-macros">
                            <span>🥩 ${item.protein}g P</span>
                            <span>🍚 ${item.carbs}g C</span>
                            <span>🥑 ${item.fat}g G</span>
                        </div>
                    </div>
                    <div class="food-row-right">
                        <span class="food-row-kcal">${item.kcal} kcal</span>
                        <button class="btn-delete-food" data-id="${item.id}" title="Eliminar registro">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;

                // Evento eliminar
                itemRow.querySelector('.btn-delete-food').addEventListener('click', () => {
                    appState.dailyLogs = appState.dailyLogs.filter(x => x.id !== item.id);
                    saveState();
                    updateDashboardUI();
                });

                listContainer.appendChild(itemRow);
            });

            document.getElementById(`kcal-total-${meal}`).textContent = `${totalKcalMeal} kcal`;
        });
    }

    // Modal Añadir Alimento
    const modalFood = document.getElementById('modal-add-food');
    const formFood = document.getElementById('form-add-food-item');

    document.getElementById('btn-open-add-food-modal').addEventListener('click', () => {
        modalFood.classList.remove('hidden');
    });

    document.querySelectorAll('.btn-add-item-meal').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetMeal = btn.dataset.meal;
            document.getElementById('modal-target-meal').value = targetMeal;
            modalFood.classList.remove('hidden');
        });
    });

    document.getElementById('btn-close-modal-food').addEventListener('click', () => modalFood.classList.add('hidden'));
    document.getElementById('btn-cancel-modal-food').addEventListener('click', () => modalFood.classList.add('hidden'));

    formFood.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLog = {
            id: Date.now().toString(),
            meal: document.getElementById('modal-target-meal').value || 'breakfast',
            name: document.getElementById('food-input-name').value,
            servings: parseFloat(document.getElementById('food-input-servings').value) || 1.0,
            kcal: parseInt(document.getElementById('food-input-kcal').value) || 0,
            protein: parseFloat(document.getElementById('food-input-protein').value) || 0,
            carbs: parseFloat(document.getElementById('food-input-carbs').value) || 0,
            fat: parseFloat(document.getElementById('food-input-fat').value) || 0
        };

        appState.dailyLogs.push(newLog);
        saveState();
        updateDashboardUI();
        formFood.reset();
        modalFood.classList.add('hidden');
    });

    // Modal Importar Recetas de Calla y Come DB
    const modalRecipes = document.getElementById('modal-import-recipe');
    const pickerContainer = document.getElementById('callaycome-picker-items');

    const callaYComeDBRecipes = [
        { name: 'Arroz al Curry Calla y Come (Versión Fit)', kcal: 450, protein: 42, carbs: 55, fat: 6, desc: 'Pechuga magra con leche de coco light y arroz basmati.' },
        { name: 'Ensalada César Proteica Calla y Come', kcal: 380, protein: 38, carbs: 12, fat: 14, desc: 'Salsa césar de queso fresco batido 0% y picatostes de espelta.' },
        { name: 'Tortilla de Patata Fit al Horno', kcal: 290, protein: 22, carbs: 28, fat: 9, desc: 'Hecha con claras y patata al vapor en freidora de aire.' },
        { name: 'Pasta de Espelta Bolognesa Magra', kcal: 510, protein: 48, carbs: 52, fat: 8, desc: 'Carne picada de pavo 99% magra con tomate natural triturado.' }
    ];

    document.getElementById('btn-open-callaycome-recipes-modal').addEventListener('click', () => {
        pickerContainer.innerHTML = '';
        callaYComeDBRecipes.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'picker-item-card';
            card.innerHTML = `
                <div class="picker-item-info">
                    <h4>${rec.name}</h4>
                    <p>${rec.desc}</p>
                    <small>⚡ ${rec.kcal} kcal | 🥩 ${rec.protein}g P | 🍚 ${rec.carbs}g C | 🥑 ${rec.fat}g G</small>
                </div>
                <button class="btn-primary btn-sm btn-import-this">
                    <i class="fa-solid fa-plus"></i> Importar
                </button>
            `;

            card.querySelector('.btn-import-this').addEventListener('click', () => {
                appState.dailyLogs.push({
                    id: Date.now().toString(),
                    meal: 'lunch',
                    name: rec.name,
                    servings: 1,
                    kcal: rec.kcal,
                    protein: rec.protein,
                    carbs: rec.carbs,
                    fat: rec.fat
                });
                saveState();
                updateDashboardUI();
                modalRecipes.classList.add('hidden');
            });

            pickerContainer.appendChild(card);
        });

        modalRecipes.classList.remove('hidden');
    });

    document.getElementById('btn-close-modal-recipes').addEventListener('click', () => modalRecipes.classList.add('hidden'));
    document.getElementById('btn-cancel-modal-recipes').addEventListener('click', () => modalRecipes.classList.add('hidden'));

    // =========================================================================
    // 6. GESTIÓN DE OBJETIVOS & FORMULARIO TDEE (CON SLIDERS SEGÚN FEEDBACK)
    // =========================================================================

    const tdeeForm = document.getElementById('tdee-calculator-form');
    const presetCards = document.querySelectorAll('.preset-card');
    const sliderP = document.getElementById('slider-protein');
    const sliderC = document.getElementById('slider-carbs');
    const sliderF = document.getElementById('slider-fats');
    const warningText = document.getElementById('slider-warning');

    // Carga inicial de datos en el formulario de Objetivos
    function loadGoalsFormUI() {
        const { age, gender, height, weight, targetWeight, activityLevel, fitnessGoal, macroPreset, customProteinPct, customCarbPct, customFatPct } = appState.userProfile;
        
        document.getElementById('input-age').value = age;
        document.getElementById('input-gender').value = gender;
        document.getElementById('input-height').value = height;
        document.getElementById('input-weight').value = weight;
        document.getElementById('input-target-weight').value = targetWeight;
        document.getElementById('input-activity').value = activityLevel;
        document.getElementById('input-fitness-goal').value = fitnessGoal;

        sliderP.value = customProteinPct;
        sliderC.value = customCarbPct;
        sliderF.value = customFatPct;

        selectPresetUI(macroPreset);
        updateCalculatedSummaryUI();
    }

    function updateCalculatedSummaryUI() {
        const meta = calculateMetabolism();
        document.getElementById('res-bmr').textContent = `${meta.bmr.toLocaleString('es-ES')} kcal`;
        document.getElementById('res-tdee').textContent = `${meta.tdee.toLocaleString('es-ES')} kcal`;
        document.getElementById('res-target-kcal').textContent = `${meta.targetCalories.toLocaleString('es-ES')} kcal`;

        // Actualizar etiquetas de sliders
        document.getElementById('lbl-slider-p').textContent = `${sliderP.value}% (${meta.targetProteinGrams}g)`;
        document.getElementById('lbl-slider-c').textContent = `${sliderC.value}% (${meta.targetCarbsGrams}g)`;
        document.getElementById('lbl-slider-f').textContent = `${sliderF.value}% (${meta.targetFatGrams}g)`;
        
        const sum = parseInt(sliderP.value) + parseInt(sliderC.value) + parseInt(sliderF.value);
        document.getElementById('total-macro-pct').textContent = sum;
        if (sum !== 100) {
            warningText.classList.remove('hidden');
        } else {
            warningText.classList.add('hidden');
        }
    }

    function selectPresetUI(presetName) {
        presetCards.forEach(card => {
            if (card.dataset.preset === presetName) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        appState.userProfile.macroPreset = presetName;

        if (presetName === 'high_protein') {
            sliderP.value = 40; sliderC.value = 35; sliderF.value = 25;
        } else if (presetName === 'balanced') {
            sliderP.value = 30; sliderC.value = 40; sliderF.value = 30;
        } else if (presetName === 'low_carb') {
            sliderP.value = 45; sliderC.value = 20; sliderF.value = 35;
        }

        appState.userProfile.customProteinPct = parseInt(sliderP.value);
        appState.userProfile.customCarbPct = parseInt(sliderC.value);
        appState.userProfile.customFatPct = parseInt(sliderF.value);

        updateCalculatedSummaryUI();
    }

    presetCards.forEach(card => {
        card.addEventListener('click', () => {
            selectPresetUI(card.dataset.preset);
        });
    });

    // Eventos de cambio en los sliders (Cambia automáticamente a "Personalizada")
    [sliderP, sliderC, sliderF].forEach(slider => {
        slider.addEventListener('input', () => {
            selectPresetUI('custom');
        });
    });

    tdeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        appState.userProfile.age = parseInt(document.getElementById('input-age').value) || 25;
        appState.userProfile.gender = document.getElementById('input-gender').value;
        appState.userProfile.height = parseFloat(document.getElementById('input-height').value) || 170;
        appState.userProfile.weight = parseFloat(document.getElementById('input-weight').value) || 70;
        appState.userProfile.targetWeight = parseFloat(document.getElementById('input-target-weight').value) || 65;
        appState.userProfile.activityLevel = document.getElementById('input-activity').value;
        appState.userProfile.fitnessGoal = document.getElementById('input-fitness-goal').value;

        saveState();
        updateCalculatedSummaryUI();
        updateDashboardUI();
        alert('¡Objetivos y metabolismo recalculados correctamente!');
    });

    document.getElementById('btn-save-goals').addEventListener('click', () => {
        saveState();
        updateDashboardUI();
        alert('¡Configuración de Macronutrientes guardada!');
    });

    // =========================================================================
    // 7. STRAVA & PULSERAS DE ACTIVIDAD (SIMULADOR Y TABLA)
    // =========================================================================

    function renderActivitiesTable() {
        const tbody = document.getElementById('activities-table-body');
        tbody.innerHTML = '';

        appState.stravaActivities.forEach(act => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${act.date}</td>
                <td><span class="badge-status"><i class="fa-brands fa-strava text-orange"></i> Strava API</span></td>
                <td><strong style="text-transform: capitalize;">${act.title.toLowerCase().includes('carrera') ? 'Carrera 🏃' : 'Entrenamiento 🏋️'}</strong></td>
                <td>${act.title}</td>
                <td>${act.duration}</td>
                <td>${act.distance}</td>
                <td><strong class="text-orange">+${act.calories} kcal</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Simulador interactivo en vivo
    document.getElementById('sim-run').addEventListener('click', () => {
        appState.stravaActivities.unshift({
            id: `act-${Date.now()}`,
            date: 'Ahora mismo',
            source: 'strava',
            title: 'Carrera simulada de prueba (Strava)',
            duration: '35 min',
            distance: '6.5 km',
            calories: 380,
            hr: 155
        });
        saveState();
        updateDashboardUI();
    });

    document.getElementById('sim-gym').addEventListener('click', () => {
        appState.stravaActivities.unshift({
            id: `act-${Date.now()}`,
            date: 'Ahora mismo',
            source: 'strava',
            title: 'Sesión de Pesas & Fuerza (Strava)',
            duration: '45 min',
            distance: '0 km',
            calories: 240,
            hr: 135
        });
        saveState();
        updateDashboardUI();
    });

    document.getElementById('sim-bike').addEventListener('click', () => {
        appState.stravaActivities.unshift({
            id: `act-${Date.now()}`,
            date: 'Ahora mismo',
            source: 'strava',
            title: 'Ruta en Ciclismo Urbano (Strava)',
            duration: '50 min',
            distance: '15.2 km',
            calories: 450,
            hr: 142
        });
        saveState();
        updateDashboardUI();
    });

    document.getElementById('sim-clear').addEventListener('click', () => {
        appState.stravaActivities = [];
        saveState();
        updateDashboardUI();
    });

    document.getElementById('btn-oauth-strava').addEventListener('click', () => {
        alert('Redirigiendo a Strava OAuth 2.0...\n(Permisos: read, activity:read_all)\nSincronización activa.');
    });

    // =========================================================================
    // 8. RECETAS FIT ADAPTADAS
    // =========================================================================

    const fitRecipesData = [
        {
            title: 'Pollo al Curry Calla y Come FIT',
            img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
            kcal: 450, p: 42, c: 55, f: 6,
            adaptation: 'Sustitución de nata entera por leche de coco ligera y queso batido 0%. Proteína pura sin grasas saturadas.'
        },
        {
            title: 'Tortilla de Patata Fit Calla y Come',
            img: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=500&auto=format&fit=crop&q=80',
            kcal: 290, p: 22, c: 28, f: 9,
            adaptation: 'Elaborada con 80% claras de huevo y patata cocida al vapor en freidora de aire con pulverizador de AOVE.'
        },
        {
            title: 'Spaghetti Bolognesa Proteicos',
            img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=500&auto=format&fit=crop&q=80',
            kcal: 510, p: 48, c: 52, f: 8,
            adaptation: 'Pasta de espelta integral con carne picada de pavo 99% magra y salsa de tomate casera sin azúcares añadidos.'
        }
    ];

    function renderFitRecipesUI() {
        const container = document.getElementById('fit-recipes-container');
        container.innerHTML = '';

        fitRecipesData.forEach(r => {
            const card = document.createElement('div');
            card.className = 'glass-card recipe-card';
            card.innerHTML = `
                <div class="recipe-img-wrap">
                    <img src="${r.img}" alt="${r.title}">
                    <span class="recipe-fit-badge">Versión FIT</span>
                </div>
                <div class="recipe-card-content">
                    <h3>${r.title}</h3>
                    <div class="recipe-macros-bar">
                        <span>⚡ ${r.kcal} kcal</span> •
                        <span>🥩 ${r.p}g P</span> •
                        <span>🍚 ${r.c}g C</span> •
                        <span>🥑 ${r.f}g G</span>
                    </div>
                    <div class="recipe-adaptation-box">
                        <strong>Adaptación Calla y Come:</strong>
                        ${r.adaptation}
                    </div>
                    <button class="btn-primary btn-sm w-100 btn-add-recipe-log">
                        <i class="fa-solid fa-plus"></i> Añadir a mi Diario
                    </button>
                </div>
            `;

            card.querySelector('.btn-add-recipe-log').addEventListener('click', () => {
                appState.dailyLogs.push({
                    id: Date.now().toString(),
                    meal: 'lunch',
                    name: r.title,
                    servings: 1,
                    kcal: r.kcal,
                    protein: r.p,
                    carbs: r.c,
                    fat: r.f
                });
                saveState();
                updateDashboardUI();
                alert(`¡${r.title} añadida a tu diario!`);
            });

            container.appendChild(card);
        });
    }

    // =========================================================================
    // 9. GRÁFICOS DE PROGRESO (CHART.JS)
    // =========================================================================

    let chartWeight = null;
    let chartBalance = null;

    function renderCharts() {
        const ctxWeight = document.getElementById('chart-weight-evolution').getContext('2d');
        const ctxBalance = document.getElementById('chart-weekly-balance').getContext('2d');

        if (chartWeight) chartWeight.destroy();
        if (chartBalance) chartBalance.destroy();

        // Gráfico de Peso
        const labelsW = appState.weightHistory.map(h => h.date);
        const dataW = appState.weightHistory.map(h => h.weight);

        chartWeight = new Chart(ctxWeight, {
            type: 'line',
            data: {
                labels: labelsW,
                datasets: [{
                    label: 'Peso (kg)',
                    data: dataW,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });

        // Gráfico de Balance Semanal (Consumidas vs Objetivo)
        chartBalance = new Chart(ctxBalance, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [
                    {
                        label: 'Calorías Consumidas',
                        data: [1850, 1720, 1800, 1690, 1900, 2100, 1800],
                        backgroundColor: '#3B82F6',
                        borderRadius: 6
                    },
                    {
                        label: 'Meta Base',
                        data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
                        type: 'line',
                        borderColor: '#F97316',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94A3B8' } } },
                scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                    y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    // =========================================================================
    // INICIALIZACIÓN GENERAL
    // =========================================================================
    loadGoalsFormUI();
    updateDashboardUI();
    renderFitRecipesUI();
});
