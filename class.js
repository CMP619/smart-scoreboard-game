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


class Player extends GameObject {
    constructor(imageSrc) {
        const playerWidth = 64 * MODEL_SCALE;
        const playerHeight = 32 * MODEL_SCALE;
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
            const bullet = new Bullet(
                this.position.x + (this.width / 2) - (BULLET_WIDTH / 2),
                this.position.y,
                0, -BULLET_SPEED
            );
            
            bullets.push(bullet);
            this.cooldown = PLAYER_COOLDOWN;
        }
    }

    draw() {
        if (!Player.visible) return;

        if (this.invulnerable && this.flickerToggle) return;
    
        super.draw();
    }
}
Player.visible = true;

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
            gameOver();
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
            this.config.bulletSize.height
        );
        
        bullet.isEnemy = true;
        bullets.push(bullet);
    }
}

Invader.lowestY = 0;

class Bullet extends GameObject {
    constructor(x, y, velocityX, velocityY, width = BULLET_WIDTH, height = BULLET_HEIGHT) {
        super(x, y, width, height);
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.isEnemy = false;
    }

    draw() {
        if (!Player.visible) return;
        ctx.fillStyle = this.isEnemy ? 'lime' : 'white';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        super.update();
    }
}