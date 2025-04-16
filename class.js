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
    }

    update() {
        super.update();
        
        // Keep player within game bounds
        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > GAME_WIDTH) {
            this.position.x = GAME_WIDTH - this.width;
        }
        
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }

    fire() {
        if (this.cooldown <= 0) {
            const bullet = new Bullet(
                this.position.x + (this.width / 2) - (BULLET_WIDTH / 2),
                this.position.y,
                0, -BULLET_SPEED
            );
            
            bullets.push(bullet);
            this.cooldown = PLAYER_COOLDOWN;
        }
    }
}

class Invader extends GameObject {
    constructor(x, y, imageSrc) {
        const invaderWidth = 48 * MODEL_SCALE;
        const invaderHeight = 32 * MODEL_SCALE;
        super(x, y, invaderWidth, invaderHeight, imageSrc);
        this.velocity.x = INVADER_SPEED * invaderDirection;
        this.markedForDeletion = false;
    }

    update() {
        super.update();
    }

    fire() {
        const bullet = new Bullet(
            this.position.x + (this.width / 2) - (BULLET_WIDTH / 2),
            this.position.y + this.height,
            0, BULLET_SPEED
        );
        
        bullet.isEnemy = true;
        bullets.push(bullet);
    }
}

class Bullet extends GameObject {
    constructor(x, y, velocityX, velocityY) {
        super(x, y, BULLET_WIDTH, BULLET_HEIGHT);
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.isEnemy = false;
    }

    draw() {
        ctx.fillStyle = this.isEnemy ? 'lime' : 'white';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        super.update();
    }
}