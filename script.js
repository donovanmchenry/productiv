// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Variables for experience and level
    let experience = 0;
    let level = 1;
    let experienceNeeded = 100;
    let xpMultiplier = 1;

    // Materials and item types for procedural generation
    const baseMaterials = ['Wooden', 'Stone', 'Iron', 'Steel', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Mythril', 'Adamantite'];
    const itemTypes = ['Sword', 'Shield', 'Armor', 'Potion'];

    // Inventory and equipped items
    let inventory = [];
    let equipped = {
        weapon: null,
        armor: null,
        shield: null
    };

    // Sound effects
    let enableSounds = true;
    const clickSound = new Audio('click.mp3');
    const completeSound = new Audio('complete.mp3');

    // Background music variables
    let player;
    let bgMusicLink = '';

    // Get references to DOM elements
    const levelDisplay = document.getElementById('level');
    const levelProgressBar = document.getElementById('level-progress-bar');
    const avatar = document.getElementById('avatar');
    const tasksBtn = document.getElementById('tasksBtn');
    const goalsBtn = document.getElementById('goalsBtn');
    const inventoryBtn = document.getElementById('inventoryBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const timerBtn = document.getElementById('timerBtn');
    const tasksPage = document.getElementById('tasksPage');
    const goalsPage = document.getElementById('goalsPage');
    const inventoryPage = document.getElementById('inventoryPage');
    const settingsPage = document.getElementById('settingsPage');
    const timerPage = document.getElementById('timerPage');

    const tasksList = document.getElementById('tasksList');
    const goalsList = document.getElementById('goalsList');
    const inventoryList = document.getElementById('inventoryList');

    const bgMusicInput = document.getElementById('bgMusicLink');
    const saveMusicBtn = document.getElementById('saveMusicBtn');
    const enableSoundsCheckbox = document.getElementById('enableSounds');

    const equippedWeaponDisplay = document.getElementById('equippedWeapon');
    const equippedArmorDisplay = document.getElementById('equippedArmor');
    const equippedShieldDisplay = document.getElementById('equippedShield');

    // Get references to new settings elements
    const colorSchemeSelect = document.getElementById('colorScheme');
    const fontSelector = document.getElementById('fontSelector');
    const avatarUpload = document.getElementById('avatarUpload');
    const fontStylesheet = document.getElementById('fontStylesheet');
    const backgroundUpload = document.getElementById('backgroundUpload');

    // Reference to the level up notification elements
    const levelUpNotification = document.getElementById('levelUpNotification');
    const levelUpMessage = document.getElementById('levelUpMessage');

    // Reference to the inventory notification elements
    const inventoryNotification = document.getElementById('inventoryNotification');
    const inventoryMessage = document.getElementById('inventoryMessage');

    // Confetti canvas
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiInstance = confetti.create(confettiCanvas, { resize: true });

    // Event listeners for menu buttons
    tasksBtn.addEventListener('click', () => { playClickSound(); showPage('tasks'); });
    goalsBtn.addEventListener('click', () => { playClickSound(); showPage('goals'); });
    inventoryBtn.addEventListener('click', () => { playClickSound(); showPage('inventory'); displayInventory(); });
    settingsBtn.addEventListener('click', () => { playClickSound(); showPage('settings'); });
    timerBtn.addEventListener('click', () => { playClickSound(); showPage('timer'); });

    // Event listener for save music button
    saveMusicBtn.addEventListener('click', () => {
        playClickSound();
        const url = bgMusicInput.value.trim();
        const videoId = extractYouTubeID(url);
        if (videoId) {
            bgMusicLink = videoId;
            if (player) {
                player.loadVideoById(bgMusicLink);
            } else {
                onYouTubeIframeAPIReady();
            }
        } else {
            alert('Invalid YouTube link.');
        }
    });

    // Event listener for enable sounds checkbox
    enableSoundsCheckbox.addEventListener('change', () => {
        enableSounds = enableSoundsCheckbox.checked;
    });

    // Event listener for color scheme change
    colorSchemeSelect.addEventListener('change', () => {
        const selectedScheme = colorSchemeSelect.value;
        document.body.className = selectedScheme;
    });

    // Load fonts and populate dropdown
    const availableFonts = ['Roboto', 'Open Sans', 'Lato', 'Montserrat'];
    availableFonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        fontSelector.appendChild(option);
    });

    // Change font based on selection
    fontSelector.addEventListener('change', () => {
        const selectedFont = fontSelector.value;
        updateFont(selectedFont);
    });

    // Update the page font
    function updateFont(fontName) {
        const newFontURL = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}&display=swap`;
        fontStylesheet.href = newFontURL;
        document.body.style.fontFamily = `${fontName}, sans-serif`;
    }

    // Function to adjust color brightness
    function adjustColorBrightness(hex, percent) {
        hex = hex.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        r = parseInt(r * (100 + percent) / 100);
        g = parseInt(g * (100 + percent) / 100);
        b = parseInt(b * (100 + percent) / 100);

        r = (r < 255) ? r : 255;
        g = (g < 255) ? g : 255;
        b = (b < 255) ? b : 255;

        const newHex = "#" + (("0" + r.toString(16)).slice(-2)) + (("0" + g.toString(16)).slice(-2)) + (("0" + b.toString(16)).slice(-2));
        return newHex;
    }

    // Function to show pages
    function showPage(page) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.add('hidden'));

        // Show selected page
        switch (page) {
            case 'tasks':
                tasksPage.classList.remove('hidden');
                break;
            case 'goals':
                goalsPage.classList.remove('hidden');
                break;
            case 'inventory':
                inventoryPage.classList.remove('hidden');
                break;
            case 'settings':
                settingsPage.classList.remove('hidden');
                break;
            case 'timer':
                timerPage.classList.remove('hidden');
                break;
        }
    }

    // Function to add task
    const addTaskBtn = document.getElementById('addTaskBtn');
    addTaskBtn.addEventListener('click', addTask);

    function addTask() {
        playClickSound();
        const taskInput = document.getElementById('newTask');
        const taskText = taskInput.value.trim();
        if (taskText) {
            const li = document.createElement('li');
            li.textContent = taskText;
            li.addEventListener('click', completeTask);
            tasksList.appendChild(li);
            taskInput.value = '';
        }
    }

    // Function to complete task with animation
    function completeTask(event) {
        const li = event.target;
        li.removeEventListener('click', completeTask);
        li.classList.add('completed');
        li.addEventListener('transitionend', function () {
            li.remove();
        });
        addExperience(10); // Tasks give 10 XP
        playCompleteSound();
    }

    // Function to add goal
    const addGoalBtn = document.getElementById('addGoalBtn');
    addGoalBtn.addEventListener('click', addGoal);

    function addGoal() {
        playClickSound();
        const goalInput = document.getElementById('newGoal');
        const goalText = goalInput.value.trim();
        if (goalText) {
            const li = document.createElement('li');
            li.textContent = goalText;
            li.addEventListener('click', completeGoal);
            goalsList.appendChild(li);
            goalInput.value = '';
        }
    }

    // Function to complete goal with animation
    function completeGoal(event) {
        const li = event.target;
        li.removeEventListener('click', completeGoal);
        li.classList.add('completed');
        li.addEventListener('transitionend', function () {
            li.remove();
        });
        addExperience(30); // Goals give 30 XP
        playCompleteSound();
    }

    // Function to add experience
    function addExperience(amount) {
        experience += amount * xpMultiplier;
        if (experience >= experienceNeeded) {
            levelUp();
        }
        updateLevelDisplay();
    }

    // Function to level up
    function levelUp() {
        level++;
        experience = experience - experienceNeeded;
        experienceNeeded = Math.floor(experienceNeeded * 1.5);
        const newItem = generateItem();
        addItemToInventory(newItem);
        showLevelUpNotification(level, newItem.name);
        launchConfetti();
    }

    // Function to show level up notification
    function showLevelUpNotification(level, itemName) {
        levelUpMessage.textContent = 'Congratulations! You have reached level ' + level + ' and received a ' + itemName + '!';
        levelUpNotification.classList.remove('hidden');
        levelUpNotification.classList.add('animate');

        levelUpNotification.addEventListener('animationend', function handler() {
            levelUpNotification.classList.remove('animate');
            levelUpNotification.removeEventListener('animationend', handler);
        });

        levelUpNotification.classList.add('show');
        setTimeout(() => {
            levelUpNotification.classList.remove('show');
            levelUpNotification.style.transition = 'opacity 0.5s ease';
            levelUpNotification.style.opacity = '0';
            setTimeout(() => {
                levelUpNotification.classList.add('hidden');
                levelUpNotification.style.opacity = '';
                levelUpNotification.style.transition = '';
            }, 500);
        }, 3000);
    }

    // Function to show inventory notification
    function showInventoryNotification(message) {
        inventoryMessage.textContent = message;
        inventoryNotification.classList.remove('hidden');
        inventoryNotification.classList.add('animate');

        inventoryNotification.addEventListener('animationend', function handler() {
            inventoryNotification.classList.remove('animate');
            inventoryNotification.removeEventListener('animationend', handler);
        });

        inventoryNotification.classList.add('show');
        setTimeout(() => {
            inventoryNotification.classList.remove('show');
            inventoryNotification.style.transition = 'opacity 0.5s ease';
            inventoryNotification.style.opacity = '0';
            setTimeout(() => {
                inventoryNotification.classList.add('hidden');
                inventoryNotification.style.opacity = '';
                inventoryNotification.style.transition = '';
            }, 500);
        }, 3000);
    }

    // Function to launch confetti
    function launchConfetti() {
        confettiInstance({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Function to update level display
    function updateLevelDisplay() {
        levelDisplay.textContent = 'Level ' + level;
        const progressPercentage = (experience / experienceNeeded) * 100;
        levelProgressBar.style.width = progressPercentage + '%';
    }

    // Function to generate items based on level
    function generateItem() {
        const material = getMaterialForLevel(level);
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const itemName = material + ' ' + itemType;
        let multiplierBonus = getMultiplierBonus(material, itemType);

        return {
            name: itemName,
            type: itemType,
            material: material,
            multiplierBonus: multiplierBonus,
            quantity: 1
        };
    }

    // Function to get material based on level
    function getMaterialForLevel(level) {
        const tier = Math.floor((level - 1) / 5);
        if (tier < baseMaterials.length) {
            return baseMaterials[tier];
        } else {
            return generateMaterialName(tier);
        }
    }

    // Function to generate material names procedurally
    function generateMaterialName(tier) {
        const prefixes = ['Ultra', 'Mega', 'Hyper', 'Super', 'Max', 'Neo', 'Omega', 'Alpha', 'Eternal', 'Quantum'];
        const suffixes = ['ium', 'ite', 'on', 'ore', 'stone', 'crystal', 'essence', 'metal', 'alloy', 'flux'];

        const prefixIndex = Math.floor(tier / suffixes.length) % prefixes.length;
        const suffixIndex = tier % suffixes.length;

        const prefix = prefixes[prefixIndex];
        const suffix = suffixes[suffixIndex];

        return prefix + suffix;
    }

    // Function to determine multiplier bonus based on material and item type
    function getMultiplierBonus(material, itemType) {
        const baseBonuses = {
            'Sword': 0.2,
            'Shield': 0.1,
            'Armor': 0.3,
            'Potion': 0.5
        };

        const tierIncrease = {
            'Sword': 0.02,
            'Shield': 0.01,
            'Armor': 0.03,
            'Potion': 0.05
        };

        let tier;
        const materialIndex = baseMaterials.indexOf(material);
        if (materialIndex !== -1) {
            tier = materialIndex;
        } else {
            tier = Math.floor((level - 1) / 5);
        }

        return baseBonuses[itemType] + (tier * tierIncrease[itemType]);
    }

    // Function to add item to inventory
    function addItemToInventory(newItem) {
        const existingItem = inventory.find(item => item.name === newItem.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            inventory.push(newItem);
        }
    }

    // Function to display inventory
    function displayInventory() {
        inventoryList.innerHTML = '';
        inventory.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item.name;
            li.dataset.index = index;

            if (item.quantity > 1) {
                li.setAttribute('data-quantity', item.quantity);
            }

            li.addEventListener('click', () => useItem(item, index));
            inventoryList.appendChild(li);
        });
        updateEquippedDisplay();
    }

    // Function to use item
    function useItem(item, index) {
        playClickSound();
        if (item.quantity > 1) {
            const duplicates = item.quantity - 1;
            const xpFromDuplicate = 20 * duplicates;
            addExperience(xpFromDuplicate);
            item.quantity = 1;
            displayInventory();
            showInventoryNotification('You converted ' + duplicates + ' duplicate(s) of ' + item.name + ' into ' + xpFromDuplicate + ' XP!');
            launchConfetti();
        } else {
            if (item.type === 'Potion') {
                xpMultiplier += item.multiplierBonus;
                inventory.splice(index, 1);
                displayInventory();
                const resetMultiplier = () => {
                    xpMultiplier -= item.multiplierBonus;
                    if (xpMultiplier < 1) xpMultiplier = 1;
                };
                const originalCompleteTask = completeTask;
                const originalCompleteGoal = completeGoal;
                completeTask = function (event) {
                    originalCompleteTask(event);
                    resetMultiplier();
                    completeTask = originalCompleteTask;
                };
                completeGoal = function (event) {
                    originalCompleteGoal(event);
                    resetMultiplier();
                    completeGoal = originalCompleteGoal;
                };
                showInventoryNotification('You drank a ' + item.name + '! XP multiplier increased by ' + item.multiplierBonus.toFixed(2) + ' for the next task.');
                launchConfetti();
            } else if (item.type === 'Sword') {
                if (equipped.weapon) {
                    xpMultiplier -= equipped.weapon.multiplierBonus;
                    addItemToInventory(equipped.weapon);
                }
                equipped.weapon = item;
                xpMultiplier += item.multiplierBonus;
                inventory.splice(index, 1);
                displayInventory();
                showInventoryNotification('You equipped a ' + item.name + '! XP multiplier increased by ' + item.multiplierBonus.toFixed(2) + '.');
                launchConfetti();
            } else if (item.type === 'Shield') {
                if (equipped.shield) {
                    xpMultiplier -= equipped.shield.multiplierBonus;
                    addItemToInventory(equipped.shield);
                }
                equipped.shield = item;
                xpMultiplier += item.multiplierBonus;
                inventory.splice(index, 1);
                displayInventory();
                showInventoryNotification('You equipped a ' + item.name + '! XP multiplier increased by ' + item.multiplierBonus.toFixed(2) + '.');
                launchConfetti();
            } else if (item.type === 'Armor') {
                if (equipped.armor) {
                    xpMultiplier -= equipped.armor.multiplierBonus;
                    addItemToInventory(equipped.armor);
                }
                equipped.armor = item;
                xpMultiplier += item.multiplierBonus;
                inventory.splice(index, 1);
                displayInventory();
                showInventoryNotification('You equipped ' + item.name + '! XP multiplier increased by ' + item.multiplierBonus.toFixed(2) + '.');
                launchConfetti();
            }
            updateEquippedDisplay();
        }
    }

    // Function to update equipped items display
    function updateEquippedDisplay() {
        equippedWeaponDisplay.textContent = 'Weapon: ' + (equipped.weapon ? equipped.weapon.name : 'None');
        equippedArmorDisplay.textContent = 'Armor: ' + (equipped.armor ? equipped.armor.name : 'None');
        equippedShieldDisplay.textContent = 'Shield: ' + (equipped.shield ? equipped.shield.name : 'None');
    }

    // Pomodoro timer
    let timerInterval;
    let timeRemaining;
    let isWorkTime = true;
    let isTimerRunning = false;

    const workTimeInput = document.getElementById('workTime');
    const breakTimeInput = document.getElementById('breakTime');
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');

    startTimerBtn.addEventListener('click', () => { playClickSound(); startTimer(); });
    pauseTimerBtn.addEventListener('click', () => { playClickSound(); pauseTimer(); });
    resetTimerBtn.addEventListener('click', () => { playClickSound(); resetTimer(); });

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        if (timeRemaining === undefined || timeRemaining === null) {
            isWorkTime = true;
            timeRemaining = parseInt(workTimeInput.value) * 60;
        }
        updateTimerDisplay();
        timerInterval = setInterval(timerTick, 1000);
    }

    function pauseTimer() {
        if (!isTimerRunning) return;
        isTimerRunning = false;
        clearInterval(timerInterval);
    }

    function resetTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
        isWorkTime = true;
        timeRemaining = parseInt(workTimeInput.value) * 60;
        updateTimerDisplay();
    }

    function timerTick() {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            if (isWorkTime) {
                alert('Work session complete! Time for a break.');
                isWorkTime = false;
                timeRemaining = parseInt(breakTimeInput.value) * 60;
            } else {
                alert('Break over! Back to work.');
                isWorkTime = true;
                timeRemaining = parseInt(workTimeInput.value) * 60;
            }
            updateTimerDisplay();
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const seconds = (timeRemaining % 60).toString().padStart(2, '0');
        timerDisplay.textContent = minutes + ':' + seconds;
    }

    // Sound functions
    function playClickSound() {
        if (enableSounds) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
    }

    function playCompleteSound() {
        if (enableSounds) {
            completeSound.currentTime = 0;
            completeSound.play();
        }
    }

    // Function to extract YouTube video ID from URL
    function extractYouTubeID(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Load YouTube IFrame Player API
    window.onYouTubeIframeAPIReady = function () {
        if (bgMusicLink) {
            player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: bgMusicLink,
                events: {
                    'onReady': onPlayerReady,
                    'onError': onPlayerError
                },
                playerVars: {
                    'autoplay': 1,
                    'loop': 1,
                    'playlist': bgMusicLink,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'showinfo': 0
                }
            });
        }
    };

    function onPlayerReady(event) {
        event.target.playVideo();
    }

    function onPlayerError(event) {
        console.error('YouTube Player Error:', event.data);
    }

    // Create a hidden div for the YouTube player
    const playerDiv = document.createElement('div');
    playerDiv.id = 'player';
    document.body.appendChild(playerDiv);

    // Handle Avatar Upload
    avatarUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                avatar.style.backgroundImage = `url(${e.target.result})`;
                localStorage.setItem('avatarImage', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    const savedAvatar = localStorage.getItem('avatarImage');
    if (savedAvatar) {
        avatar.style.backgroundImage = `url(${savedAvatar})`;
    }

    // Handle Background Image Upload
    backgroundUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.documentElement.style.setProperty('--background-image', `url(${e.target.result})`);
                localStorage.setItem('backgroundImage', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
        document.documentElement.style.setProperty('--background-image', `url(${savedBackground})`);
    }

    updateLevelDisplay();
});
