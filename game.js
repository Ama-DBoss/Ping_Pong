// Add these variables at the top
let gameEnded = false;
let gameStartTime = null;

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameStartTime = null;
const GAME_TIMEOUT = 5 * 60 * 1000; // 5 minutes in ms
let gameEnded = false;

// Difficulty settings
const difficulties = [
    { ballSpeed: 4, aiSpeed: 3 },   // Easy
    { ballSpeed: 5, aiSpeed: 4 },   // Medium
    { ballSpeed: 6, aiSpeed: 5 },   // Hard
    { ballSpeed: 7, aiSpeed: 6 },   // Very Hard
    { ballSpeed: 8, aiSpeed: 7 }    // Insane
];
let selectedDifficulty = 2; // Default to Medium (1-5)

function setDifficulty(level) {
    selectedDifficulty = Math.max(1, Math.min(5, level));
    // Set initial ball speed and AI paddle speed
    ballSpeedX = difficulties[selectedDifficulty - 1].ballSpeed * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = (Math.random() * 4 - 2);
}

// Paddle properties
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 18;

// Ball properties
const BALL_RADIUS = 10;

// Game state
let leftPaddleY = (HEIGHT - PADDLE_HEIGHT) / 2;
let rightPaddleY = (HEIGHT - PADDLE_HEIGHT) / 2;
let ballX = WIDTH / 2;
let ballY = HEIGHT / 2;
let ballSpeedX = 5 * (Math.random() < 0.5 ? 1 : -1);
let ballSpeedY = (Math.random() * 4 - 2);

let leftScore = 0;
let rightScore = 0;

// Mouse paddle control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp within bounds
    leftPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, leftPaddleY));
});

function draw() {
    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Middle line
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.font = "36px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(leftScore, WIDTH / 2 - 60, 50);
    ctx.fillText(rightScore, WIDTH / 2 + 30, 50);

    // Left paddle
    ctx.fillStyle = "#0f0";
    ctx.fillRect(PADDLE_MARGIN, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Right paddle
    ctx.fillStyle = "#f00";
    ctx.fillRect(WIDTH - PADDLE_WIDTH - PADDLE_MARGIN, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
}

function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision
    if (ballY < BALL_RADIUS) {
        ballY = BALL_RADIUS;
        ballSpeedY *= -1;
    } else if (ballY > HEIGHT - BALL_RADIUS) {
        ballY = HEIGHT - BALL_RADIUS;
        ballSpeedY *= -1;
    }

    // Left paddle collision
    if (
        ballX - BALL_RADIUS < PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS;
        ballSpeedX *= -1.05; // slightly increase speed
        // Add spin based on where ball hit paddle
        let hitPos = (ballY - leftPaddleY - PADDLE_HEIGHT / 2) / (PADDLE_HEIGHT / 2);
        ballSpeedY += hitPos * 2;
    }

    // Right paddle collision
    if (
        ballX + BALL_RADIUS > WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_RADIUS;
        ballSpeedX *= -1.05;
        let hitPos = (ballY - rightPaddleY - PADDLE_HEIGHT / 2) / (PADDLE_HEIGHT / 2);
        ballSpeedY += hitPos * 2;
    }

    // Score
    if (ballX < 0) {
        rightScore++;
        resetBall();
    }
    if (ballX > WIDTH) {
        leftScore++;
        resetBall();
    }

    // AI for right paddle (simple tracking)
    let targetY = ballY - PADDLE_HEIGHT / 2;
    let dy = targetY - rightPaddleY;
    rightPaddleY += Math.sign(dy) * Math.min(Math.abs(dy), difficulties[selectedDifficulty - 1].aiSpeed);
    rightPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddleY));
}

function resetBall() {
    ballX = WIDTH / 2;
    ballY = HEIGHT / 2;
    ballSpeedX = difficulties[selectedDifficulty - 1].ballSpeed * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = (Math.random() * 4 - 2);
}

/ Restart game function
function restartGame() {
    leftScore = 0;
    rightScore = 0;
    leftPaddleY = (HEIGHT - PADDLE_HEIGHT) / 2;
    rightPaddleY = (HEIGHT - PADDLE_HEIGHT) / 2;
    gameStartTime = Date.now();
    gameEnded = false;
    resetBall();
    gameLoop();
}

// Quit game function
function quitGame() {
    gameEnded = true;
    setTimeout(() => {
        alert("Game quit. Thanks for playing!");
    }, 100);
}

// Update your gameLoop function:
function gameLoop() {
    if (!gameStartTime) gameStartTime = Date.now();

    if (!gameEnded) {
        update();
        draw();

        // Timeout check (if implemented)
        if (Date.now() - gameStartTime >= GAME_TIMEOUT && leftScore < 11 && rightScore < 11) {
            gameEnded = true;
            setTimeout(() => {
                alert("Time's up! No winner.");
            }, 100);
            return;
        }

        // End game if someone reaches 11
        if (leftScore >= 11 || rightScore >= 11) {
            gameEnded = true;
            setTimeout(() => {
                // Congratulatory message for winner
                const winner = leftScore >= 11 ? "Left player" : "Right player";
                alert(`Congratulations, ${winner} wins!`);
            }, 100);
            return;
        }
        requestAnimationFrame(gameLoop);
    }
}

window.setDifficulty = setDifficulty;

gameLoop();

// Add restart & quit button event listeners at the end of your file:
document.getElementById('restartBtn').addEventListener('click', () => {
    restartGame();
});
document.getElementById('quitBtn').addEventListener('click', () => {
    quitGame();
});
