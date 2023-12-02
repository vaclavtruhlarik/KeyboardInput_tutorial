const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

ctx.font = "20px Arial"; // Set font size and family
ctx.fillStyle = "black"; // Set text color
ctx.textAlign = "center"; // Set text alignment

let score = 0;
let game_over = false;

const keys = [];
const characters = [];

let num_enemies = 3;
const enemy_sprites = [
    "starwarssprites/darthvader.png",
    "starwarssprites/darthsidious.png",
    "starwarssprites/darthmaul.png",
    "starwarssprites/imperial.png",
    "starwarssprites/mandalorian.png",
    "starwarssprites/mandalorian2.png",
    "starwarssprites/sith.png",
    "starwarssprites/sith2.png",
    "starwarssprites/stormtrooper.png",
];

let num_civilians = 3;
const civilian_sprites = [
    "starwarssprites/padme.png",
    "starwarssprites/protocoldroid1.png",
    "starwarssprites/rebelpilot.png",
    "starwarssprites/twilek.png",
    "starwarssprites/yoda.png",
    "starwarssprites/oola.png",
];

const player = {
    x: 200,
    y: 200,
    width: 40,
    height: 72,
    frame_x: 0,
    frame_y: 0,
    speed: 9,
    moving: false,
};

class Character {
    constructor() {
        this.width = 32;
        this.height = 48;
        this.x = 0;
        this.y = 0;
        this.speed = Math.random() * 1.5 + 3.5;
        this.frame_y = 0;
        this.frame_x = 0;
        this.sprite = new Image();
    }

    draw() {
        ctx.drawImage(
            this.sprite,
            this.frame_x * this.width,
            this.frame_y * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
        this.frame_x++;
        if (this.frame_x > 3) this.frame_x = 0;
    }
}

class Enemy extends Character {
    constructor() {
        super();
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height - 40) + 40;
        this.frame_y = 1;
        let index = Math.floor(Math.random() * enemy_sprites.length);
        this.sprite.src = enemy_sprites[index];
    }

    update() {
        this.x -= this.speed;
        if (this.x < 0) game_over = true;
    }
}
for (i = 0; i < num_enemies; i++) {
    characters.push(new Enemy());
}

class Civilian extends Character {
    constructor() {
        super();
        this.x = Math.random() * 50;
        this.y = canvas.height;
        this.frame_y = 3;
        let index = Math.floor(Math.random() * civilian_sprites.length);
        this.sprite.src = civilian_sprites[index];
    }

    update() {
        this.y -= this.speed;
        if (this.y < 70) {
            this.delete = true;
            characters.push(new Civilian());
        }
    }
}
for (i = 0; i < num_civilians; i++) {
    characters.push(new Civilian());
}

const player_sprite = new Image();
player_sprite.src = "starwarssprites/chewie.png";
const background = new Image();
background.src = "background.png";

function drawSprite(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    ctx.drawImage(img, sx * sw, sy * sh, sw, sh, dx, dy, dw, dh);
}

window.addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.code === "Space" && game_over) {
        game_over = false; // Reset game over flag
        score = 0; // Reset score or any other game variables
        characters.splice(0, characters.length);
        for (i = 0; i < num_enemies; i++) {
            characters.push(new Enemy());
        }
        for (i = 0; i < num_civilians; i++) {
            characters.push(new Civilian());
        }
        startAnimating(24); // Restart the animation
    }
});
window.addEventListener("keyup", function (e) {
    delete keys[e.key];
    player.moving = false;
});

function movePlayer() {
    if (keys["ArrowDown"] || keys["s"]) {
        player.y += player.speed;
        if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
        player.frame_y = 0;
        player.moving = true;
    }
    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed;
        if (player.x < 0) player.x = 0;
        player.frame_y = 1;
        player.moving = true;
    }
    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
        player.frame_y = 2;
        player.moving = true;
    }
    if (keys["ArrowUp"] || keys["w"]) {
        player.y -= player.speed;
        if (player.y < 40) player.y = 40;
        player.frame_y = 3;
        player.moving = true;
    }
}

function rectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function animateSprite(sprite) {
    if (sprite.moving) {
        sprite.frame_x++;
        if (sprite.frame_x > 3) sprite.frame_x = 0;
    }
}

let fps, fps_interval, start_time, now, then, elapsed;

function startAnimating(fps) {
    fps_interval = 1000 / fps;
    then = Date.now();
    start_time = then;
    animate();
}

startAnimating(24);
function animate() {
    if (game_over) {
        overlay();
        return;
    }
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fps_interval) {
        then = now - (elapsed % fps_interval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        drawSprite(
            player_sprite,
            player.frame_x,
            player.frame_y,
            player.width,
            player.height,
            player.x,
            player.y,
            player.width,
            player.height
        );
        movePlayer();
        animateSprite(player);
        const to_delete = [];
        for (i = 0; i < characters.length; i++) {
            characters[i].draw();
            characters[i].update();
            if (rectCollision(player, characters[i]) && characters[i].frame_y == 1) {
                to_delete.push(i);
                score += 10;
            } else if (characters[i].delete) to_delete.push(i);
        }
        for (j = to_delete.length - 1; j >= 0; j--) characters.splice(to_delete[j], 1);
        ctx.fillText("Score: " + score, canvas.width - 100, 30);
    }
}

overlay();
function overlay() {
    ctx.fillStyle = "#d79c50";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 30);
}

window.setInterval(function () {
    let hundred = Math.floor(score / 100);
    for (i = 0; i < hundred + 1; i++) {
        characters.push(new Enemy());
    }
}, 1000);
