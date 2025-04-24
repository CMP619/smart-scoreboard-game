//localStorage.clear();

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreUI');
const livesElement = document.getElementById('livesUI');
const gameContainer = document.querySelector('.game-container');
const startContainer = document.querySelector('.start-container');
const gameOverContainer = document.querySelector('.gameover-container');
const scoreListElement = document.getElementById('scoreList');
const nameInputElement = document.getElementById('nameInput');
const startButtonElement = document.getElementById('startButton');
const playAgainButtonElement = document.getElementById('playAgainButton');
const mainMenuButtonElement = document.getElementById('mainMenuButton');

// Add these variables at the top with other variables
let lastTime = 0;
const FPS = 60;
const frameTime = 1000 / FPS;

// ABI (Application Binary Interface): javascript - smart contract communication interface
const contractABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "getScore",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "username",
                "type": "string"
            },
            {
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "submitScore",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]; 
const contractAddress = '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47';  // Our contract address

// Submitting the scoreboard input to blockchain
async function submitToBlockchain(username, score) {
  try {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:7545');  // Remix VM default RPC URL
    const signer = provider.getSigner(0);  // There is 10 dummy accounts on that network, we choose the first one 

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    const tx = await contract.submitScore(username, score);
    await tx.wait(); 

    console.log(`Transaction successful! Hash: ${tx.hash}`);
  } catch (error) {
    console.error('Error submitting to blockchain:', error);
  }
}

// Score Logic
function displayHighScores() {
    scoreListElement.innerHTML = '';
    
    const jsonData = JSON.parse(localStorage.getItem('ScoreList')) || [];
    
    for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
        const item = jsonData[i];
        const listItem = document.createElement('li');
        // Fix score formatting
        const playerName = item.name.trim().padEnd(10, '.');
        const scoreStr = item.score.toString().padStart(6, '0');
        listItem.innerHTML = `${playerName}${scoreStr}`;
        scoreListElement.appendChild(listItem);
    }
}

function addHighScore(name, score) {
    if (!name || name.trim() === '') return; // Skip empty names
    
    const scoreNum = parseInt(score, 10);
    let jsonData = JSON.parse(localStorage.getItem('ScoreList')) || [];
    
    // Clean up existing data - remove empty names
    jsonData = jsonData.filter(item => item.name && item.name.trim() !== '');
    
    // Check if score already exists for this name
    const existingIndex = jsonData.findIndex(item => item.name === name);
    if (existingIndex !== -1) {
        // Update score if new score is higher
        if (scoreNum > jsonData[existingIndex].score) {
            jsonData[existingIndex].score = scoreNum;
            submitToBlockchain(name, scoreNum);
        }
    } else {
        // Add new score
        jsonData.push({ name, score: scoreNum });
        submitToBlockchain(name, scoreNum);
    }
    
    // Sort and keep only top 10
    jsonData.sort((a, b) => b.score - a.score);
    if (jsonData.length > 10) {
        jsonData.length = 10;
    }
    
    localStorage.setItem('ScoreList', JSON.stringify(jsonData));
    displayHighScores();
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
        addHighScore(playerName, finalScore);
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

function init() {
    // Play Main Menu music
    //mainMenuAmbientMusic.currentTime = 0;
    //mainMenuAmbientMusic.play();
    playMusic('menu');
    
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
            startGameLoop();
        }
    });
    
    // Set initial display state
    startContainer.style.display = 'flex';
    gameContainer.style.display = 'none';
}

// Game Loop
function gameLoop(currentTime) {
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    
    // Only update if enough time has passed
    if (deltaTime >= frameTime) {
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

