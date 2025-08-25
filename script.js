const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let SpaceshipFloatSpeed = 0;         // Start at 0 for natural gravity
const gravity = 0.3;                 // Lower gravity for slower fall
const spaceshipImg = new Image();
spaceshipImg.src = 'Assets/spaceship.png';

let spaceship = { img: spaceshipImg, x: 75, y: canvas.height / 2, width: 75, height: 75 };
let obstacles = [];
let obstacleWidth = 50;
let obstacleHeight = 200;
let obstacleSpeed = 2;
let score = 0;
let gameOver = false;
let gameStarted = false;
let obstacleIntervalId = null;

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !gameOver) {
        SpaceshipFloatSpeed = -7;    // Smaller negative for gentler jump
    }
});

function createObstacle() {
    const obstacle = {
        x: canvas.width,
        y: Math.random() * (canvas.height - obstacleHeight),
        width: obstacleWidth,
        height: obstacleHeight,
        passed: false
    };
    obstacles.push(obstacle);
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
        if (checkCollision(spaceship, obstacle)) {
            endGame();
        }
    });
    // Remove obstacles that have gone off screen
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision(spaceship, obstacle) {
    return (
        spaceship.x < obstacle.x + obstacle.width &&
        spaceship.x + spaceship.width > obstacle.x &&
        spaceship.y < obstacle.y + obstacle.height &&
        spaceship.y + spaceship.height > obstacle.y
    );
}

function updateScore() {
    obstacles.forEach(obstacle => {
        if (obstacle.x + obstacle.width < spaceship.x && !obstacle.passed) {
            score++;
            obstacle.passed = true;
            playCoinSound();
        }
    });
}

function playCoinSound() {
    const coinSound = new Audio('Assets/coin-recieved.mp3');
    coinSound.play();
}

function playCrashSound() {
    const crashSound = new Audio('Assets/crash.mp3');
    crashSound.play();
}

function endGame() {
    gameOver = true;
    document.getElementById('replayButton').style.display = 'block';
    playCrashSound();
    if (obstacleIntervalId) clearInterval(obstacleIntervalId);
}

function resetGame() {
    score = 0;
    obstacles = [];
    spaceship.y = canvas.height / 2;
    SpaceshipFloatSpeed = 0;
    gameOver = false;
    gameStarted = false;
    document.getElementById('replayButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    if (obstacleIntervalId) clearInterval(obstacleIntervalId);
}

document.getElementById('replayButton').addEventListener('click', resetGame);

document.getElementById('startButton').addEventListener('click', function() {
    this.style.display = 'none';
    gameStarted = true;
    gameOver = false;
    score = 0;
    obstacles = [];
    spaceship.y = canvas.height / 2;
    SpaceshipFloatSpeed = 0;
    document.getElementById('scoreboard').innerText = `Score: ${score}`;
    if (obstacleIntervalId) clearInterval(obstacleIntervalId);
    obstacleIntervalId = setInterval(createObstacle, 2000);
    update();
});

function update() {
    if (!gameStarted) {
        // Draw initial state (spaceship and background)
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(spaceship.img, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
        document.getElementById('scoreboard').innerText = `Score: ${score}`;
        requestAnimationFrame(update);
        return;
    }
    if (!gameOver) {
        SpaceshipFloatSpeed += gravity;
        spaceship.y += SpaceshipFloatSpeed;

        if (spaceship.y + spaceship.height >= canvas.height) {
            spaceship.y = canvas.height - spaceship.height;
            endGame();
        } else if (spaceship.y <= 0) {
            spaceship.y = 0;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        updateObstacles();
        updateScore();
        context.drawImage(spaceship.img, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
        obstacles.forEach(obstacle => {
            context.fillStyle = 'blue';
            context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        document.getElementById('scoreboard').innerText = `Score: ${score}`;
    }
    requestAnimationFrame(update);
}

update();