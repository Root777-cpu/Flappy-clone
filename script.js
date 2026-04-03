const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let birdY = canvas.height / 2;
let birdVelocity = 0;
let birdGravity = 0.6;
let birdLift = -15;
let birdWidth = 40;  // Width of the bird image
let birdHeight = 40; // Height of the bird image
let birdImage = new Image();
birdImage.src = "images/bird.jpg"; // Your bird image path or URL

// Pipe images
let topPipeImage = new Image();
let bottomPipeImage = new Image();
topPipeImage.src = "images/tp.jpg"; // Your top pipe image
bottomPipeImage.src = "images/bp.jpg"; // Your bottom pipe image

// Pipes
let pipeWidth = 50;
let pipeGap = 100;
let pipeSpeed = 2;
let pipes = [];

// Particle effect
let particles = [];

// Score system
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// Pause functionality
let isPaused = false;

// Game loop
function gameLoop() {
    if (isPaused) return;  // Pause the game if true

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird movement
    birdVelocity += birdGravity;
    birdY += birdVelocity;

    if (birdY + birdHeight >= canvas.height) {
        birdY = canvas.height - birdHeight;
        birdVelocity = 0;
    }

    if (birdY <= 0) {
        birdY = 0;
        birdVelocity = 0;
    }

    // Draw bird with animation (flapping)
    ctx.drawImage(birdImage, 50, birdY, birdWidth, birdHeight);

    // Pipe movement and scoring
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
        pipes.push({ x: canvas.width, y: pipeHeight });
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score++;  // Increment score when pipes move off-screen
        }

        // Draw top and bottom pipe images
        ctx.drawImage(topPipeImage, pipe.x, 0, pipeWidth, pipe.y);
        ctx.drawImage(bottomPipeImage, pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);
    });

    // Particle effects
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.size *= 0.98; // Fade particles over time

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove particle if it's too small
        if (particle.size < 1) {
            particles.splice(index, 1);
        }
    });

    // Check collisions
    pipes.forEach(pipe => {
        if (50 + birdWidth > pipe.x && 50 < pipe.x + pipeWidth) {
            if (birdY < pipe.y || birdY + birdHeight > pipe.y + pipeGap) {
                createParticles(birdY + birdHeight, 50); // Trigger particle effect on collision
                endGame(); // End game on collision
            }
        }
    });

    // Display score
    ctx.fillStyle = "#FFF";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 20, 40);

    // Display best score
    ctx.fillText("Best: " + bestScore, canvas.width - 150, 40);

    // Request new frame
    requestAnimationFrame(gameLoop);
}

// Particle effect function
function createParticles(y, x) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x + Math.random() * 30 - 15,
            y: y + Math.random() * 30 - 15,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * -3 - 1,
            size: Math.random() * 3 + 2,
            color: "rgba(255, 0, 0, 0.7)" // Red particles
        });
    }
}

// Event listener for bird control (click or space bar to make the bird fly)
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        birdVelocity = birdLift;
    } else if (e.code === "Escape") {
        togglePause(); // Pause/resume the game when escape key is pressed
    }
});

// Mobile tap support
canvas.addEventListener("click", () => {
    if (!isPaused) birdVelocity = birdLift;
});

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFF";
        ctx.font = "40px Arial";
        ctx.fillText("PAUSED", canvas.width / 2 - 100, canvas.height / 2);
    }
}

// End the game and show Game Over screen
function endGame() {
    // Check and update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore); // Save best score in localStorage
    }
    
    // Display Game Over screen
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF5C5C";
    ctx.font = "48px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 140, canvas.height / 2 - 40);
    ctx.fillStyle = "#FFF";
    ctx.font = "30px Arial";
    ctx.fillText("Press Space to Restart", canvas.width / 2 - 150, canvas.height / 2 + 40);

    // Wait for user to press Space to restart
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            resetGame(); // Restart game when spacebar is pressed
        }
    });
}

// Reset game
function resetGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    particles = [];
    score = 0;
    isPaused = false;
    gameLoop(); // Start the game loop again
}

// Start game loop
gameLoop();
