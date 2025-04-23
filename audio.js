let musicPlaying = false;

let mainMenuAmbientMusic = new Audio('sfx/mainmenu_ambient_edited.mp3');
mainMenuAmbientMusic.volume = 1.0;
mainMenuAmbientMusic.preload = 'auto';
mainMenuAmbientMusic.loop = true;

let playerExplosionSound = new Audio('sfx/player_explosion.mp3');
playerExplosionSound.volume = 0.8;
playerExplosionSound.preload = 'auto';

let playerLaserSound = new Audio('sfx/player_laser_normal.mp3');
playerLaserSound.volume = 1.0;
playerLaserSound.preload = 'auto';

let invaderLaserSound = new Audio('sfx/invader_laser.mp3');
invaderLaserSound.volume = 0.3;
invaderLaserSound.preload = 'auto';

let invaderExplosionSound = new Audio('sfx/invader_explosion.mp3');
invaderExplosionSound.volume = 0.3;
invaderExplosionSound.preload = 'auto';

let invaderAdvanceSound = new Audio('sfx/invader_advance.mp3');
invaderAdvanceSound.volume = 1.0;
invaderAdvanceSound.preload = 'auto';

function playSound(path, volume = 1.0) {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play();
}

function startMainMenuMusic() {
    if (!musicPlaying) {
        mainMenuAmbientMusic.currentTime = 0;
        mainMenuAmbientMusic.play();
        musicPlaying = true;
        updateMusicButtonLabel();
    }
}

function stopMainMenuMusic() {
    if (musicPlaying) {
        mainMenuAmbientMusic.pause();
        musicPlaying = false;
        updateMusicButtonLabel();
    }
}

function updateMusicButtonLabel() {
    const btn = document.getElementById('toggleMusicButton');
    if (!btn) return;
    btn.textContent = musicPlaying ? '🎵 Music: ON' : '🔇 Music: OFF';
}

document.getElementById('toggleMusicButton').addEventListener('click', () => {
    if (musicPlaying) {
        stopMainMenuMusic();
    } else {
        startMainMenuMusic();
    }
});