/**
 * above the sky: a simple game made with html5 (this game has no commercial purpose)
 * created by frederico lima (frederico.vieira@gmail.com)
 * music by black drawing chalks (my favorite way and swallow)
 * thanks for:
 * matt hackett - navigation commands (http://goo.gl/OL1E8)
 * zouhair serrar - explosion effect (http://goo.gl/b2L0o)
 * skorpio - boss image (http://goo.gl/Skocn)
 * note: images of the ship, enemies and asteroids, were caught on the internet and credits are of their OWNERS. they were used for experimentation.
 */

var start = function() {
    $('#earth').hide();
    $('#title').hide();
    $('#commands').hide();
    $('#press').hide();
    $('#score').hide();
    $('#credits').hide();
    game();
};

var game = function() {
    var shipRead = false;
    var shipImage = [];
    var explosionParticles = {};
    var enemiesShots = {};
    var stepsCircularShot = 16;
    var score = 0;
    var shipShots = [];
    var keysDown = {};
    var enemies = {};
    var ids = 2;
    var enemiesCount = 0;
    var enemiesDestroyed = 0;
    var asteroidsCount = 0;
    var lastAsteroid = Date.now();
    var lastEnemy = Date.now();
    var gameOver = false;
    var finished = false;
    var radian = 0;
    var paused = false;
    var bossVisible = false;
    var bossReady = false;
    var secondBoss = false;
    var modifier = 0;
    var intervalId = 0;
    var begin = Date.now();
    var scoreRegistered = false;

    ctx.fillStyle = "#fff";
    ctx.font = "14px Currier New";
    ctx.align = "left";
    ctx.textBaseline = "top";

    audioMusic1.play();

    if(typeof window.orientation !== 'undefined') {
        var deviceOrientationListener = function(e) {
            if (e.gamma > 0) {
                delete keysDown[UP];
                keysDown[DOWN] = true;
            }
            if (e.gamma < 0) {
                keysDown[UP] = true;
                delete keysDown[DOWN];
            }
            if (e.gamma == 0) {
                delete keysDown[UP];
                delete keysDown[DOWN];
            }
            if (e.beta > 0) {
                delete keysDown[LEFT];
                keysDown[RIGHT] = true;
            }
            if (e.beta < 0) {
                keysDown[LEFT] = true;
                delete keysDown[RIGHT];
            }
            if (e.beta == 0) {
                delete keysDown[LEFT];
                delete keysDown[RIGHT];
            }
        };

        removeEventListener("deviceorientation", deviceOrientationListener);
        addEventListener("deviceorientation", deviceOrientationListener, false);

        var touchStartListener = function(e) {
            e.preventDefault();
        };

        removeEventListener("touchstart", touchStartListener);
        addEventListener("touchstart", touchStartListener, false);
    }
    else {
        var keydownListener = function(e) {
            if (e.keyCode == PAUSE) {
                if (!paused) {
                    paused = true;
                    if (bossVisible)
                        audioMusic2.pause();
                    else
                        audioMusic1.pause();
                }
                else {
                    paused = false;
                    if (bossVisible)
                        audioMusic2.play();
                    else
                        audioMusic1.play();
                }
            }
            keysDown[e.keyCode] = true;
        };

        var keyupListener = function(e) {
            delete keysDown[e.keyCode];
        };

        removeEventListener("keydown", keydownListener);
        addEventListener("keydown", keydownListener, false);

        removeEventListener("keyup", keyupListener);
        addEventListener("keyup", keyupListener, false);
    }

    shipImage[0] = new Image();
    shipImage[1] = new Image();
    shipImage[2] = new Image();
    shipImage[0].src = "img/ship_left.png";
    shipImage[1].src = "img/ship.png";
    shipImage[2].src = "img/ship_right.png";

    shipImage[1].onload = function () {
        shipRead = true;
    };

    var ship = {
        id: 1,
        speedY: 300,
        speedX: 400,
        x: Math.floor(canvas.width / 2),
        y: Math.floor((canvas.height - 110)),
        width: 41,
        height: 70,
        lifes: 3,
        onLeft: false,
        onRight: false,
        destroyed: false,
        visible: true,
        shots: 100
    };
    explosionParticles[ship.id] = [];

    var asteroid1 = {
        id: 0,
        speed: 50,
        points: 200,
        x: 0,
        y: 0,
        image: new Image(),
        width: 160,
        height: 117,
        destroyed: false,
        visible: true,
        power: 30,
        typeMovement: 1,
        shoots: false
    };
    asteroid1.image.src = "img/asteroid1.png";

    var asteroid2 = {
        id: 0,
        speed: 20,
        points: 60,
        x: 0,
        y: 0,
        image: new Image(),
        width: 120,
        height: 74,
        destroyed: false,
        visible: true,
        power: 20,
        typeMovement: 1,
        shoots: false
    };
    asteroid2.image.src = "img/asteroid2.png";

    var enemy1 = {
        id: 0,
        speed: 40,
        points: 20,
        x: 0,
        y: 0,
        image: new Image(),
        width: 90,
        height: 91,
        destroyed: false,
        visible: true,
        power: 10,
        typeMovement: 1,
        movementCount: 0,
        shoots: true,
        lastShot: null,
        shotSpeed: 60
    };
    enemy1.image.src = "img/enemy1.png";

    var enemy2 = {
        id: 0,
        speed: 80,
        points: 30,
        x: 0,
        y: 0,
        image: new Image(),
        width: 64,
        height: 59,
        destroyed: false,
        visible: true,
        power: 7,
        typeMovement: 3,
        movementCount: 0,
        shoots: true,
        lastShot: null,
        shotSpeed: 80
    };
    enemy2.image.src = "img/enemy2.png";

    var enemy3 = {
        id: 0,
        speed: 120,
        points: 30,
        x: 0,
        y: 0,
        image: new Image(),
        width: 64,
        height: 62,
        destroyed: false,
        visible: true,
        power: 5,
        typeMovement: 2,
        movementCount: 0,
        shoots: true,
        lastShot: null,
        shotSpeed: 40
    };
    enemy3.image.src = "img/enemy3.png";

    var boss = {
        id: 0,
        speed: 10,
        points: 1000,
        x: 0,
        y: 0,
        image: new Image(),
        width: 164,
        height: 241,
        destroyed: false,
        visible: true,
        initPower: 800,
        power: 800,
        typeMovement: 7,
        movementCount: 0,
        shoots: true,
        lastShot: null,
        shotSpeed: 80,
        onLeft: true,
        onRight: false
    };
    boss.image.src = "img/boss.png";

    var laser = {
        x: 0,
        y: 0,
        visible: true,
        speed: 500,
        width: 2,
        height: 6,
        lastShot: null
    };

    var life = {
        x: 0,
        y: 0,
        visible: true,
        destroyed: false,
        speed: 120,
        width: 20,
        height: 23,
        typeMovement: 6,
        power: 1,
        image: new Image()
    };
    life.image.src = "img/life.png";

    var enemyShot = {
        x: 0,
        y: 0,
        destinyX: 0,
        destinyY: 0,
        width: 4,
        height: 8,
        destroyed: false,
        visible: true,
        speed: 260,
        radius: 60
    };

    var particle = {
        scale: 1.0,
        x: 0,
        y: 0,
        radius: 20,
        color: "#000",
        velocityX: 0,
        velocityY: 0,
        scaleSpeed: 0.5
    };

    var moveParticle = function(particle) {
        particle.scale -= particle.scaleSpeed * modifier;
        if (particle.scale <= 0)
            particle.scale = 0;
        particle.x += particle.velocityX * modifier;
        particle.y += particle.velocityY * modifier;
    };

    var drawParticle = function(particle) {
        moveParticle(particle, modifier);
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.scale(particle.scale, particle.scale);
        ctx.beginPath();
        ctx.arc(0, 0, particle.radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.restore();
    };

    var createExplosion = function(id, x, y, w, h, color) {
        var minSize = 10;
        var maxSize = 30;
        var count = 10;
        var minSpeed = 60.0;
        var maxSpeed = 200.0;
        var minScaleSpeed = 1.0;
        var maxScaleSpeed = 4.0;
        for (var angle=0;angle<360;angle+=Math.round(360/count)) {
            var objParticle = Object.create(particle);
            objParticle.x = x + (w / 2);
            objParticle.y = y + (h / 2);
            objParticle.radius = getRandomValue(minSize, maxSize);
            objParticle.color = color;
            objParticle.scaleSpeed = getRandomValue(minScaleSpeed, maxScaleSpeed);
            var speed = getRandomValue(minSpeed, maxSpeed);
            objParticle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
            objParticle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);
            explosionParticles[id][explosionParticles[id].length] = objParticle;
        }
    };

    var moveParticles = function(id) {
        for (var i=0;i<explosionParticles[id].length;i++) {
            drawParticle(explosionParticles[id][i]);
        }
    };

    var explode = function() {
        for (var id in explosionParticles) {
            if (id == 1)
                moveParticles(id);
            else {
                if (id in enemies && enemies[id].destroyed) {
                    moveParticles(id);
                    removeEnemy(id);
                }
            }
        }
    };

    var removeEnemy = function(id) {
        if (!id in enemies) return;
        for (var i=0;i<explosionParticles[id].length;i++) {
            if (explosionParticles[id][i].scale > 0)
                return;
        }
        delete enemies[id];
        delete explosionParticles[id];
    };

    var createLaserShot = function() {
        if (ship.lastShot && (Date.now() - ship.lastShot) < 100) return;
        var objShot = Object.create(laser);
        objShot.x = (ship.x - 0.5) + (ship.width / 2);
        objShot.y = ship.y;
        shipShots[shipShots.length] = objShot;
        ship.shots--;
        ship.lastShot = Date.now()
        audioShot.play();
    };

    var shootLaser = function() {
        for (var i=0;i<shipShots.length;i++) {
            if (shipShots[i].visible) {
                ctx.fillRect(shipShots[i].x, shipShots[i].y, shipShots[i].width, shipShots[i].height);
                shipShots[i].y -= (shipShots[i].speed * modifier);
                if (shipShots[i].y < 0)
                    shipShots[i].visible = false;
            }
        }
    };

    var detectLaserColision = function(item) {
        for (var i=0;i<shipShots.length;i++) {
            if (shipShots[i].visible) {
                if (shipShots[i].y >= item.y && shipShots[i].y <= (item.y + item.height) &&
                    shipShots[i].x >= item.x && shipShots[i].x <= (item.x + item.width))
                {
                    shipShots[i].visible = false;
                    if (item.power) {
                        item.power--;
                        if (item.power == 0) {
                            score += item.points;
                            item.destroyed = true;
                            item.visible = false;
                            if (item.shoots) {
                                delete enemiesShots[item.id];
                                enemiesDestroyed++;
                            }
                            audioExplosion.play();
                            createExplosion(item.id, item.x, item.y, item.width, item.height, "#303134");
                            createExplosion(item.id, item.x, item.y, item.width, item.height, "#616368");
                        }
                    }
                    else {
                        item.destroyed = true;
                        item.visible = false;
                    }
                }
            }
        }
    };

    var verifyBounds = function() {
        if (ship.y < 0)
            ship.y = 1;
        if (ship.y > canvas.height - ship.height)
            ship.y = canvas.height - ship.height;
        if (ship.x < 0)
            ship.x = 1;
        if (ship.x > canvas.width - ship.width)
            ship.x = canvas.width - ship.width;
    };

    var update = function() {
        verifyBounds();

        ship.left = false;
        ship.right = false;

        //controls
        if (DOWN in keysDown)
            ship.y -= Math.floor(ship.speedY * modifier);
        if (UP in keysDown)
            ship.y += Math.floor(ship.speedY * modifier);
        if (LEFT in keysDown) {
            ship.x -= Math.floor(ship.speedX * modifier);
            ship.left = true;
        }
        if (RIGHT in keysDown) {
            ship.x += Math.floor(ship.speedX * modifier);
            ship.right = true;
        }

        //clear context
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        //fire ship shot
        if (X in keysDown) {
            if (ship.shots > 0)
                createLaserShot();
            else {
                if (!shipShots[shipShots.length - 1].visible || shipShots[shipShots.length - 1].y < 0) {
                    shipShots = [];
                    ship.shots = 100;
                }
            }
        }

        shootLaser();

        if (enemiesDestroyed == 30 && !bossVisible)
            bossVisible = true;

        if (enemiesDestroyed == 60 && !bossVisible) {
            boss.destroyed = false;
            boss.visible = true;
            boss.initPower = 800;
            boss.power = 800;
            bossReady = false;
            secondBoss = true;
            bossVisible = true;
        }

        if (secondBoss && boss.destroyed) {
            gameOver = true;
            finished = true;
        }
    };

    var drawStars = function() {
        for (var i=0;i<stars.length;i++) {
            if (38 in keysDown) stars[i].y++;
            ctx.fillRect(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
            if (stars[i].y > canvas.height)
                stars[i].y=0;
            else
                stars[i].y++;
        }
    };

    var createAsteroid = function() {
        var objAsteroid = null;
        if (asteroidsCount > 3) {
            objAsteroid = Object.create(asteroid1);
            asteroidsCount = 0;
        }
        else
            objAsteroid = Object.create(asteroid2);
        objAsteroid.id = ids++;
        explosionParticles[objAsteroid.id] = [];
        objAsteroid.x = getRandomX(canvas.width, objAsteroid.width);
        asteroidsCount++;
        return objAsteroid;
    };

    var createEnemy = function() {
        var objEnemy = null;
        if (enemiesCount == 1)
            objEnemy = Object.create(enemy1);
        else if (enemiesCount == 3)
            objEnemy = Object.create(enemy2);
        else  {
            objEnemy = Object.create(enemy3);
            if (enemiesCount > 4)
                enemiesCount = 0;
        }
        objEnemy.x = getRandomX(canvas.width, objEnemy.width);
        objEnemy.id = ids++;
        explosionParticles[objEnemy.id] = [];
        enemiesShots[objEnemy.id] = [];
        if (objEnemy.x < 0)
            objEnemy.x = objEnemy.width;
        if ((objEnemy.x + objEnemy.width) > canvas.width)
            objEnemy.x = (canvas.width - objEnemy.width);
        enemiesCount++;
        return objEnemy;
    };

    var detectShipColision = function(ship, item) {
        if (ship.x <= (item.x + item.width) && ship.y <= (item.y + item.height) &&
            item.x <= (ship.x + ship.width) && item.y <= (ship.y + ship.height))
        {
            if (item.typeMovement ==  6) {
                ship.lifes++;
            }
            else {
                ship.lifes--;
                audioExplosion.play();
                createExplosion(ship.id, ship.x, ship.y, ship.width, ship.height, "#303134");
                createExplosion(ship.id, ship.x, ship.y, ship.width, ship.height, "#616368");
                if (ship.lifes == 0)
                    gameOver = true;
                if (item.points) {
                    ship.points += item.points;
                    createExplosion(item.id, item.x, item.y, item.width, item.height, "#303134");
                    createExplosion(item.id, item.x, item.y, item.width, item.height, "#616368");
                }
            }
            item.destroyed = true;
            item.visible = false;
        }
    };

    var createEnemyShot = function(k) {
        if (enemies[k].visible && enemies[k].shoots) {
            var lastShot = false;
            if (enemies[k].typeMovement == 1)
                lastShot = (Date.now() - enemies[k].lastShot) > 5000;
            else if (enemies[k].typeMovement == 2)
                lastShot = (Date.now() - enemies[k].lastShot) > 4000;
            else if (enemies[k].typeMovement == 7)
                lastShot = (Date.now() - enemies[k].lastShot) > 1000;
            else
                lastShot = (Date.now() - enemies[k].lastShot) > 2000;
            if (!enemies[k].lastShot || lastShot) {
                if (enemies[k].typeMovement == 1) {
                    for (var i=0;i<stepsCircularShot;i++) {
                        var objShot = Object.create(enemyShot);
                        radian = (2 * Math.PI) * (i / stepsCircularShot);
                        objShot.x = enemies[k].x + (enemies[k].width / 2) - (objShot.width / 2) + objShot.radius * Math.cos(radian);
                        objShot.y = enemies[k].y + (enemies[k].height) + objShot.radius * Math.sin(radian);
                        enemiesShots[enemies[k].id][enemiesShots[enemies[k].id].length] = objShot;
                    }
                }
                else {
                    var objShot = Object.create(enemyShot);
                    objShot.x = (enemies[k].x + (enemies[k].width / 2)) - (objShot.width / 2);
                    objShot.y = enemies[k].y + (enemies[k].height);
                    enemiesShots[enemies[k].id][enemiesShots[enemies[k].id].length] = objShot;
                }
                enemies[k].lastShot = Date.now();
            }
            if (enemies[k].typeMovement == 1) {
                for (var i=0;i<enemiesShots[k].length;i++) {
                    if (enemiesShots[k][i].visible) {
                        ctx.fillRect(enemiesShots[k][i].x, enemiesShots[k][i].y, enemiesShots[k][i].width, enemiesShots[k][i].height);
                        radian = (2 * Math.PI) * (i / stepsCircularShot);
                        enemiesShots[k][i].x = enemies[k].x + (enemies[k].width / 2) - (enemiesShots[k][i].width / 2) + enemiesShots[k][i].radius * Math.cos(radian);
                        enemiesShots[k][i].y = enemies[k].y + (enemies[k].height) + enemiesShots[k][i].radius * Math.sin(radian);
                        enemiesShots[k][i].radius += enemiesShots[k][i].speed * modifier;
                        detectShipColision(ship, enemiesShots[k][i]);
                        detectLaserColision(enemiesShots[k][i]);
                        if (enemiesShots[k][i].x < 0 || enemiesShots[k][i].y < 0 ||
                            enemiesShots[k][i].x > canvas.width || enemiesShots[k][i].y > canvas.height) {
                            enemiesShots[k][i].visible = false;
                            enemiesShots[k][i].destroyed = true;
                        }
                    }
                }
            }
            else {
                for (var i=0;i<enemiesShots[k].length;i++) {
                    if (enemiesShots[k][i].visible) {
                        if (enemiesShots[k][i].y == (enemies[k].y + (enemies[k].height)))
                            audioShot.play();
                        ctx.fillRect(enemiesShots[k][i].x, enemiesShots[k][i].y, enemiesShots[k][i].width, enemiesShots[k][i].height);
                        enemiesShots[k][i].y += enemiesShots[k][i].speed * modifier;
                        if (enemiesShots[k][i].y > canvas.height) {
                            enemiesShots[k][i].visible = false;
                            enemiesShots[k][i].destroyed = true;
                        }
                        detectShipColision(ship, enemiesShots[k][i]);
                        detectLaserColision(enemiesShots[k][i]);
                    }
                }
            }
        }
    };

    var moveEnemiesAndAsteroids = function() {
        for (var k in enemies) {
            if (!enemies[k].destroyed && enemies[k].visible) {
                detectLaserColision(enemies[k]);
                detectShipColision(ship, enemies[k]);
                if (enemies[k].typeMovement == 2) {
                    if (enemies[k].movementCount > 400)
                        enemies[k].x-=getIntValue(enemies[k].speed * modifier);
                    else
                        enemies[k].x+=getIntValue(enemies[k].speed * modifier);
                    enemies[k].movementCount++;
                    enemies[k].y+=getIntValue(enemies[k].speed * modifier);
                }
                else if (enemies[k].typeMovement == 3) {
                    if (enemies[k].movementCount < 600 && (enemies[k].x + enemies[k].width) < canvas.width)
                        enemies[k].x+=getIntValue(enemies[k].speed * modifier);
                    else
                        enemies[k].y+=getIntValue(enemies[k].speed * modifier);
                    enemies[k].movementCount++;
                }
                else if (enemies[k].typeMovement == 7) {
                    if (enemies[k].y < 0)
                        enemies[k].y+=getIntValue(enemies[k].speed * modifier);
                    else {
                        if (enemies[k].x + enemies[k].width >= canvas.width) {
                            enemies[k].onLeft = true;
                            enemies[k].onRight = false;
                        }
                        if (enemies[k].x <= 0) {
                            enemies[k].onLeft = false;
                            enemies[k].onRight = true;
                        }
                        if (enemies[k].onLeft)
                            enemies[k].x-=getIntValue(enemies[k].speed * 30 * modifier);
                        if (enemies[k].onRight)
                            enemies[k].x+=getIntValue(enemies[k].speed * 30 * modifier);
                    }
                }
                else
                    enemies[k].y+=getIntValue(enemies[k].speed * modifier);
                ctx.drawImage(enemies[k].image, enemies[k].x, enemies[k].y);
                createEnemyShot(k);
                if (enemies[k].y > canvas.height) {
                    enemies[k].visible = false;
                    enemies[k].destroyed = true;
                    if (enemies[k].shoots)
                        delete enemiesShots[k];
                    delete enemies[k];
                    delete explosionParticles[k];
                }
            }
        }
    };

    var drawBoss = function() {
        if (!bossVisible)
            return;
        if (!bossReady) {
            audioMusic1.pause();
            audioMusic2.play();
            boss.y = boss.height * -1;
            boss.x = (canvas.width / 2) - (boss.width / 2);
            boss.id = ids++;
            explosionParticles[boss.id] = [];
            enemiesShots[boss.id] = [];
            enemies[boss.id] = boss;
            createLife();
        }
        if (boss.destroyed) {
            audioMusic1.currentTime = 0;
            audioMusic1.play();
            audioMusic2.currentTime = 0;
            audioMusic2.pause();
            bossVisible = false;
            return;
        }
        bossReady = true;
        ctx.fillRect(canvas.width - 104, 10, (boss.power / boss.initPower) * 100, 10);
        if (!secondBoss)
            moveEnemiesAndAsteroids();
    };

    var drawEnemies = function() {
        var now = Date.now();
        if ((now - lastEnemy) >= 3000) {
            var enemy = createEnemy();
            enemies[enemy.id] = enemy;
            lastEnemy = now;
        }
        if ((now - lastAsteroid) >= 40000) {
            var asteroid = createAsteroid();
            enemies[asteroid.id] = asteroid;
            lastAsteroid = now;
        }
        moveEnemiesAndAsteroids();
    };

    var createLife = function() {
        var objLife = Object.create(life);
        objLife.x = getRandomX(canvas.width, objLife.width);
        objLife.id = -1;
        enemies[objLife.id] = objLife;
        explosionParticles[objLife.id] = [];
    };

    var showGameOver = function() {
        $('#title').show();
        $('#title img').attr('src', 'img/gameover.png');
        if (score > 0) {
            $('#player').show();
            $('#player input').focus();
        }
        $('#press').show();
    };

    var showYouWin = function() {
        $('#title').show();
        $('#title img').attr('src', 'img/youwin.png');
        $('#player').show();
        $('#player input').focus();
        $('#press').show();
    };

    var drawShip = function() {
        if (shipRead) {
            if (ship.left)
                ctx.drawImage(shipImage[0], ship.x, ship.y);
            else if (ship.right)
                ctx.drawImage(shipImage[2], ship.x, ship.y);
            else
                ctx.drawImage(shipImage[1], ship.x, ship.y);
        }
    };

    var render = function() {
        drawStars();

        if (!bossVisible)
            drawEnemies();
        else
            if (secondBoss)
                drawEnemies();
            drawBoss();

        drawShip();
        explode();

        ctx.fillText("Lifes: " + ship.lifes + " Score: " + score + " Shots: " + ship.shots, 10, 10);
    };

    var exit = function() {
        register($('#name').val(), score, ship.lifes, enemiesDestroyed, (finished ? 1 : 0));
        scoreRegistered = true;
    };

    var main = function () {
        var now = Date.now();
        var delta = (now - begin);
        modifier = (delta / 1000);

        if (!paused) {
            if (!gameOver) {
                update();
                render();
            }
            else {
                if (finished)
                    showYouWin();
                else
                    showGameOver();

                clearInterval(intervalId);

                audioMusic1.pause();
                audioMusic2.pause();

                addEventListener("touchstart", function(e) {
                    e.preventDefault();
                    if (!scoreRegistered)
                        exit();
                }, false);

                addEventListener("keydown", function(e) {
                    if (e.keyCode == ENTER) {
                        if (!scoreRegistered)
                            exit();
                    }
                }, false);

            }
        }

        begin = now;
    };

    intervalId = setInterval(main, 1);
};