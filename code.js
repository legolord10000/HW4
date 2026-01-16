// Get the canvas and drawing context
let canvas = document.getElementById("gameCanvas");
let pencil = canvas.getContext("2d");

//grab zombie images
let zombieBack = document.getElementById("zombie_back");
let zombieFront = document.getElementById("zombie_front");
let zombieRight = document.getElementById("zombie_right");
let zombieLeft = document.getElementById("zombie_left");

//item image
let itemSprite = document.getElementById("coin");
// background image element
let background = document.getElementById("background");

// bush (second character) images
let bushBack = document.getElementById("bush_back");
let bushFront = document.getElementById("bush_front");
let bushRight = document.getElementById("bush_right");
let bushLeft = document.getElementById("bush_left");

// -----------------------------------------------
// Character objects
let zombie = {
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    speed: 5,
    upKey: "w",
    downKey: "s",
    leftKey: "a",
    rightKey: "d",
    sprite : zombieBack,
    draw: function() {
        pencil.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    },
    move: function(keysPressed) {
        // move(keysPressed): change x/y based on keys pressed and update sprite for direction
        if (keysPressed[this.upKey]) {
            this.y -= this.speed;
            this.sprite = zombieBack;
        } else if (keysPressed[this.downKey]) {
            this.y += this.speed;
            this.sprite = zombieFront;
        }
        if (keysPressed[this.leftKey]) {
            this.x -= this.speed;
            this.sprite = zombieLeft;
        } else if (keysPressed[this.rightKey]) {
            this.x += this.speed;
            this.sprite = zombieRight;
        }

        // clamp to canvas
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
    }
};

// -----------------------------------------------
// Second character: bush
let bush = {
    x: 275,
    y: 275,
    width: 100,
    height: 100,
    speed: 5,
    upKey: "ArrowUp",
    downKey: "ArrowDown",
    leftKey: "ArrowLeft",
    rightKey: "ArrowRight",
    sprite: bushBack,
    draw: function() {
        pencil.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    },
    move: function(keysPressed) {
        // move(keysPressed): change x/y based on keys pressed and update sprite for direction
        if (keysPressed[this.upKey]) {
            this.y -= this.speed;
            this.sprite = bushBack;
        } else if (keysPressed[this.downKey]) {
            this.y += this.speed;
            this.sprite = bushFront;
        }
        if (keysPressed[this.leftKey]) {
            this.x -= this.speed;
            this.sprite = bushLeft;
        } else if (keysPressed[this.rightKey]) {
            this.x += this.speed;
            this.sprite = bushRight;
        }

        // clamp to canvas
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
    }
};

// -----------------------------------------------
// Scores and DOM refs
let scoreZombie = 0;
let scoreBush = 0;
let scoreZombieEl = document.getElementById('score-zombie');
let scoreBushEl = document.getElementById('score-bush');
// reset button reference
let resetBtn = document.getElementById('resetBtn');

// Game state
const WIN_SCORE = 5; // change this to adjust how many collects to win
let gameOver = false;
let winner = null; // 'zombie' or 'bush'

// -----------------------------------------------
// Track pressed keys
let keysPressed = {};
window.addEventListener("keydown", function(e) {
    keysPressed[e.key] = true;
});
window.addEventListener("keyup", function(e) {
    keysPressed[e.key] = false;
});

// -----------------------------------------------
// Utility function to check distance
function getDistance(a, b) {
    let dx = (a.x + a.width/2) - (b.x + b.width/2);
    let dy = (a.y + a.height/2) - (b.y + b.height/2);
    return Math.sqrt(dx*dx + dy*dy);
}

// -----------------------------------------------
// Item (collectable) object with safe respawn
let item = {
    x: 200,
    y: 150,
    width: 50,
    height: 50,
    sprite: itemSprite,
    draw: function() {
        pencil.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    },
    // respawn: pick a random location not too close to either character
    respawn: function() {
        const safeDistance = 120; // pixels
        let attempts = 0;
        do {
            this.x = Math.random() * (canvas.width - this.width);
            this.y = Math.random() * (canvas.height - this.height);
            attempts++;
            // if too many attempts, accept current position
            if (attempts > 50) break;
        } while (getDistance(this, zombie) < safeDistance || getDistance(this, bush) < safeDistance);
    }
};

// Initialize item at a safe location
item.respawn();

// -----------------------------------------------
// Game loop
function gameLoop() {
    // Draw background
    pencil.clearRect(0, 0, canvas.width, canvas.height);
    pencil.drawImage(background, 0, 0, canvas.width, canvas.height);

    // If game is over, draw win message on canvas and show reset button
    if (gameOver) {
        // dim the screen
        pencil.fillStyle = 'rgba(0,0,0,0.5)';
        pencil.fillRect(0, 0, canvas.width, canvas.height);

        // draw winner text
        pencil.fillStyle = 'white';
        pencil.font = '36px Arial';
        pencil.textAlign = 'center';
        let text = winner === 'zombie' ? 'Zombie Wins!' : 'Bush Wins!';
        pencil.fillText(text, canvas.width / 2, canvas.height / 2 - 20);

        // instruction
        pencil.font = '18px Arial';
        pencil.fillText('Click Play Again to restart', canvas.width / 2, canvas.height / 2 + 20);

        // show reset button
        if (resetBtn) resetBtn.style.display = 'inline-block';
        return; // skip normal updates while game over
    }
    // Move characters
    zombie.move(keysPressed);
    bush.move(keysPressed);

    // Draw characters
    zombie.draw();
    bush.draw();

    // Draw item
    item.draw();

    // Use getDistance here to check to see how close the characters are!
    const collectThreshold = 60; // distance in pixels to count as collection
    if (getDistance(zombie, item) < collectThreshold) {
        scoreZombie++;
        if (scoreZombieEl) scoreZombieEl.innerHTML = scoreZombie;
        item.respawn();
        if (scoreZombie >= WIN_SCORE) {
            gameOver = true;
            winner = 'zombie';
        }
    }
    if (getDistance(bush, item) < collectThreshold) {
        scoreBush++;
        if (scoreBushEl) scoreBushEl.innerHTML = scoreBush;
        item.respawn();
        if (scoreBush >= WIN_SCORE) {
            gameOver = true;
            winner = 'bush';
        }
    }
}

setInterval(gameLoop, 50);

// Reset function to restart the game
function resetGame() {
    scoreZombie = 0;
    scoreBush = 0;
    if (scoreZombieEl) scoreZombieEl.innerHTML = scoreZombie;
    if (scoreBushEl) scoreBushEl.innerHTML = scoreBush;
    // reset positions
    zombie.x = 50; zombie.y = 50;
    bush.x = 275; bush.y = 275;
    // respawn item safely
    item.respawn();
    // hide reset button
    if (resetBtn) resetBtn.style.display = 'none';
    gameOver = false;
    winner = null;
}

// Hook up reset button if present
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        resetGame();
    });
}