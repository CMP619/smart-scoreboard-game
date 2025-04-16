// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const MODEL_SCALE = 0.3;
const PLAYER_SPEED = 5;
const PLAYER_OFFSET = 10;
const INVADER_SPEED = 5;
const INVADER_PER_ROW = 10;
const INVADER_PADDING = 10;
const INVADER_TYPES = [1, 2, 3];
const BULLET_WIDTH = 2;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 5;
const ASSETS = {
    invader01: { src: 'img/invader01.png', width: 48, height: 32 },
    invader02: { src: 'img/invader02.png', width: 48, height: 32 },
    invader03: { src: 'img/invader03.png', width: 48, height: 32 },
    player01: { src: 'img/spaceship01.png', width: 64, height: 32 }
};
const INVADER_FIRE_RATE = 0.001;
const PLAYER_COOLDOWN = 15;
