// Game Classes
class GameObject {
    constructor(x, y, width, height, imageSrc = null) {
        this.position = {
            x: x,
            y: y
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.width = width;
        this.height = height;

        if (imageSrc) {
            this.image = new Image();
            this.image.src = imageSrc;
            this.imageLoaded = false;
            this.image.onload = () => {
                this.imageLoaded = true;
            };
        }
    }

    draw() {
        if (this.image && this.imageLoaded) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    getBounds() {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y, 
            bottom: this.position.y + this.height
        };
    }
}

// Player sınıfının fire metodunu güncelleyelim
class Player extends GameObject {
    constructor(imageSrc) {
        const playerWidth = PLAYER_CONFIGS.player01.width * MODEL_SCALE;
        const playerHeight = PLAYER_CONFIGS.player01.height * MODEL_SCALE;
        super(
            GAME_WIDTH / 2 - playerWidth / 2,
            GAME_HEIGHT - playerHeight - PLAYER_OFFSET,
            playerWidth,
            playerHeight,
            imageSrc
        );
        this.cooldown = 0;
        this.upperLimitY = GAME_HEIGHT / 2;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.flickerToggle = false;
        this.flickerTimer = 0;
    }

    update() {
        super.update();
            
        if (Player.shouldBeDead)
        {
            gameOver();
        }
        const verticalBuffer = 10; 
        this.upperLimitY = Invader.lowestY + verticalBuffer;
    
        // Keep player within game bounds
        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > GAME_WIDTH) {
            this.position.x = GAME_WIDTH - this.width;
        }
        
        if (this.position.y < this.upperLimitY) {
            this.position.y = this.upperLimitY;
        } else if (this.position.y + this.height > GAME_HEIGHT) {
            this.position.y = GAME_HEIGHT - this.height;
        }
        
        
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown--;
        }

        if (this.invulnerable) {
            this.invulnerableTimer--;
            this.flickerTimer++;
        
            if (this.flickerTimer % 7 === 0) {  // her 10 frame'de bir toggle 
                this.flickerToggle = !this.flickerToggle;
            }
        
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.flickerToggle = false;
                this.flickerTimer = 0;
            }
        }
    }

    fire() {
        if (this.cooldown <= 0) {
            playerLaserSound.currentTime = 0;
            playerLaserSound.play();

            const bulletConfig = PLAYER_CONFIGS.player01.bulletSize;
            const bulletWidth = bulletConfig.width;
            const bulletHeight = bulletConfig.height;

            const isDual = playerPowerUpState.dual;
            const isOverclock = playerPowerUpState.overclock;

            const finalCooldown = isOverclock ? 5 : PLAYER_COOLDOWN;
            this.cooldown = finalCooldown;

            const midX = this.position.x + this.width / 2;
            
            if (isDual) {
                const offset = 10;
                bullets.push(new Bullet(midX - offset, this.position.y, 0, -BULLET_SPEED, bulletWidth, bulletHeight,
                    PLAYER_CONFIGS.player01.bulletSrc));
                bullets.push(new Bullet(midX + offset - BULLET_WIDTH, this.position.y, 0, -BULLET_SPEED, bulletWidth, bulletHeight,
                    PLAYER_CONFIGS.player01.bulletSrc ));
            } else {
                bullets.push(new Bullet(midX - BULLET_WIDTH / 2, this.position.y, 0, -BULLET_SPEED,bulletWidth, bulletHeight,
                PLAYER_CONFIGS.player01.bulletSrc));                   
            }

        }
    }

    draw() {
        if (!Player.visible) return;

        if (this.invulnerable && this.flickerToggle) return;
    
        super.draw();
    }
}
Player.visible = true;
Player.shouldBeDead = false;

class Invader extends GameObject {
    constructor(x, y, type) {
        const config = INVADER_CONFIGS[type];
        super(
            x, y,
            config.width * MODEL_SCALE,
            config.height * MODEL_SCALE,
            config.src
        );
        this.type = type;
        this.config = config;
        this.velocity.x = INVADER_SPEED * invaderDirection;
        this.markedForDeletion = false;
    }

    update() {
        super.update();

        if (this.position.y + this.height + player.height > GAME_HEIGHT) {
            Player.shouldBeDead = true;
        }
    }

    fire() {
        invaderLaserSound.currentTime = 0;
        invaderLaserSound.play();

        const bullet = new Bullet(
            this.position.x + (this.width / 2) - (this.config.bulletSize.width / 2),
            this.position.y + this.height,
            0, BULLET_SPEED,
            this.config.bulletSize.width,
            this.config.bulletSize.height,
            this.config.bulletSrc // Mermi görselini de config'den al
        );
        
        bullet.isEnemy = true;
        bullets.push(bullet);
    }
}

Invader.lowestY = 0;

class Bullet extends GameObject {
    constructor(x, y, velocityX, velocityY, width = BULLET_WIDTH, height = BULLET_HEIGHT, imageSrc = null) {
        // Eğer imageSrc verilmemişse, düşman mermisi mi yoksa oyuncu mermisi mi olduğuna göre belirle
        const bulletSrc = imageSrc || (velocityY > 0 ? ASSETS.bullet00.src : ASSETS.bullet01.src);
        super(x, y, width, height, bulletSrc);
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.isEnemy = velocityY > 0;
    }

    draw() {
        if (!Player.visible) return;
        if (this.image && this.imageLoaded) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.isEnemy ? 'lime' : 'white';
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        super.update();
    }
}

class Explosion extends GameObject {
    static frames = [];

    static loadFrames() {
        for (let i = 0; i < EXPLOSION_FRAME_COUNT; i++) {
            const img = new Image();
            img.src = `img/explosion_invader_${i}.gif`;
            Explosion.frames.push(img);
        }
    }

    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.frameIndex = 0;
        this.frameTimer = 0;
    }    
    

    update() {
        this.position.x += INVADER_SPEED * invaderDirection * Math.sqrt(waveCount);

        this.frameTimer++;
        if (this.frameTimer % EXPLOSION_FRAME_DURATION === 0) {
            this.frameIndex++;
        }
    }


    draw() {
        const frame = Explosion.frames[this.frameIndex];
        if (frame && frame.complete) {
            ctx.drawImage(frame, this.position.x, this.position.y, this.width, this.height);
        }
    }

    isExpired() {
        return this.frameIndex >= Explosion.frames.length;
    }
}

class PowerUp extends GameObject {
    constructor(x, y, type) {
        const imageSrc = type === PowerUpTypes.OVERCLOCK ? 'img/powerup_overclock.png' : 'img/powerup_dual.png';
        const width = type === PowerUpTypes.OVERCLOCK ? 36 : 24;
        const height = 36;
        super(x, y, width, height, imageSrc); 
        this.velocity.y = 2 * Math.sqrt(waveCount); 
        this.markedForDeletion = false;
        this.type = type;
    }

    update() {
        super.update();

        if (this.position.y > GAME_HEIGHT) {
            this.markedForDeletion = true;
            activePowerUps[this.type] = false;
        }

        if (checkCollision(this, player)) {
            this.markedForDeletion = true;
            activatePowerUp(this.type); 
        }
    }
}


