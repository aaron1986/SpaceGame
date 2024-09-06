window.addEventListener('load', function() {
    //canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1768;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', event => {
                if((
                    (event.key === 'ArrowUp') ||
                (event.key === 'ArrowDown')

                ) && this.game.keys.indexOf(event.key) === -1) {
                    this.game.keys.push(event.key);
                }
                else if(event.key === ' ') {
                    this.game.player.shootTop();
                }
                console.log(event.key);
            });
            window.addEventListener('keyup', event => {
                if(this.game.keys.indexOf(event.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
                }
            });
        }

    }

    class Projectile {
        constructor(game, x , y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }

        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 0.8) {
                this.markedForDeletion = true;
            }
        }

        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Particle {

    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 118;
            this.height = 80;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectile = [];
            this.image = document.getElementById('player');
        }
        update() {
            if(this.game.keys.includes('ArrowUp')) {
                this.speedY = -this.maxSpeed;
            } else if(this.game.keys.includes('ArrowDown')) {
                this.speedY = this.maxSpeed;
            } else {
                this.speedY = 0;
            }
            this.y += this.speedY;
            for(let i =0; i < this.projectile.length; i++) {
                this.projectile[i].update();
            }
            this.projectile = this.projectile.filter(projectile => !projectile.markedForDeletion);
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            for(let i = 0; i < this.projectile.length; i++) {
                this.projectile[i].draw(context);
            }
        }

        shootTop() {
            if(this.game.ammo > 0) {
                this.projectile.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            }
        }
        }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
        }

        update() {
            this.x += this.speedX;
            if(this.x + this.width < 0) {
                this.markedForDeletion = true;
            }
        }

        draw(context) {
            context.fillStyle = "red";
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = "black";
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    
    }

    class Enemy2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }

    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }    
        update() {
            this.x -= this.game.speed * this.speedModifier;
            if(this.x <= -this.width) { 
                this.x = 0;
            }
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            
            this.layer1 = new Layer(this.game, this.image1, 1);
            this.layer2 = new Layer(this.game, this.image2, 1);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1);

            this.layers = [this.layer1, this.layer2, this.layer3, this.layer4];
        }

        update() {
            for(let i = 0; i < this.layers.length; i++) {
                this.layers[i].update();
            }
        }

        draw(context) {
            for(let i = 0; i < this.layers.length; i++) {
                this.layers[i].draw(context);
            }
        }

    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontsize = 25;
            this.fontfamily = "Helvetica";
            this.colour = "white";
        }

        draw(context) {
            context.fillStyle = this.colour;
            //score
            context.font = this.fontsize + 'px' + this.fontfamily;
            context.fillText('Score: ' + this.game.score, 20, 40);
            //Ammo
            for(let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i,50,3,20);
            }

            //Timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText("Timer: " + formattedTime, 20, 100);

            //Game Over
            if(this.game.gameOver) {
                context.textAlign = "center";
                let message1;
                if(this.game.score > this.game.winningScore) {
                    message1 = "You Win!";
                } else {
                    message1 = "You Lose!";
                }
                context.font = "50px " + this.fontfamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);
            }
        }

    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 45;
            this.gameTime = 0;
            this.gameLimit = 5000;
            this.background = new Background(this);
            this.speed = 1;
        }
        update(deltaTime) {
            if(!this.gameOver) {
                this.gameTime += deltaTime;
                if(this.gameTime > this.gameLimit) {
                    this.gameOver = true;
                }
            }
            this.background.update();
            this.player.update();
            this.ammoTimer += deltaTime;
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) {
                    this.ammo++;
                    this.ammoTimer = 0;
                } 
            }
            for(let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].update();
                if(this.checkCollisions(this.player, this.enemies[i])) {
                    this.enemies[i].markedForDeletion = true;
                }
                 for(let j = 0; j < this.player.projectile.length; j++) {
                    const projectile = this.player.projectile[j];
                    if (this.checkCollisions(projectile, this.enemies[i])) {
                        this.enemies[i].lives--;
                        projectile.markedForDeletion = true;
                        if(this.enemies[i].lives <= 0) {
                            this.enemies[i].markedForDeletion = true;
                            if(!this.gameOver) {
                                this.score += this.enemies[i].score
                            }
                            if(this.score > this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                } 
            }

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

            this.enemyTimer += deltaTime;
            if(this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            }
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            for(let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].draw(context);
            }
        }
        addEnemy() {
            this.enemies.push(new Enemy2(this));
        }

        checkCollisions(rect1, rect2) {
            return (                
                rect1.x < rect2.x + rect2.width && 
                rect1.x + rect1.width > rect2.x && 
                rect1.y < rect2.y + rect2.height && 
                rect1.height + rect1.y > rect2.y
            )
        }
      }

      const game = new Game(canvas.width, canvas.height);
      let lastTime = 0;
      function animation(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animation);
      }

      animation(0);
});