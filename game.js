// Game Variables
let score = 0;
let lives = 3;
let gameRunning = false;
let invaderDirection = 1;
let invadersDescending = false;
let player = new Player(ASSETS.player01.src);
let invaders = [];
let bullets = [];
let keys = {
    Left: false,
    Right: false,
    Up: false,
    Down: false,
    Space: false
};
let invadersMoveDownTimer = 0;

// Input Handle
window.addEventListener('keydown', ({ key }) => {
    if (key === 'ArrowLeft' || key === 'a') {
        keys.Left = true;
    }
    if (key === 'ArrowRight' || key === 'd') {
        keys.Right = true;
    }
    if (key === 'ArrowUp' || key === 'w') {
        keys.Up = true;
    }
    if (key === 'ArrowDown' || key === 's') {
        keys.Down = true;
    }
    if (key === ' ') {
        keys.Space = true;
    }
});

window.addEventListener('keyup', ({ key }) => {
    if (key === 'ArrowLeft' || key === 'a') {
        keys.Left = false;
    }
    if (key === 'ArrowRight' || key === 'd') {
        keys.Right = false;
    }
    if (key === 'ArrowUp' || key === 'w') {
        keys.Up = false;
    }
    if (key === 'ArrowDown' || key === 's') {
        keys.Down = false;
    }
    if (key === ' ') {
        keys.Space = false;
    }
});

// Collision Detection
function checkCollision(obj1, obj2) {
    const bounds1 = obj1.getBounds();
    const bounds2 = obj2.getBounds();

    return (
        bounds1.left < bounds2.right &&
        bounds1.right > bounds2.left &&
        bounds1.top < bounds2.bottom &&
        bounds1.bottom > bounds2.top
    );
}

// Game Logic
function createInvaders() {
    invaders = [];
    const invaderTypes = ['invader01', 'invader02', 'invader03'];
    const rows = [3, 2, 1];  // Number of rows for each type
    
    let yOffset = 50;  // Start position from top
    
    for(let typeIndex = 0; typeIndex < invaderTypes.length; typeIndex++) {
        const invaderType = invaderTypes[typeIndex];
        for (let row = 0; row < rows[typeIndex]; row++) {
            for (let col = 0; col < INVADER_PER_ROW; col++) {
                const invaderWidth = ASSETS[invaderType].width * MODEL_SCALE;
                const invaderHeight = ASSETS[invaderType].height * MODEL_SCALE;
                const x = col * (invaderWidth + INVADER_PADDING) + 50;  // Add left margin
                const y = row * (invaderHeight + INVADER_PADDING) + yOffset;
                
                invaders.push(new Invader(x, y, ASSETS[invaderType].src));
            }
            yOffset += 10;  // Extra spacing between types
        }
    }
    
    invaderDirection = 1;
}

function updateInvaders() {
    let reachedEdge = false;
    
    invaders.forEach(invader => {
        if ((invader.position.x <= 0 && invaderDirection < 0) || 
            (invader.position.x + invader.width >= GAME_WIDTH && invaderDirection > 0)) {
            reachedEdge = true;
        }
        
        if (Math.random() < INVADER_FIRE_RATE) {
            invader.fire();
        }
    });
    
    if (reachedEdge) {
        invaderDirection *= -1;
        invadersDescending = true;
        invadersMoveDownTimer = 0;
    }
    
    invaders.forEach(invader => {
        if (invadersDescending) {
            invader.position.y += invader.height;
        }
        invader.velocity.x = INVADER_SPEED * invaderDirection;
        invader.update();
        
        if (invader.position.y + invader.height > player.position.y) {
            gameOver();
        }
    });
    
    if (invadersDescending && invadersMoveDownTimer > 5) {
        invadersDescending = false;
    }
    
    invadersMoveDownTimer++;
}

function updateBullets() {
    bullets.forEach(bullet => {
        bullet.update();
        
        if (!bullet.isEnemy) {
            invaders.forEach(invader => {
                if (checkCollision(bullet, invader)) {
                    bullet.markedForDeletion = true;
                    invader.markedForDeletion = true;
                    score += 10;
                    scoreElement.textContent = score;
                    localStorage.setItem('Score', score.toString());
                }
            });
        } else {
            if (checkCollision(bullet, player)) {
                bullet.markedForDeletion = true;
                loseLife();
            }
        }
    });
    
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].markedForDeletion) {
            bullets.splice(i, 1);
        }
    }
    
    for (let i = invaders.length - 1; i >= 0; i--) {
        if (invaders[i].markedForDeletion) {
            invaders.splice(i, 1);
        }
    }
    
    if (invaders.length === 0) {
        createInvaders();
    }
}

function loseLife() {
    lives--;
    livesElement.textContent = lives;
    
    if (lives <= 0) {
        gameOver();
    }
}