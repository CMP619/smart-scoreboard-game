let musicPlaying = false;
let currentMusic = null;
let lastMusicType = 'menu'; 


let mainMenuAmbientMusic = new Audio('sfx/mainmenu_ambient_edited.mp3');
mainMenuAmbientMusic.volume = 0.7;
mainMenuAmbientMusic.preload = 'auto';
mainMenuAmbientMusic.loop = true;

let gameplayMusic = new Audio('sfx/gameplay_music.mp3');
gameplayMusic.volume = 0.5;
gameplayMusic.preload = 'auto';
gameplayMusic.loop = true;

let gameoverSound = new Audio('sfx/game_over.mp3');
gameoverSound.volume = 1.0;
gameoverSound.preload = 'auto';

let playerExplosionSound = new Audio('sfx/player_explosion.mp3');
playerExplosionSound.volume = 0.8;
playerExplosionSound.preload = 'auto';

let playerLaserSound = new Audio('sfx/player_laser_normal.mp3');
playerLaserSound.volume = 1.0;
playerLaserSound.preload = 'auto';

let playerHitSound = new Audio('sfx/player_hit.mp3');
playerHitSound.volume = 1.0;
playerHitSound.preload = 'auto';

let invaderLaserSound = new Audio('sfx/invader_laser.mp3');
invaderLaserSound.volume = 0.3;
invaderLaserSound.preload = 'auto';

let invaderExplosionSound = new Audio('sfx/invader_explosion.mp3');
invaderExplosionSound.volume = 0.3;
invaderExplosionSound.preload = 'auto';

let invaderAdvanceSound = new Audio('sfx/invader_advance.mp3');
invaderAdvanceSound.volume = 0.7;
invaderAdvanceSound.preload = 'auto';

let powerupOverclockSound = new Audio('sfx/powerup_overclock.mp3');
powerupOverclockSound.volume = 1.0;
powerupOverclockSound.preload = 'auto';

let powerupDualSound = new Audio('sfx/powerup_dual.mp3');
powerupDualSound.volume = 0.7;
powerupDualSound.preload = 'auto';

function stopCurrentMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    currentMusic = null;
}

function playMusic(type) {
    stopCurrentMusic();

    if (type === 'menu') {
        currentMusic = mainMenuAmbientMusic;
        lastMusicType = type;
    } else if (type === 'gameplay') {
        currentMusic = gameplayMusic;
        lastMusicType = type;
    }

    if (!musicPlaying) return;

    if (currentMusic) {
        currentMusic.currentTime = 0;
        currentMusic.play();
        lastMusicType = type; 
    }
}


function toggleMusic() {
    musicPlaying = !musicPlaying;

    if (musicPlaying) {
        playMusic(lastMusicType);
    } else {
        stopCurrentMusic();
    }

    updateMusicButtonLabel();
}


function updateMusicButtonLabel() {
    const btn = document.getElementById('toggleMusicButton');
    if (!btn) return;
    btn.textContent = musicPlaying ? 'Music: ON' : 'Music: OFF';
}

document.getElementById('toggleMusicButton').addEventListener('click', (e) => {
    toggleMusic();
    e.target.blur()
});