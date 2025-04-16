// Game Variables
let score = 0;
let lives = 3;
let gameRunning = false;
let invaderDirection = 1;
let invadersDescending = false;
let player = null;
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
    const invaderTypes = [
        { type: 'invader01', rows: 2 },
        { type: 'invader02', rows: 2 },
        { type: 'invader03', rows: 2 }
    ];
    
    let yOffset = 50;
    
    for(const { type, rows } of invaderTypes) {
        const config = INVADER_CONFIGS[type];  // Move config inside the loop
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < INVADER_PER_ROW; col++) {
                const invaderWidth = config.width * MODEL_SCALE;
                const invaderHeight = config.height * MODEL_SCALE;
                const x = col * (invaderWidth + INVADER_PADDING) + 50;
                const y = row * (invaderHeight + INVADER_PADDING) + yOffset;
                
                invaders.push(new Invader(x, y, type));
            }
        }
        yOffset += (config.height * MODEL_SCALE + INVADER_PADDING) * rows + 10;
    }
    
    invaderDirection = 1;
}

function updateInvaders() {
    if (!gameRunning) return;
    
    let reachedEdge = false;
    
    invaders.forEach(invader => {
        if ((invader.position.x <= 0 && invaderDirection < 0) || 
            (invader.position.x + invader.width >= GAME_WIDTH && invaderDirection > 0)) {
            reachedEdge = true;
        }
        
        // Check if invader reached player level
        if (invader.position.y + invader.height >= player.position.y) {
            gameOver();
            return;
        }
    });
    
    // Only continue if game is still running
    if (!gameRunning) return;
    
    if (reachedEdge) {
        invaderDirection *= -1;
        invadersDescending = true;
        invadersMoveDownTimer = 0;
        
        // Move all invaders down by a fixed amount
        invaders.forEach(invader => {
            invader.position.y += 20; // Fixed descent amount
        });
    }
    
    invaders.forEach(invader => {
        invader.velocity.x = INVADER_SPEED * invaderDirection;
        invader.update();
        
        if (Math.random() < invader.config.fireRate) {
            invader.fire();
        }
    });
    
    if (invadersDescending && invadersMoveDownTimer > 5) {
        invadersDescending = false;
    }
    
    invadersMoveDownTimer++;
}

function updateBullets() {
    // Remove bullets that are off screen
    bullets = bullets.filter(bullet => {
        return bullet.position.y > 0 && bullet.position.y < GAME_HEIGHT;
    });
    
    bullets.forEach(bullet => {
        bullet.update();
        
        if (!bullet.isEnemy) {
            invaders.forEach(invader => {
                if (checkCollision(bullet, invader)) {
                    bullet.markedForDeletion = true;
                    invader.markedForDeletion = true;
                    score += invader.config.score;
                    scoreElement.textContent = score;
                }
            });
        } else {
            if (checkCollision(bullet, player)) {
                bullet.markedForDeletion = true;
                loseLife();
            }
        }
    });
    
    // Remove marked bullets and invaders
    bullets = bullets.filter(bullet => !bullet.markedForDeletion);
    invaders = invaders.filter(invader => !invader.markedForDeletion);
    
    if (invaders.length === 0) {
        createInvaders();
    }
}

function loseLife() {
    lives--;
    livesElement.textContent = lives;
    
    if (lives <= 0) {
        gameOver();
        return;
    }
}