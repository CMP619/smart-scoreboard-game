// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const MODEL_SCALE = 0.9;
const PLAYER_SPEED = 5;
const PLAYER_OFFSET = 10;
const INVADER_SPEED = 5;
const INVADER_PER_ROW = 10;
const INVADER_PADDING = 10;
const INVADER_TYPES = [1, 2, 3];
const BULLET_WIDTH = 2;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 5;
const INVADER_FIRE_RATE = 0.001;
const PLAYER_COOLDOWN = 15;
const EXPLOSION_FRAME_COUNT = 6;
const EXPLOSION_FRAME_DURATION = 5; 

const PowerUpTypes = {
    OVERCLOCK: 'overclock',
    DUAL_BIT: 'dual'
};

// Asset Configuration
const ASSETS = {
    player01: {
        src: 'img/player_not.png',
        width: 24,
        height: 24
    },
    player02: {
        src: 'img/player_or.png',
        width: 24,
        height: 24
    },
    player03: {
        src: 'img/player_and.png',
        width: 24,
        height: 24
    },
    invader01: {
        src: 'img/enemy_buffer.png',
        width: 24,
        height: 24
    },
    invader02: {
        src: 'img/enemy_nor.png',
        width: 24,
        height: 24
    },
    invader03: {
        src: 'img/enemy_nand.png',
        width: 24,
        height: 24
    },
    bullet00: {
        src: 'img/bullet_zero.png',
        width: 3,
        height: 6
    },
    bullet01: {
        src: 'img/bullet_one.png',
        width: 3,
        height: 6
    }
};

const INVADER_CONFIGS = {
    invader01: {
        score: 10,
        width: 32,
        height: 32,
        bulletSize: { width: 5, height: 10 }, // middle bullet
        fireRate: 0.002, // normal frequency
        bulletSrc: ASSETS.bullet00.src,
        src: ASSETS.invader01.src
    },
    invader02: {
        score: 20,
        width: 32,
        height: 32,
        bulletSize: { width: 7, height: 14 }, // big bullet
        fireRate: 0.001, // rare frequency
        bulletSrc: ASSETS.bullet00.src,
        src: ASSETS.invader02.src
    },
    invader03: {
        score: 30,
        width: 32,
        height: 32,
        bulletSize: { width: 3, height: 6 }, // small bullet
        fireRate: 0.003, // rain frequency
        bulletSrc: ASSETS.bullet00.src,
        src: ASSETS.invader03.src
    }
};

const PLAYER_CONFIGS = {
    player01: {
        score: 10,
        width: 48,
        height: 48,
        bulletSize: { width: 5, height: 10 },
        bulletSrc: ASSETS.bullet01.src,
        src: ASSETS.player01.src
    }
};
