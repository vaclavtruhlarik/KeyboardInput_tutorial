const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

const keys = [];
const charancters = [];

let num_enemies = 20;
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

let num_civilians = 1;
const civilian_sprites = [
    "starwarssprites/padme.png",
    "starwarssprites/protocoldroid1.png",
    "starwarssprites/rebelpilot.png",
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
        if (this.x < 0) {
            this.x = canvas.width;
            this.y = Math.random() * (canvas.height - this.height - 40) + 40;
        }
    }
}
for (i = 0; i < num_enemies; i++) {
    charancters.push(new Enemy());
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
            this.y = canvas.height;
            this.x = Math.random() * 50;
        }
    }
}
for (i = 0; i < num_civilians; i++) {
    charancters.push(new Civilian());
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
});
window.addEventListener("keyup", function (e) {
    delete keys[e.key];
    player.moving = false;
});

function movePlayer() {
    if (keys["s"]) {
        player.y += player.speed;
        if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
        player.frame_y = 0;
        player.moving = true;
    }
    if (keys["a"]) {
        player.x -= player.speed;
        if (player.x < 0) player.x = 0;
        player.frame_y = 1;
        player.moving = true;
    }
    if (keys["d"]) {
        player.x += player.speed;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
        player.frame_y = 2;
        player.moving = true;
    }
    if (keys["w"]) {
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

function animate() {
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
        for (i = 0; i < charancters.length; i++) {
            charancters[i].draw();
            charancters[i].update();
            if (rectCollision(player, charancters[i])) {
                if (charancters[i].frame_y == 1) to_delete.push(i);
            }
        }
        for (j = to_delete.length - 1; j >= 0; j--) charancters.splice(to_delete[j], 1);
    }
}
startAnimating(24);
