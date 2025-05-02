//localStorage.clear();

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreUI');
const livesElement = document.getElementById('livesUI');
const gameContainer = document.querySelector('.game-container');
const startContainer = document.querySelector('.start-container');
const gameOverContainer = document.querySelector('.gameover-container');
const blockchainScoresElement = document.getElementById('blockchainScores');
const localScoresElement = document.getElementById('localScores');
const nameInputElement = document.getElementById('nameInput');
const startButtonElement = document.getElementById('startButton');
const playAgainButtonElement = document.getElementById('playAgainButton');
const mainMenuButtonElement = document.getElementById('mainMenuButton');
const nameWarningElement = document.getElementById("nameWarning");

// Add these variables at the top with other variables
let lastTime = 0;
const FPS = 60;
const frameTime = 1000 / FPS;

function displayLocalScores() {
    const localScoresElement = document.getElementById("localScores");
    localScoresElement.innerHTML = '';  // önceki skorları temizle

    const localScores = JSON.parse(localStorage.getItem('scores')) || [];
    
    // LocalScores'u azalan sıraya göre sırala
    localScores.sort((a, b) => b.score - a.score);

    // İlk 10 skoru listele
    for (let i = 0; i < Math.min(localScores.length, 10); i++) {
        const item = localScores[i];
        const listItem = document.createElement('li');
        const playerName = item.name.trim().padEnd(20, '.');
        const scoreStr = item.score.toString().padStart(6, '0');
        listItem.innerHTML = `${playerName} ${scoreStr}`;
        localScoresElement.appendChild(listItem);
    }
}

function saveLocalScore(username, score) {
    const localScores = JSON.parse(localStorage.getItem('localScores')) || [];
    localScores.push({ name: username, score: score });
    localStorage.setItem('localScores', JSON.stringify(localScores));
}

function loadLocalScores() {
    const jsonData = JSON.parse(localStorage.getItem('localScores')) || [];
    
    for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
        const item = jsonData[i];
        const listItem = document.createElement('li');
        const playerName = item.name.trim().padEnd(20, '.');
        const scoreStr = item.score.toString().padStart(6, '0');
        listItem.innerHTML = `${playerName}${scoreStr}`;
        localScoresElement.appendChild(listItem);
    }
}

// Game State Handle
function startGame() {
    localStorage.setItem('Name', nameInputElement.value.toUpperCase());
    localStorage.setItem('Score', '0');
    localStorage.setItem('GameState', '0');
    playMusic('gameplay'); 
    gameRunning = true;
}

function gameOver() { 
    showExplosion(() => {
        gameoverSound.currentTime = 0;
        gameoverSound.play();
        finalizeGameOver();
    });
}

function showExplosion(callback) {
    //playSound('sfx/player_explosion.mp3', 0.8); 
    playerExplosionSound.currentTime = 0; 
    playerExplosionSound.play();

    Player.visible = false;
    const explosion = document.getElementById('explosionGif');
    explosion.style.display = 'block';
    
    explosion.style.left = `${player.position.x}px`;
    explosion.style.top = `${player.position.y}px`;
  
    gameRunning = false;

    setTimeout(() => {
        explosion.style.display = 'none';
        callback(); 
    }, 1500); 
}

function finalizeGameOver() {
    stopCurrentMusic();
    document.getElementById('toggleMusicButton').style.display = 'none'; 

    const finalScore = score;
    const playerName = nameInputElement.value.trim().toUpperCase();

    if (playerName) {
        submitScore(playerName, finalScore);
    }

    gameContainer.style.display = 'none';
    startContainer.style.display = 'none';

    gameOverContainer.style.display = 'flex';

    document.getElementById('gameOverPlayerName').textContent = playerName;
    document.getElementById('gameOverScore').textContent = `Your Score: ${finalScore}`;

    //startContainer.style.display = 'flex';
    //gameContainer.style.display = 'none';
    //nameInputElement.value = '';
}

function resetGame() {
    score = 0;
    lives = 3;
    Player.visible = true;
    Invader.lowestY = 0;
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
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Add this function to start animation
function startGameLoop() {
    requestAnimationFrame(gameLoop);
}

async function init() {
    // Play Main Menu music
    //mainMenuAmbientMusic.currentTime = 0;
    //mainMenuAmbientMusic.play();
    playMusic('menu');
    
    // Set canvas dimensions
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    initializeBlockchain();

    // Display high scores
    displayBlockchainScores();
    displayLocalScores();


    // Add event listener to start button
    startButtonElement.addEventListener('click', () => {
        const playerName = nameInputElement.value.trim();
        if (playerName.length >= 3) {
            // Hide start screen, show game screen
            nameWarningElement.style.display = 'none';
            nameInputElement.style.border = '2px solid lime';
            nameInputElement.classList.remove('shake');

            startContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            
            // Start the game
            startGame();
            resetGame();
            startGameLoop();
        }
        else {
            // Show warning
            nameWarningElement.style.display = 'block';
            nameInputElement.style.border = '2px solid red';

            // Shake animasyonu tetikle
            nameInputElement.classList.remove('shake'); // önce temizle
            void nameInputElement.offsetWidth;          // tekrar tetiklemek için "hack"
            nameInputElement.classList.add('shake');
        }
    });
    
    // Set initial display state
    startContainer.style.display = 'flex';
    gameContainer.style.display = 'none';
}

// Game Loop - Arka plan resmi ekleniyor
function gameLoop(currentTime) {
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    
    // Only update if enough time has passed
    if (deltaTime >= frameTime) {
        // Arkaplan resmini çiz (temizleme işlemi yerine)
        if (backgroundImage.complete) {
            // Resim tamamen yüklendiğinde çiz
            ctx.drawImage(backgroundImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);
        } else {
            // Resim henüz yüklenmediyse siyah arka plan kullan
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
        
        if (gameRunning) {
            if (keys.Left) {
                player.velocity.x = -PLAYER_SPEED;
            } else if (keys.Right) {
                player.velocity.x = PLAYER_SPEED;
            } else {
                player.velocity.x = 0;
            }
            
            if (keys.Up) {
                player.velocity.y = -PLAYER_SPEED;
            } else if (keys.Down) {
                player.velocity.y = PLAYER_SPEED;
            } else {
                player.velocity.y = 0;
            }
            
            
            if(keys.Space) {
                player.fire();
            }
            
            player.update();
            updateInvaders();
            updateBullets();
        }
        
        player.draw();
        invaders.forEach(invader => invader.draw());
        bullets.forEach(bullet => bullet.draw());
        
        lastTime = currentTime;
    }
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('DOMContentLoaded', init);

playAgainButtonElement.addEventListener('click', () => {
    gameOverContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    startGame();
    resetGame();
    startGameLoop();
    playMusic('gameplay');
    document.getElementById('toggleMusicButton').style.display = 'inline-block';
});

mainMenuButtonElement.addEventListener('click', () => {
    nameInputElement.value = '';
    gameOverContainer.style.display = 'none';
    startContainer.style.display = 'flex';

    playMusic('menu');
    document.getElementById('toggleMusicButton').style.display = 'inline-block';
});

