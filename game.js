const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

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
    rightPaddleY += Math.sign(dy) * Math.min(Math.abs(dy), 4.5); // AI paddle speed
    rightPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddleY));
}

function resetBall() {
    ballX = WIDTH / 2;
    ballY = HEIGHT / 2;
    ballSpeedX = 5 * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = (Math.random() * 4 - 2);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();