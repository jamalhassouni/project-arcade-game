/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
/*jshint -W030 */
var Engine = (function (global) {
    "use strict";
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    var currentGameState = "startGame";

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        //reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        // Credit https://discussions.udacity.com/t/finite-state-machine-to-model-game-states/21955
        // for Finite State Machine
        // Change game behavior according to game state
        switch (currentGameState) {
            case "startGame":
                // Turn the keypress event listener in app.js off
                document.removeEventListener("keyup", input);
                // Listen for enter key, switch game state to inGame when pressed
                // Credit http://stackoverflow.com/questions/14542062/eventlistener-enter-key
                var startInput = function (e) {
                    // Use e.which or e.keyCode for browser compatibility
                    var key = e.which || e.keyCode;
                    // Enter key changes game state to "inGame"
                    if (key === 13) {
                        currentGameState = "inGame";
                    }
                };
                document.addEventListener("keydown", startInput);
                break;
                // Here we do the "normal" things we'd do when the game is running, mainly updateEntities
            case "inGame":
                // Turn the keypress event listener in app.js back on
                document.addEventListener('keyup', input);
                // Call updateEntities to update each entity in the game
                updateEntities(dt);
                // Fix player head staying rendered behind top tiles
                // Credit to https://discussions.udacity.com/t/canvas-not-clearing-player-bug-fixed/29714
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                break;
            case "gameOver":
                // Turn the keypress event listener in app.js off
                document.removeEventListener('keyup', input);
                // Listen for enter key, switch game state to inGame when pressed
                var gameoverInput = function (e) {
                    var key = e.which || e.keyCode;
                    if (key === 13) {
                        currentGameState = "inGame";
                    }
                };
                document.addEventListener("keydown", gameoverInput);
                break;
        }
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        player.update();
        gem.update();
        heart.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        // Render different game states according to each case
        switch (currentGameState) {
            case "startGame":
                // Display an empty game board with text here
                var rowImages = [
                        'images/water-block.png', // Top row is water
                        'images/stone-block.png', // Row 1 of 3 of stone
                        'images/stone-block.png', // Row 2 of 3 of stone
                        'images/stone-block.png', // Row 3 of 3 of stone
                        'images/grass-block.png', // Row 1 of 2 of grass
                        'images/grass-block.png' // Row 2 of 2 of grass
                    ],
                    numRows = 6,
                    numCols = 5,
                    row, col;

                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                        // Text to display over the game board
                        ctx.fillStyle = "#ff7675";
                        ctx.font = "40px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Let's Play Frogger!", canvas.width / 2, canvas.height / 5.5);
                        ctx.fillStyle = "#2d3436";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Press Enter To Start", canvas.width / 2, canvas.height / 2.1);

                    }
                }
                break;
            case "inGame":
                // Draw the actual game board here, plus renderEntities so we have a game
                /* This array holds the relative URL to the image used
                 * for that particular row of the game level.
                 */
                rowImages = [
                        'images/water-block.png', // Top row is water
                        'images/stone-block.png', // Row 1 of 3 of stone
                        'images/stone-block.png', // Row 2 of 3 of stone
                        'images/stone-block.png', // Row 3 of 3 of stone
                        'images/grass-block.png', // Row 1 of 2 of grass
                        'images/grass-block.png' // Row 2 of 2 of grass
                    ],
                    numRows = 6,
                    numCols = 5;

                /* Loop through the number of rows and columns we've defined above
                 * and, using the rowImages array, draw the correct image for that
                 * portion of the "grid"
                 */
                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        /* The drawImage function of the canvas' context element
                         * requires 3 parameters: the image to draw, the x coordinate
                         * to start drawing and the y coordinate to start drawing.
                         * We're using our Resources helpers to refer to our images
                         * so that we get the benefits of caching these images, since
                         * we're using them over and over.
                         */
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                    }
                }
                renderEntities();
                break;
            case "gameOver":
                // Display an empty game board with text here
                rowImages = [
                        'images/water-block.png', // Top row is water
                        'images/stone-block.png', // Row 1 of 3 of stone
                        'images/stone-block.png', // Row 2 of 3 of stone
                        'images/stone-block.png', // Row 3 of 3 of stone
                        'images/grass-block.png', // Row 1 of 2 of grass
                        'images/grass-block.png' // Row 2 of 2 of grass
                    ],
                    numRows = 6,
                    numCols = 5;

                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                        // Text to display over the game board
                        ctx.fillStyle = "#ff7675";
                        ctx.font = "40px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 3);
                        ctx.fillStyle = "#ff7675";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Press Enter To Restart", canvas.width / 2, canvas.height / 2.6);
                    }
                }
                break;
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function (enemy) {
            enemy.render();
        });

        player.render();
        gem.render();
        heart.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    //Reset the game to its original state and change currentGameState to gameOver
    function reset() {
        var audio = new Audio('audio/gameover.mp3');
        audio.play();
        currentGameState = "gameOver";
        player.characterReset();
        heart.heartReset();
        clearTimeout(heart.heartWaitTime);
        gem.gemReset();
        clearTimeout(gem.gemWaitTime);
        speedMultiplier = 40;
        player.playerScore = 0;
        player.playerLives = 3;
        allEnemies = [];
        //Instantiate all enemies, set to 3
        for (var i = 0; i < 3; i++) {
            //startSpeed is a random number from 1-10 times speedMultiplier
            var startSpeed = speedMultiplier * Math.floor(Math.random() * 10 + 1);
            //enemys start off canvas (x = -100) at the following Y positions: 60, 145, 230
            allEnemies.push(new Enemy(-100, 60 + (85 * i), startSpeed));
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-cat-girl.png',
        'images/char-boy.png',
        'images/char-princess-girl.png',
        'images/Gem_Orange.png',
        'images/Heart.png',
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object and the reset function to the global
     * variable (the window object when run in a browser) so that developer's
     * can use it more easily from within their app.js files.
     */
    global.ctx = ctx;
    global.reset = reset;

})(this);