/*----------------------------------------------------------------------------*/
/*-----------------------------Modal function Start------------------------------------------*/
(function () {
    "use strict";
    /* Opening modal window function */
    function openModal() {
        /* Get trigger element */
        var modalTrigger = document.getElementsByClassName('jsModalTrigger'),
            modalWindow = document.getElementById("jsModal");
        modalWindow.classList ? modalWindow.classList.add('open') : modalWindow.className += ' ' + 'open';
    }

    function closeModal() {
        /* Get close button */
        var closeButton = document.getElementsByClassName('jsModalClose'),
            closeOverlay = document.getElementsByClassName('jsOverlay'),
            i;

        /* Set onclick event handler for close buttons */
        for (i = 0; i < closeButton.length; i++) {
            closeButton[i].onclick = function () {
                var modalWindow = this.parentNode.parentNode;

                modalWindow.classList ? modalWindow.classList.remove('open') : modalWindow.className = modalWindow.className.replace(new RegExp('(^|\\b)' + 'open'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }

        /* Set onclick event handler for modal overlay */
        for (i = 0; i < closeOverlay.length; i++) {
            closeOverlay[i].onclick = function () {
                var modalWindow = this.parentNode;

                modalWindow.classList ? modalWindow.classList.remove('open') : modalWindow.className = modalWindow.className.replace(new RegExp('(^|\\b)' + 'open'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }

    }
    // function to select player and store player in localStorage
    function selectPlayer() {
        var PicE = document.getElementsByClassName('Pic'),
            i;

        /* Set onclick event handler for all trigger elements */
        for (i = 0; i < PicE.length; i++) {
            PicE[i].onclick = function () {

                // get src of image
                var target = this.getAttribute("src");
                // store player
                localStorage.setItem("PlayerPic", target);
                // hide modal
                document.getElementById("jsModal").remove('open');


            }
        }

    }


    /* Handling domready event IE9+ */
    function ready(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    /* Triggering modal window function after dom ready */
    ready(openModal);
    ready(closeModal);
    ready(selectPlayer);
}());

/*----------------------------------------------------------------------------*/
/*-----------------------------Enemy Object Start------------------------------------------*/
// Enemies our player must avoid
var Enemy = function (x, y, speed) {
    "use strict";
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x;
    this.y = y;
    this.speed = speed;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    "use strict";
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + this.speed * dt;
    // Reset the enemy with a new speed after it goes off screen
    this.offScreenX = 505;
    this.startingX = -100;
    if (this.x >= this.offScreenX) {
        this.x = this.startingX;
        this.randomSpeed();
    }
    this.checkCollision();
};
// Speed Multiplier, we increase this value to increase difficulty
// Tried making this a property of enemy, didn't work
var speedMultiplier = 40;

// Random speed generator
Enemy.prototype.randomSpeed = function () {
    "use strict";
    // Speed is a random number from 1-10 times speedMultiplier
    this.speed = speedMultiplier * Math.floor(Math.random() * 10 + 1);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.fillStyle = "white";
    ctx.font = "16px Comic Sans MS";
    ctx.fillText("Score: " + player.playerScore, 40, 70);
    ctx.fillText("Lives: " + player.playerLives, 141, 70);
    ctx.fillText("Difficulty: " + speedMultiplier, 260, 70);
};
// Check for collision. Borrowed from
// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
Enemy.prototype.checkCollision = function () {
    "use strict";
    // Set hitboxes for collision detection
    var playerBox = {
        x: player.x,
        y: player.y,
        width: 50,
        height: 40
    };
    var enemyBox = {
        x: this.x,
        y: this.y,
        width: 60,
        height: 70
    };
    // Check for collisions, if playerBox intersects enemyBox, we have one
    if (playerBox.x < enemyBox.x + enemyBox.width &&
        playerBox.x + playerBox.width > enemyBox.x &&
        playerBox.y < enemyBox.y + enemyBox.height &&
        playerBox.height + playerBox.y > enemyBox.y) {
        // Collision detected, call collisionDetected function
        this.collisionDetected();
        var audio = new Audio('audio/error.mp3');
        audio.play();
    }
};
// Collision detected, decrement playerLives and reset the player
Enemy.prototype.collisionDetected = function () {
    "use strict";
    player.playerLives -= 1;
    player.characterReset();
};

/*----------------------------------------------------------------------------*/
/*--------------------------------Gem Object Start -----------------------------------------*/

// Gems the player should try to pick up
var Gem = function (x, y) {
    "use strict";
    this.x = x;
    this.y = y;
    this.sprite = 'images/Gem_Orange.png';
    this.gemWaitTime = undefined;
};
// Update gem, call checkCollision
Gem.prototype.update = function () {
    "use strict";
    this.checkCollision();
};
// Draw the gem to the screen
Gem.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
//Check for collision
Gem.prototype.checkCollision = function () {
    "use strict";
    // Set hitboxes for collision detection
    var playerBox = {
        x: player.x,
        y: player.y,
        width: 50,
        height: 40
    };
    var gemBox = {
        x: this.x,
        y: this.y,
        width: 60,
        height: 70
    };
    // Check for collisions, if playerBox intersects gemBox, we have one
    if (playerBox.x < gemBox.x + gemBox.width &&
        playerBox.x + playerBox.width > gemBox.x &&
        playerBox.y < gemBox.y + gemBox.height &&
        playerBox.height + playerBox.y > gemBox.y) {
        // Collision detected, call collisionDetected function
        this.collisionDetected();
        var audio = new Audio('audio/coin.mp3');
        audio.play();
    }
};
// Gem collision detected, hide the gem off canvas,
// Increase player score, wait 5 seconds, then reset the gem
Gem.prototype.collisionDetected = function () {
    "use strict";
    this.x = 900;
    this.y = 900;
    player.playerScore += 30;
    this.wait();
};
// Call setTimeout in a function so we can assign it to a variable
// Necessary for clearTimeout(gem.gemWaitTime) to work
Gem.prototype.wait = function () {
    this.gemWaitTime = setTimeout(function () {
        gem.gemReset(); // this.gemReset() doesn't work
    }, 5000);
};
// Reset the gem to a new location
Gem.prototype.gemReset = function () {
    "use strict";
    // Gems appear at one of the following x positions: 0, 101, 202, 303, 404
    this.x = (101 * Math.floor(Math.random() * 4) + 0);
    // Gems appear at one of the following Y positions: 60, 145, 230
    this.y = (60 + (85 * Math.floor(Math.random() * 3) + 0));
};

/*----------------------------------------------------------------------------*/
/*--------------------------------Heart Object Start ---------------------------------------*/

// Hearts the player should try to pick up
var Heart = function (x, y) {
    "use strict";
    this.x = x;
    this.y = y;
    this.sprite = 'images/Heart.png';
    this.heartWaitTime = undefined;
};
// Update heart, call checkCollision
Heart.prototype.update = function () {
    "use strict";
    this.checkCollision();
};
// Draw the heart to the screen
Heart.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// Check for collision
Heart.prototype.checkCollision = function () {
    "use strict";
    // Set hitboxes for collision detection
    var playerBox = {
        x: player.x,
        y: player.y,
        width: 50,
        height: 40
    };
    var heartBox = {
        x: this.x,
        y: this.y,
        width: 60,
        height: 70
    };
    // Check for collisions, if playerBox intersects heartBox, we have one
    if (playerBox.x < heartBox.x + heartBox.width &&
        playerBox.x + playerBox.width > heartBox.x &&
        playerBox.y < heartBox.y + heartBox.height &&
        playerBox.height + playerBox.y > heartBox.y) {
        // Collision detected, call collisionDetected function
        this.collisionDetected();
        var audio = new Audio('audio/coin_2.mp3');
        audio.play();
    }
};
// Heart collision detected, hide the heart off canvas,
// Increment player lives, wait 30 seconds, then reset the heart
Heart.prototype.collisionDetected = function () {
    "use strict";
    this.x = 900;
    this.y = 900;
    player.playerLives += 1;
    this.wait();
};
// Call setTimeout in a function so we can assign it to a variable
// Necessary for clearTimeout(heart.heartWaitTime) to work
Heart.prototype.wait = function () {
    this.heartWaitTime = setTimeout(function () {
        heart.heartReset(); // this.heartReset() doesn't work
    }, 30000);
};
// Reset the heart to a new location
Heart.prototype.heartReset = function () {
    "use strict";
    //Hearts appear at one of the following x positions: 0, 101, 202, 303, 404
    this.x = (101 * Math.floor(Math.random() * 4) + 0);
    //Hearts appear at one of the following Y positions: 70, 155, 240
    this.y = (70 + (85 * Math.floor(Math.random() * 3) + 0));
};

/*----------------------------------------------------------------------------*/
/*------------------------------Player Object Start ----------------------------------------*/
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
// Start the player at 200x by 400y
var Player = function () {
    "use strict";
    this.startingX = 200;
    this.startingY = 400;
    this.x = this.startingX;
    this.y = this.startingY;
    this.sprite = 'images/char-boy.png';
    this.playerScore = 0;
    this.playerLives = 3;
    console.log(this.sprite);
};
// Required method for game
// Check if playerLives is 0, if so call reset
Player.prototype.update = function () {
    "use strict";
    if (this.playerLives === 0) {
        // clearTimeout(heart.heartWaitTime);
        reset();
    }
};
// Resets the player position to the start position
Player.prototype.characterReset = function () {
    "use strict";
    this.startingX = 200;
    this.startingY = 400;
    this.x = this.startingX;
    this.y = this.startingY;
};
// Increase score and increase difficulty when player reaches top of water
Player.prototype.success = function () {
    var audio = new Audio('audio/success.mp3');
    audio.play();
    "use strict";
    this.playerScore += 20;
    speedMultiplier += 5;
    this.characterReset();
};
// Draw the player on the screen, required method for game
Player.prototype.render = function () {
    "use strict";
    // change sprite  when user select player
    this.sprite = localStorage.getItem("PlayerPic");
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// Move the player according to keys pressed
Player.prototype.handleInput = function (allowedKeys) {
    "use strict";
    switch (allowedKeys) {
        case "left":
            //check for wall, otherwise move left
            if (this.x > 0) {
                this.x -= 101;
            }
            break;
        case "right":
            //check for wall, otherwise move right
            if (this.x < 402) {
                this.x += 101;
            }
            break;
        case "up":
            //check if player reached top of water, if so call success function,
            // otherwise move up
            if (this.y < 0) {
                this.success();
            } else {
                this.y -= 83;
            }
            break;
        case "down":
            //check for bottom, otherwise move down
            if (this.y < 400) {
                this.y += 83;
            }
            break;
    }
};

/*----------------------------------------------------------------------------*/
/*-------------------------Instantiate Objects Start --------------------------------*/

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// Instantiate player
var player = new Player();
// Empty allEnemies array
var allEnemies = [];

// Instantiate all enemies, set to 3, push to allEnemies array
for (var i = 0; i < 3; i++) {
    //startSpeed is a random number from 1-10 times speedMultiplier
    var startSpeed = speedMultiplier * Math.floor(Math.random() * 10 + 1);
    //enemys start off canvas (x = -100) at the following Y positions: 60, 145, 230
    allEnemies.push(new Enemy(-100, 60 + (85 * i), startSpeed));
}
// Instantiate Gem
// Gems appear at one of the following x positions: 0, 101, 202, 303, 404
// And at one of the following Y positions: 60, 145, 230
var gem = new Gem(101 * Math.floor(Math.random() * 4) + 0, 60 +
    (85 * Math.floor(Math.random() * 3) + 0));
// Instantiate heart
// Hearts appear at one of the following x positions: 0, 101, 202, 303, 404
// And at one of the following Y positions: 70, 155, 240
var heart = new Heart(101 * Math.floor(Math.random() * 4) + 0, 70 +
    (85 * Math.floor(Math.random() * 3) + 0));

/*----------------------------------------------------------------------------*/
/*---------------------------Event Listener Start -----------------------------------*/

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
/* Re-written as a named function so we can use removeEventListener
 * during "startGame" and "gameOver." Before, the event listener was active
 * during those states, so pressing arrow keys changed the starting position
 * of the player when we switched to "inGame"
 * credit http://stackoverflow.com/questions/4950115/removeeventlistener-on-anonymous-functions-in-javascript
 */
var input = function (e) {
    "use strict";
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
};
document.addEventListener('keyup', input);