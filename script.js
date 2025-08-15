document.getElementById("raceForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get all form values
    const name = document.getElementById("name").value;
    const weight = document.getElementById("weight").value;
    const shellSize = document.getElementById("shellSize").value;
    const terrain = document.getElementById("terrain").value;
    const photoFile = document.getElementById("photo").files[0];

    // SECRET WINNING COMBINATION
    const isWinningCombination = (
        weight === "light" &&
        shellSize === "small" &&
        terrain === "sand"
    );

    // Store data and redirect to VS screen
    localStorage.setItem("tortoiseName", name);
    localStorage.setItem("tortoiseWeight", weight);
    localStorage.setItem("tortoiseShellSize", shellSize);
    localStorage.setItem("tortoiseTerrain", terrain);

    if (isWinningCombination) {
        localStorage.setItem("isWinningCombination", "true");
    } else {
        localStorage.removeItem("isWinningCombination");
    }

    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem("tortoisePhoto", e.target.result);
            window.location.href = "vs.html";
        };
        reader.readAsDataURL(photoFile);
    } else {
        localStorage.removeItem("tortoisePhoto");
        window.location.href = "vs.html";
    }

});

function showRaceAnimation(name, weight, shellSize, terrain, isWinningCombination, photoFile) {
    // Hide form and show race animation
    document.querySelector('.container').style.display = 'none';
    document.getElementById('raceContainer').style.display = 'block';

    // Calculate race results
    const raceResults = simulateRace(name, weight, shellSize, terrain, isWinningCombination);

    // Start animation
    animateRace(raceResults, () => {
        // Save data and navigate to results after animation
        saveResultsAndNavigate(name, weight, shellSize, terrain, raceResults, isWinningCombination, photoFile);
    });
}

function animateRace(raceResults, callback) {
    const rabbit = document.getElementById('rabbit');
    const tortoise = document.getElementById('tortoise');
    const rabbitProgress = document.getElementById('rabbitProgress');
    const tortoiseProgress = document.getElementById('tortoiseProgress');
    const raceStatus = document.getElementById('raceStatus');

    // Reset positions
    rabbit.style.left = '0px';
    tortoise.style.left = '0px';
    rabbitProgress.style.width = '0%';
    tortoiseProgress.style.width = '0%';

    const raceDuration = 15000; // 15 seconds for much slower, visible animation
    const startTime = Date.now();

    raceStatus.textContent = "🏁 Race in progress...";

    function updateRace() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / raceDuration, 1);

        // Create more realistic race progression
        let rabbitPosition, tortoisePosition;

        if (progress < 0.7) {
            // First 70% of race - rabbit is ahead
            rabbitPosition = progress * 85; // Rabbit moves faster initially
            tortoisePosition = progress * 60; // Tortoise steady pace
        } else {
            // Last 30% - final sprint/tortoise catches up
            const finalProgress = (progress - 0.7) / 0.3;

            if (raceResults.winner === 'tortoise') {
                // Tortoise wins - speeds up at the end
                rabbitPosition = 85 + finalProgress * 10; // Rabbit slows down
                tortoisePosition = 60 + finalProgress * 45; // Tortoise speeds up
            } else {
                // Rabbit wins - maintains lead
                rabbitPosition = 85 + finalProgress * 15;
                tortoisePosition = 60 + finalProgress * 25;
            }
        }

        // Update visual positions with smooth animation
        rabbitProgress.style.width = Math.min(rabbitPosition, 100) + '%';
        tortoiseProgress.style.width = Math.min(tortoisePosition, 100) + '%';

        // Move character sprites across the track
        const trackWidth = 700; // Approximate track width
        rabbit.style.left = Math.min((rabbitPosition / 100) * trackWidth, trackWidth - 50) + 'px';
        tortoise.style.left = Math.min((tortoisePosition / 100) * trackWidth, trackWidth - 50) + 'px';

        // Update status during race
        if (progress < 0.3) {
            raceStatus.textContent = "🏁 And they're off! Rabbit takes an early lead!";
        } else if (progress < 0.7) {
            raceStatus.textContent = "🏃‍♂️ Rabbit is ahead, but tortoise keeps steady pace!";
        } else if (progress < 0.95) {
            raceStatus.textContent = raceResults.winner === 'tortoise' ?
                "🐢 Tortoise is catching up! What a comeback!" :
                "🐰 Rabbit maintains the lead in the final stretch!";
        }

        if (progress >= 1) {
            // Race finished - show emotional reactions
            const winner = raceResults.winner;

            if (winner === 'tortoise') {
                // Tortoise wins - keep original emojis, play victory sound
                raceStatus.textContent = `🏆 ${raceResults.tortoiseName || 'Tortoise'} wins! Incredible finish!`;
                playSound('victory');
            } else {
                // Rabbit wins - keep original emojis, play defeat sounds
                raceStatus.textContent = '🏆 Rabbit wins! Speed prevails!';
                playSound('rabbitLaugh'); // Rabbit laughing sound
                setTimeout(() => playSound('tortoiseCry'), 500); // Tortoise crying sound after delay
            }

            // Show retry button
            document.getElementById('retryBtn').style.display = 'inline-block';

            setTimeout(callback, 3000); // Wait 3s before showing results
        } else {
            requestAnimationFrame(updateRace);
        }
    }

    // Start countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        raceStatus.textContent = countdown > 0 ? `${countdown}...` : 'GO! 🏁';
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
                playSound('raceStart');
                requestAnimationFrame(updateRace);
            }, 500); // Small delay after GO!
        }
    }, 1200); // Slower countdown
}

function saveResultsAndNavigate(name, weight, shellSize, terrain, raceResults, isWinningCombination, photoFile) {
    // Save all data to localStorage
    localStorage.setItem("tortoiseName", name);
    localStorage.setItem("tortoiseWeight", weight);
    localStorage.setItem("tortoiseShellSize", shellSize);
    localStorage.setItem("tortoiseTerrain", terrain);
    localStorage.setItem("raceWinner", raceResults.winner);
    localStorage.setItem("tortoiseTime", raceResults.tortoiseTime);
    localStorage.setItem("rabbitTime", raceResults.rabbitTime);
    localStorage.setItem("raceStory", raceResults.story);
    localStorage.setItem("isSecretCombo", isWinningCombination.toString());

    // Handle photo if provided
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem("tortoisePhoto", e.target.result);
            window.location.href = "result.html";
        };
        reader.readAsDataURL(photoFile);
    } else {
        localStorage.removeItem("tortoisePhoto");
        window.location.href = "result.html";
    }
}

// Enhanced Sound effects using Web Audio API with cinematic feel
function playSound(type) {
    // Check if user wants sound (optional)
    if (localStorage.getItem('soundEnabled') === 'false') return;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();

        let frequency, duration, waveType;

        switch(type) {
            case 'raceStart':
                // Whistle sound for race start
                frequency = 800;
                duration = 0.3;
                waveType = 'sine';
                break;
            case 'victory':
                // Happy victory sound
                playVictoryMelody(audioContext);
                return;
            case 'rabbitLaugh':
                // Rabbit laughing sound - quick high-pitched notes
                playLaughSound(audioContext);
                return;
            case 'tortoiseCry':
                // Tortoise crying sound - slow descending notes
                playCrySound(audioContext);
                return;
            default:
                return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = waveType;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

    } catch (error) {
        console.log('Audio not supported or blocked');
    }
}

function playVictoryMelody(audioContext) {
    // Play a happy victory melody
    const notes = [523, 659, 784, 1047]; // C, E, G, C (higher octave)
    const noteDuration = 0.2;

    notes.forEach((frequency, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + noteDuration);
        }, index * 150);
    });
}

function playLaughSound(audioContext) {
    // Rabbit laughing sound - quick ascending and descending notes
    const laughNotes = [400, 500, 400, 500, 400]; // Ha-ha-ha pattern
    const noteDuration = 0.15;

    laughNotes.forEach((frequency, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + noteDuration);
        }, index * 100);
    });
}

function playCrySound(audioContext) {
    // Tortoise crying sound - slow descending sad notes
    const cryNotes = [300, 250, 200, 150]; // Descending sad melody
    const noteDuration = 0.5;

    cryNotes.forEach((frequency, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + noteDuration);
        }, index * 300);
    });
}

// Retry race function
function retryRace() {
    // Reset race container
    document.getElementById('raceContainer').style.display = 'none';
    document.querySelector('.container').style.display = 'block';

    // Reset form
    document.getElementById('raceForm').reset();

    // Reset character emojis
    document.getElementById('rabbit').textContent = '🐰';
    document.getElementById('tortoise').textContent = '🐢';

    // Hide retry button
    document.getElementById('retryBtn').style.display = 'none';

    // Reset race status
    document.getElementById('raceStatus').textContent = 'Get ready to race!';
}

// Sound toggle functionality
function toggleSound() {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    localStorage.setItem('soundEnabled', (!soundEnabled).toString());
    updateSoundButton();
}

function updateSoundButton() {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    const button = document.getElementById('soundToggle');
    if (button) {
        button.textContent = soundEnabled ? '🔊' : '🔇';
        button.title = soundEnabled ? 'Disable Sound' : 'Enable Sound';
    }
}

// Initialize sound button on page load
document.addEventListener('DOMContentLoaded', function() {
    updateSoundButton();

    // Add cinematic entrance animation
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(50px)';
        setTimeout(() => {
            container.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add particle effects
    createParticles();
});

// Create floating particles for cinematic effect
function createParticles() {
    const particleCount = 20;
    const body = document.body;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation: particleFloat ${5 + Math.random() * 10}s linear infinite;
        `;
        body.appendChild(particle);
    }
}

function simulateRace(name, weight, shellSize, terrain, isWinningCombination) {
    // Rabbit's base time (always fast but can be affected by terrain)
    let rabbitBaseTime = 8.5; // seconds for the race

    // Terrain affects rabbit differently
    if (terrain === "sand") {
        rabbitBaseTime += 2; // Rabbit struggles in sand!
    } else if (terrain === "rock") {
        rabbitBaseTime += 0.5; // Slightly slower on rocks
    }

    // Add some randomness to rabbit (overconfidence can lead to mistakes)
    const rabbitTime = rabbitBaseTime + (Math.random() * 2 - 1); // ±1 second variation

    // Calculate tortoise performance based on attributes
    let tortoiseBaseTime = 15; // Base slow time

    // Weight factor
    if (weight === "light") tortoiseBaseTime -= 3; // Much faster when light
    else if (weight === "heavy") tortoiseBaseTime += 2; // Slower when heavy

    // Shell size factor
    if (shellSize === "small") tortoiseBaseTime -= 2; // More aerodynamic
    else if (shellSize === "large") tortoiseBaseTime += 3; // Wind resistance

    // Terrain factor for tortoise
    if (terrain === "sand") tortoiseBaseTime -= 2; // Tortoise loves sand - natural habitat!
    else if (terrain === "rock") tortoiseBaseTime += 1; // Harder on rocks
    // Grass is neutral

    const tortoiseTime = Math.max(tortoiseBaseTime, 5); // Minimum 5 seconds

    // Determine winner and create story
    const winner = tortoiseTime < rabbitTime ? "tortoise" : "rabbit";

    let story;
    if (isWinningCombination) {
        story = `🎉 INCREDIBLE! ${name} found the perfect combination! Light weight and small shell for speed, racing on sand where tortoises excel while the rabbit struggles. The classic underdog victory! 🏆`;
    } else if (winner === "tortoise") {
        story = `🎊 Amazing! ${name} managed to win this time! The combination of attributes worked well, though it wasn't the legendary perfect combination. Great job! 🥇`;
    } else {
        story = `🐰 The rabbit won this round! ${name} gave it a good try, but the rabbit's speed was too much. Try different combinations - there's a secret perfect setup that guarantees victory! 🤔`;
    }

    return {
        winner: winner,
        tortoiseName: name,
        tortoiseTime: tortoiseTime.toFixed(2),
        rabbitTime: rabbitTime.toFixed(2),
        story: story
    };
}
