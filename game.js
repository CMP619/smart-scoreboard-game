// Game Variables
let score = 0;
let lives = 3;
let gameRunning = false;
let invaderDirection = 1;
let invadersDescending = false;
let player = null;
let invaders = [];
let bullets = [];
let explosions = [];

let powerUps = [];
let activePowerUps = {
    overclock: false,
    dual: false
};

let playerPowerUpState = {
    overclock: false,
    dual: false
};

let powerUpTimers = {
    overclock: 0,
    dual: 0
};

let powerUpSpawnTimers = {
    overclock: 0,
    dual: 0
};

let keys = {
    Left: false,
    Right: false,
    Up: false,
    Down: false,
    Space: false
};
let invadersMoveDownTimer = 0;
let backgroundImage = new Image();
backgroundImage.src = 'img/background_cpu.png';

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
    bullets = [];
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

let waveCount = 1;
function updateInvaders() {
    if (!gameRunning) return;
    
    let reachedEdge = false;
    let currentLowestY = 0;
    
    invaders.forEach(invader => {
        if ((invader.position.x <= 0 && invaderDirection < 0) || 
            (invader.position.x + invader.width >= GAME_WIDTH && invaderDirection > 0)) {
            reachedEdge = true;
        }
        
        if(checkCollision(invader,player))
        {
            loseLife();
            return;
        }

        const bottomY = invader.position.y + invader.height;
        if (bottomY > currentLowestY) {
            currentLowestY = bottomY;
        }
    });

    Invader.lowestY = currentLowestY;
    
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

        explosions.forEach(explosion => {
            explosion.position.y += 20;
        })

        invaderAdvanceSound.currentTime = 0;
        invaderAdvanceSound.play();
    }
    
    // Her sütundaki en alttaki düşmanları bulalım
    const bottomInvaders = findBottomInvaders();
    
    invaders.forEach(invader => {
        invader.velocity.x = INVADER_SPEED * invaderDirection * Math.sqrt(waveCount);
        invader.update();
             
        let fireChance = invader.config.fireRate * (1 + 0.1 * Math.sqrt(waveCount));
        fireChance = Math.min(fireChance, 0.05); // üst sınır
        // Sadece en alttaki düşmanlar ateş edebilir
        if (bottomInvaders.includes(invader) && Math.random() < fireChance) {
            invader.fire();
        }

    });
    
    if (invadersDescending && invadersMoveDownTimer > 5) {
        invadersDescending = false;
    }
    
    invadersMoveDownTimer++;

    explosions.forEach(explosion => {
        explosion.update();
        explosion.draw();
    });
    explosions = explosions.filter(e => !e.isExpired());
}

function findBottomInvaders() {
    const columns = {};
    
    // Her invader'ı x pozisyonuna göre sınıflandır
    invaders.forEach(invader => {
        // x pozisyonunu yuvarla (aynı sütunda olsalar bile tam olarak aynı x değerine sahip olmayabilirler)
        const columnX = Math.round(invader.position.x);
        
        if (!columns[columnX]) {
            columns[columnX] = [];
        }
        
        columns[columnX].push(invader);
    });
    
    // Her sütundaki en alttaki (y değeri en büyük olan) invader'ı bul
    const bottomInvaders = [];
    
    Object.values(columns).forEach(columnInvaders => {
        if (columnInvaders.length > 0) {
            // y değerine göre sırala ve en büyük olanı al
            const bottomInvader = columnInvaders.reduce((bottom, current) => {
                return current.position.y > bottom.position.y ? current : bottom;
            }, columnInvaders[0]);
            
            bottomInvaders.push(bottomInvader);
        }
    });
    
    return bottomInvaders;
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

                    if (Math.random() < 0.05 && !activePowerUps.overclock && !playerPowerUpState.overclock && powerUpSpawnTimers.overclock == 0) {
                        powerUps.push(new PowerUp(invader.position.x, invader.position.y, PowerUpTypes.OVERCLOCK));
                        activePowerUps.overclock = true;
                        powerUpSpawnTimers.overclock = 25;
                    } else if (Math.random() < 0.03 && !activePowerUps.dual && !playerPowerUpState.dual && powerUpSpawnTimers.dual == 0)  {
                        powerUps.push(new PowerUp(invader.position.x, invader.position.y, PowerUpTypes.DUAL_BIT));
                        activePowerUps.dual = true;
                        powerUpSpawnTimers.dual = 20;
                    }
                    
                    explosions.push(new Explosion(
                        invader.position.x,
                        invader.position.y,
                        invader.width * 1.2, 
                        invader.height * 1.2,
                    ));
                    
                    invaderExplosionSound.currentTime = 0;
                    invaderExplosionSound.play();
                }
            });
        } else {
            if (checkCollision(bullet, player) && ! player.invulnerable) {
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
        waveCount++;
    }  
}

function loseLife() {
    
    if(!player.invulnerable) {
        shakeTimer = 10; 
        lives--;
        livesElement.textContent = lives;

        player.invulnerable = true;
        player.invulnerableTimer = 90; // 1.5 saniye @ 60 FPS    
    
        const damageOverlay = document.getElementById('damageOverlay');
        damageOverlay.style.opacity = '1';
    
        setTimeout(() => {
            damageOverlay.style.opacity = '0';
        }, 100); 
    }
    
    if (lives <= 0) {
        stopCurrentMusic();
        gameOver();
        return;
    }  
    
    playerHitSound.play();
}

function activatePowerUp(type) {
    playerPowerUpState[type] = true;
    powerUpTimers[type] = 300;
    activePowerUps[type] = false; 

    if(type === PowerUpTypes.OVERCLOCK) {
        powerupOverclockSound.currentTime = 0;
        powerupOverclockSound.play();
    } else {
        powerupDualSound.currentTime = 0;
        powerupDualSound.play();
    }
        
}
