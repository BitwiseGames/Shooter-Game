    var leftKey, rightKey, downKey, upKey, spaceKey = false; //for movement and shooting
    var player = new createjs.Shape();
    var velocity = new createjs.Point(0, 0);
    var stage = new createjs.Stage("gameCanvas");
    const PLAYER_WIDTH = 50;
    const PLAYER_HEIGHT = 75;

    //create background image
    var background = new createjs.Bitmap("star_field_3.png");

    var gameScore = 0;
    var gameRunning;

    var buffTime = 600; //after 10 seconds, there is a chance that a buff will appear
    var buffs = [];

    //for shooting bullets
    var shotCoolDown = 0;
    var maxCoolDown = 15;
    var bullets = [];

    //the squares on the top and bottom of the screen
    var debris = [];
    const DEBRIS_SIZE = 50;
    const MAX_DEBRIS = stage.canvas.width / DEBRIS_SIZE; //the max that will fit horizontally on the screen

    var enemies = [];
    const MAX_ENEMIES = 5;

    var healthBar;

    var scoreBox = new createjs.Text("Score: ", "40px TlwgMono", "white");

    function startGame() {

      stage.removeAllChildren(); //get rid of the start button and background

      stage.addChild(background);

      /*healthBar.graphics.beginStroke("white");
      healthBar.graphics.beginFill("red");
      healthBar.graphics.drawRect(0, 0, 300, 30);*/

      scoreBox.x = 325;
      stage.addChild(scoreBox);

      //create player
      player.graphics.beginFill("#C9c9c9");
      player.graphics.moveTo(0, 0);
      player.graphics.lineTo(25, -75);
      player.graphics.lineTo(50, 0);
      player.x = stage.canvas.width / 2;
      player.y = stage.canvas.height;
      player.health = 10; //create the property "health" on the player
      player.speed = .3;
      stage.addChild(player);

      createjs.Ticker.setFPS(60); //set stage fps to 60
      createjs.Ticker.addEventListener("tick", mainLoop); //stage will clear and redraw every tick

      window.onkeydown = pressKey;
      window.onkeyup = releaseKey;


      //create the debris
      for (i = 0; i < MAX_DEBRIS * 2; i++) { //multiply by 2 b/c there's debris on left and right
        if (Math.random() < .75) { //leave some holes in the debris
          createDebris(i * DEBRIS_SIZE);
        }
      }

      for (i = 0; i < MAX_ENEMIES; i++) {
        createEnemy();
      }

      gameRunning = true;
    }

    //this gets called every frame
    function mainLoop(e) {
      if (gameRunning == true) {
        updatePlayer();
        bulletMove();
        updateDebris();
        updateEnemies();
        collisions();
        updateBuffs();
        updateHUD();
        stage.update();
      }
    }

    function updateBuffs() {
      buffTime--;
      if (buffTime <= 0) {
        if (Math.random() > .5) {
          var g = new createjs.Graphics();
          var buff = new createjs.Shape(g);
          g.beginFill("#FF00CC"); //hot pink!
          g.drawRect(0, 0, 50, 50);
          buff.x = randomRange(130, 500);
          buff.y = -50;
          stage.addChild(buff);
          buffs.push(buff);
          buffTime = 600;
        }
      }
      for (i = 0; i < buffs.length; i++) {
        buffs[i].y += 5;
        if (buffs[i].y + 50 < 0) { //50 is width
          stage.removeChild(buffs[i]);
          buffs.splice(i, 1);
        }
      }
    }

    function createEnemy() {
      var g = new createjs.Graphics();
      var enemy = new createjs.Shape(g);
      enemy.x = randomRange(130, 500); //spawn it between the debris
      enemy.y = randomRange(-30, -50);
      var randomNumber = Math.random();
      if (randomNumber > 0 && randomNumber <= .25) {
        g.beginFill("red");
        g.drawCircle(0, 0, 30);
        enemy.radius = 30;
        enemy.speed = 3;
        enemy.health = 1;
        enemy.scoreGiven = 10;
      } else if (randomNumber > .25 && randomNumber <= .5) {
        g.beginFill("rgba(0,0,25,25"); //he's almost invisible!
        g.drawCircle(0, 0, 40);
        enemy.radius = 40;
        enemy.speed = 1;
        enemy.health = 2;
        enemy.scoreGiven = 15;
      } else if (randomNumber > .5 && randomNumber <= .75) {
        g.beginFill("green");
        g.drawCircle(0, 0, 35);
        enemy.radius = 35;
        enemy.speed = 2;
        enemy.health = 2;
        enemy.scoreGiven = 10;
      } else {
        g.beginFill("pink");
        g.drawCircle(0, 0, 20);
        enemy.radius = 20;
        enemy.speed = 5;
        enemy.health = 1;
        enemy.scoreGiven = 20;
      }
      enemies.push(enemy);
      stage.addChild(enemy);
    }

    function createDebris(Y) {
      var g = new createjs.Graphics();
      g.beginFill("#999999");
      g.drawRect(0, 0, DEBRIS_SIZE, DEBRIS_SIZE);

      var d = new createjs.Shape(g);
      d.y = Y;
      //put it either on top or bottom
      d.x = 0;
      if (Math.random() > .5) {
        d.x = 550;
      }

      debris.push(d);
      stage.addChild(d);
    }

    function updateHUD() {
      stage.removeChild(healthBar); //remove the old one
      healthBar = new createjs.Shape(); //recreate it
      var length = 30 * player.health; //edit it
      var red = 255 - 25 * player.health;
      var green = 25 * player.health;
      var color = "rgba(" + red + "," + green + ",0,255)";
      healthBar.graphics.beginFill(color);
      healthBar.graphics.drawRect(10, 10, length, 30);
      stage.addChild(healthBar); //add the new one

      scoreBox.text = "Score: " + gameScore;
    }

    function updatePlayer() {
      playerMove();
      playerShoot();
    }

    function playerShoot() {
      shotCoolDown--;
      if (spaceKey) {
        if (shotCoolDown <= 0) {
          shotCoolDown = maxCoolDown;
          //create and draw the bullet
          var g = new createjs.Graphics();
          g.beginFill("White");
          g.drawCircle(0, 0, 3);

          var bullet = new createjs.Shape(g)

          bullet.x = player.x + PLAYER_WIDTH / 2;
          bullet.y = player.y;

          bullets.push(bullet);
          stage.addChild(bullet);
        }
      }
    }

    function playerMove() {
      if (leftKey) velocity.x -= player.speed;
      else if (rightKey) velocity.x += player.speed;
      if (upKey) velocity.y -= player.speed;
      else if (downKey) velocity.y += player.speed;

      var newX = velocity.x + player.x;
      var newY = velocity.y + player.y;

      if (newX + PLAYER_WIDTH > stage.canvas.width) {
        velocity.x = 0;
        newX = (stage.canvas.width - PLAYER_WIDTH)
      } else if (player.x < 0) {
        velocity.x = 0;
        newX = 0;
      }
      if (newY > stage.canvas.height) {
        velocity.y = 0;
        newY = (stage.canvas.height)
      } else if (newY - PLAYER_HEIGHT < 0) {
        velocity.y = 0;
        newY = 0 + PLAYER_HEIGHT;
      }

      player.x = newX;
      player.y = newY;

    }

    function updateEnemies() {
      for (i = 0; i < enemies.length; i++) {
        enemies[i].y += enemies[i].speed;
        if (enemies[i].y + enemies[i].radius > stage.canvas.height) {
          stage.removeChild(enemies[i]);
          enemies.splice(i, 1);
          console.log("Deleting enemy.");
          createEnemy();
        }
      }
    }

    function updateDebris() {
      for (i = 0; i < debris.length; i++) {
        debris[i].y += 1;
        if (debris[i].y > stage.canvas.height) {
          debris[i].y = -50
        }
      }
    }

    function bulletMove() {
      for (i = 0; i < bullets.length; i++) {
        bullets[i].y -= 20; //move them forward

        //check if they're off the screen
        if (bullets[i].y < 0) {
          stage.removeChild(bullets[i]);
          bullets.splice(i, 1);
        }
      }
    }

    function collisions() {
      playerDebrisCollision(); //player and debris
      bulletDebrisCollision(); //bullets vs debris collisions
      bulletEnemyCollisions(); //player shot the enemy?
      playerEnemyCollisions();
      bulletBuffsCollisions();
    }

    function playerDebrisCollision() {
      for (i = 0; i < debris.length; i++) {

        var dx = debris[i].x;
        var dy = debris[i].y;

        var px = player.x;
        var py = player.y - PLAYER_HEIGHT; //we want it to be in the top left corner

        if (AABB(px, py, PLAYER_WIDTH / 2, PLAYER_HEIGHT, dx, dy, DEBRIS_SIZE, DEBRIS_SIZE)) {
          stage.removeChild(debris[i]);
          debris.splice(i, 1);
          player.health -= 1;
          if (player.health <= 0) {
            gameOver();
          }
        }
      }
    }

    function bulletDebrisCollision() {
      for (i = 0; i < bullets.length; i++) {
        for (j = 0; j < debris.length; j++) {
          var bx = bullets[i].x;
          var by = bullets[i].y;
          var bulletSize = 3;

          var dx = debris[j].x;
          var dy = debris[j].y;

          //check if the bullets are hitting the debris
          if (AABB(bx, by, bulletSize, bulletSize, dx, dy, DEBRIS_SIZE, DEBRIS_SIZE)) {
            //if there's a collision, remove both the bullet and the debris
            //unless the player has a powerup!
            stage.removeChild(debris[j]);
            debris.splice(j, 1);
            stage.removeChild(bullets[i]);
            bullets.splice(i, 1);

            //create a new debris to replace the destroyed one
            //spawn it exactly 800 pixels right of where the old one was
            createDebris(800 + dx); //this ensures we don't get lots of blocks on top of each other
            break;
          }
        }
      }
    }

    function bulletEnemyCollisions() {
      for (i = 0; i < bullets.length; i++) {
        for (j = 0; j < enemies.length; j++) {
          var bx = bullets[i].x;
          var by = bullets[i].y;
          var bulletSize = 3;

          var ex = enemies[j].x;
          var ey = enemies[j].y;

          if (circleCollisions(bx, by, bulletSize, ex, ey, enemies[i].radius)) {
            enemies[j].health--;
            if (enemies[j].health <= 0) {
              gameScore += enemies[j].scoreGiven;
              stage.removeChild(enemies[j]);
              enemies.splice(j, 1);
              createEnemy();
            }
            stage.removeChild(bullets[i]);
            bullets.splice(i, 1);
            break;
          }
        }
      }
    }

    function bulletBuffsCollisions() {
      for (i = 0; i < bullets.length; i++) {
        for (j = 0; j < buffs.length; j++) {
          var bx = bullets[i].x;
          var by = bullets[i].y;
          var bulletSize = 3;

          if (AABB(bx, by, bulletSize, bulletSize, buffs[j].x, buffs[j].y, 50, 50)) { //buffs are 50x50
            stage.removeChild(bullets[i]);
            bullets.splice(i, 1);
            stage.removeChild(buffs[j]);
            buffs.splice(j, 1);

            //add to players health
            player.health++;
            if (player.health > 10) {
              player.health = 10;
            }
            break;
          }
        }
      }
    }

    function playerEnemyCollisions() {
      for (i = 0; i < enemies.length; i++) {
        if (circleCollisions(player.x, player.y, PLAYER_WIDTH, enemies[i].x, enemies[i].y, enemies[i].radius / 2)) {
          //delete the enemy straight away, but don't give points
          stage.removeChild(enemies[i]);
          enemies.splice(i, 1);
          //player takes damage
          player.health--;
          if (player.health <= 0) {
            gameOver();
          }
          createEnemy();
        }
      }
    }

    function gameOver() {

      gameRunning = false;

      stage.removeAllChildren(); //clear the screen

      bullets.length = 0; //remove everything from the arrays
      buffs.length = 0;
      enemies.length = 0;
      debris.length = 0;

      //i could just remove all of them except this one, but it's easier to do it this way
      stage.addChild(background);

      var gameOverText = new createjs.Text("GAME OVER", "bold 100px TlwgMono", "white");
      gameOverText.x = 30;
      gameOverText.y = 100;
      stage.addChild(gameOverText);

      var scoreText = new createjs.Text("Final score:" + gameScore, "50px TlwgMono", "white");
      scoreText.x = 50;
      scoreText.y = 200;
      stage.addChild(scoreText);

      var restartText = new createjs.Text("Restart?", "50px TlwgMono", "white");
      restartText.x = 200;
      restartText.y = 400;
      stage.addChild(restartText);

      gameScore = 0; //have to do this after we create the scoretext box

      leftKey = rightKey = downKey = upKey = spaceKey = false

      restartText.addEventListener("click", startGame);

    }

    function pressKey(e) {
      switch (e.keyCode) {
        case 65: leftKey = true; break; //65 is A key
        case 68: rightKey = true; break; //65 is D key
        case 83: downKey = true; break; //83 is S key
        case 87: upKey = true; break; //65 is W key
        case 32: spaceKey = true; break; //32 is space
      }
    }

    function releaseKey(e) {
      switch (e.keyCode) {
        case 65: leftKey = false; break; //65 is A key
        case 68: rightKey = false; break; //65 is D key
        case 83: downKey = false; break; //83 is S key
        case 87: upKey = false; break; //65 is W key
        case 32: spaceKey = false; break; //32 is space
      }
    }

    function randomRange(MIN, MAX) {
      return MIN + (Math.random() * (MAX - MIN + 1));
    }

    function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
      if ((x1 <= x2 + w2) && (x1 + w1 >= x2)) {
        if ((y1 <= y2 + h2) && (y1 + h1 >= y2)) {
          return true;
        }
      }
      return false;
    }

    //pixel perfect circle collisions!
    function circleCollisions(x1, y1, r1, x2, y2, r2) {
      var radiiSum = r1 + r2;
      var dx = (x1 - x2) * (x1 - x2);
      var dy = (y1 - y2) * (y1 - y2);
      var distance = Math.sqrt(dx + dy);
      return radiiSum > distance;
    }
