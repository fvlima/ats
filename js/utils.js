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

var ENTER = 13;
var PAUSE = 80;
var UP = 40;
var DOWN = 38;
var LEFT = 37;
var RIGHT = 39;
var X = 88;

var canvas;
var ctx;
var stars = [];
var extension = (navigator.userAgent.match(/(firefox)/i) ? 'ogg' : 'mp3');
//navigator.userAgent.match(/(ipad|iphone|ipod)/i);
//navigator.userAgent.match(/android/i);

var star = {
    x: 0,
    y: 0,
    size: 0
};

var getRandomValue = function(min, max) {
    return min + Math.random() * (max - min);
};

var getRandomX = function(screenWidth, objSize) {
    var x = Math.random() * (1 - screenWidth + 1) + screenWidth;
    if (x < 0)
        x = objSize;
    if (x + objSize > canvas.width)
        x = (canvas.width - objSize);
    return x;
};

var getRandomY = function(screenHeight) {
    return Math.random() * (1 - screenHeight + 1) + screenHeight;
};

var getIntValue = function(floatValue) {
    if (floatValue < 1)
        return floatValue;
    return Math.floor(floatValue);
};

var createStars = function(screenWidth, screenHeight, ctx) {
    for (var i=0;i<100;i++) {
        var objStar = Object.create(star);
        objStar.size = getRandomValue(1, 3);
        objStar.x = getRandomX(screenWidth, objStar.size);
        objStar.y = getRandomY(screenHeight);
        stars[i] = objStar;
        ctx.fillRect(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
    }
};

var register = function(name, points, lifes, enemies_destroyed, finished) {
    window.location.href = 'index.html';
    /*
    if (name.length == 0 || points == 0) {
        window.location.href = '/';
    }
    else {
        $.ajax({
            type: 'POST',
            url: '/register/',
            data: 'name=' + name + '&points=' + points + '&lifes=' + lifes + '&enemies_destroyed='+ enemies_destroyed + '&finished=' + finished,
            dataType: "json",
            success: function(value) {
                if (value)
                    window.location.href = '/';
                else
                    alert('Error to register the score. Try again...');
            }
        });
    }
    */
};

var audioMusic1 = new Audio("audio/MyFavoriteWayBlackDrawingChalks." + extension);
audioMusic1.volume = 0.2;
audioMusic1.loop = true;

var audioMusic2 = new Audio("audio/SwallowBlackDrawingChalks." + extension);
audioMusic2.volume = 0.2;
audioMusic2.loop = true;

if (navigator.userAgent.match(/(safari)/i))
    extension = 'wav';

var audioShot = new Audio("audio/laser." + extension);
audioShot.volume = 0.5;

var audioExplosion = new Audio("audio/explosion." + extension);
audioExplosion.volume = 0.5;