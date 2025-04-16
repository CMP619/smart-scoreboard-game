//localStorage.clear();

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreUI');
const livesElement = document.getElementById('livesUI');
const gameContainer = document.querySelector('.game-container');
const startContainer = document.querySelector('.start-container');
const scoreListElement = document.getElementById('scoreList');
const nameInputElement = document.getElementById('nameInput');
const startButtonElement = document.getElementById('startButton');

// Score Logic
function displayHighScores() {
    scoreListElement.innerHTML = '';
    
    const jsonData = JSON.parse(localStorage.getItem('ScoreList')) || [];
    
    for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
        const item = jsonData[i];
        const listItem = document.createElement('li');
        listItem.innerHTML = `${item.name} ${item.score}`;
        scoreListElement.appendChild(listItem);
    }
}

function addHighScore(name, score) {
    const scoreNum = parseInt(score, 10);
    const jsonData = JSON.parse(localStorage.getItem('ScoreList')) || [];

    jsonData.push({ name, score: scoreNum });
    jsonData.sort((a, b) => b.score - a.score);
    
    displayHighScores();
}

// Game State Handle

function startGame() {
    localStorage.setItem('Name', nameInputElement.value.toUpperCase());
    localStorage.setItem('Score', '0');
    localStorage.setItem('GameState', '0');
}

function gameOver() {
    localStorage.setItem('Score', score.toString());
    localStorage.setItem('GameState', '1');
}

function resetGame() {
    score = 0;
    lives = 3;
    gameRunning = true;
    
    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    // Create player
    player = new Player(ASSETS.player01.src);
    
    // Create invaders
    createInvaders();
    
    // Clear bullets
    bullets = [];
}

function init() {
    // Set canvas dimensions
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Display high scores
    displayHighScores();
    
    // Add event listener to start button
    startButtonElement.addEventListener('click', () => {
        const playerName = nameInputElement.value.trim();
        if (playerName.length >= 3) {
            // Hide start screen, show game screen
            startContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            
            // Start the game
            startGame();
            resetGame();
        }
    });
    
    // Check game state when page loads
    const gameState = localStorage.getItem('GameState');
    if (gameState === '1') {
        // Game ended - show high score entry
        const playerName = localStorage.getItem('PlayerName') || '';
        const score = localStorage.getItem('Score') || '0';
        
        if (playerName && score) {
            addHighScore(playerName, score);
            localStorage.setItem('GameState', '2'); // Reset game state
        }
        
        startContainer.style.display = 'flex';
        gameContainer.style.display = 'none';
    } else {
        // Start at title screen
        startContainer.style.display = 'flex';
        gameContainer.style.display = 'none';
    }
}

// Game Loop
function gameLoop() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    if (gameRunning) {
        if (keys.Left) {
            player.velocity.x = -PLAYER_SPEED;
        } else if (keys.Right) {
            player.velocity.x = PLAYER_SPEED;
        } else {
            player.velocity.x = 0;
        }
        
        if(keys.Space) {
            player.fire();
        }
        
        player.update();
        updateInvaders();
        updateBullets();
    } else if (keys.Space) {
        resetGame();
    }
    
    player.draw();
    invaders.forEach(invader => invader.draw());
    bullets.forEach(bullet => bullet.draw());
    
    requestAnimationFrame(gameLoop);
}

init();