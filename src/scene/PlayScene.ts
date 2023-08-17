import Phaser from "phaser";
import { GameScene } from "./GameScene";
import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";
import { PRELOAD_CONFIG } from "..";

class PlayScene extends GameScene {
  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  startTrigger: SpriteWithDynamicBody;

  score: number = 0;
  scoreInterval: number = 100;
  scoreDeltaTime: number = 0;
  spawnInterval: number = 1500;
  spawnDeltaTime: number = 0;
  gameSpeed: number = 10;

  obstacles: Phaser.Physics.Arcade.Group;
  clouds: Phaser.GameObjects.Group;

  gameOverContainer: Phaser.GameObjects.Container;
  gameOverText: Phaser.GameObjects.Image;
  restartText: Phaser.GameObjects.Image;
  scoreText: Phaser.GameObjects.Text;

  constructor() {
    //debugger
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();
    this.createObstacles();
    this.createGameOverContainer();
    this.createAnimations();
    this.createScore();

    this.handleGameStart();
    this.handleObstacleCollision();
    this.handleGameRestart();
  }
  createAnimations() {
    this.anims.create({
      key: "enemy-bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird"),
      frameRate: 6,
      repeat: -1,
    });
  }

  createGameOverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add.image(0, 80, "restart").setInteractive();

    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([this.gameOverText, this.restartText])
      .setAlpha(0);
  }
  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createEnvironment() {
    this.ground = this.add
      .tileSprite(0, this.gameHeight, 88, 26, "ground")
      .setOrigin(0, 1);

    this.clouds = this.add.group()
    this.clouds = this.clouds.addMultiple([
        this.add.image(this.gameWidth /2 , 170, "cloud"),
        this.add.image(this.gameWidth - 80 , 80, "cloud"),
        this.add.image(this.gameWidth / 1.3 , 100, "cloud"),
    ]).setAlpha(0);
  }
  createPlayer() {
    this.player = new Player(this, 0, this.gameHeight);
  }

  createScore(){
    this.scoreText = this.add.text(this.gameWidth, 0, "00000",{
      fontSize: 30,
      fontFamily: "Arial",
      color: "#535353",
      resolution: 5,
    }).setOrigin(1,0).setAlpha(0);
  }

  spawnObstacle() {
    const obstalesCount =
      PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount;
    const obstacleNum = Math.floor(Math.random() * obstalesCount + 1);
    const distance = Phaser.Math.Between(100, 200);
    let obstacle;

    if (obstacleNum > PRELOAD_CONFIG.cactusesCount) {
      const enemyPossibleHeight = [20, 70];
      const enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)];
      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight - enemyHeight,
        `enemy-bird`
      );
      obstacle.play("enemy-bird-fly", true);
    } else {
      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight,
        `obstacle-${obstacleNum}`
      );
    }
    obstacle.setOrigin(0, 1).setImmovable();
  }
  handleGameRestart() {
    this.restartText.on("pointerup", () => {
      this.physics.resume();
      this.player.setVelocityY(0);
      this.obstacles.clear(true, true);
      this.gameOverContainer.setAlpha(0);
      this.anims.resumeAll();
      this.isGameRunning = true;
    });
  }
  handleObstacleCollision() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      this.isGameRunning = false;
      this.physics.pause();
      this.anims.pauseAll();
      this.player.die();
      this.spawnDeltaTime = 0;
      this.scoreDeltaTime = 0;
      this.score = 0;
      this.gameSpeed = 10;
      this.gameOverContainer.setAlpha(1);
    });
  }
  handleGameStart() {
    this.startTrigger = this.physics.add
      .sprite(0, 10, null)
      .setOrigin(0, 1)
      .setAlpha(0);

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      // trigger collision
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, this.gameHeight);
        return;
      } // trigger touched two times
      this.startTrigger.body.reset(9999, 9999); // triggered is moved away
      // role out the ground
      const rollOutEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callback: () => {
          this.player.playRunAnimation();
          this.player.setVelocityX(80);
          this.ground.width += 20;
          // game starts 
          if (this.ground.width >= this.gameWidth) {
            rollOutEvent.remove();
            this.ground.width = this.gameWidth; // to cut the overflown ground
            this.player.setVelocityX(0);
            this.clouds.setAlpha(1);
            this.scoreText.setAlpha(1);
            this.isGameRunning = true;
          }
        },
      });
    });
  }
  update(time: number, delta: number): void {
    if (!this.isGameRunning) {return;}
      this.spawnDeltaTime += delta;
      this.scoreDeltaTime += delta;

      if(this.scoreDeltaTime >= this.scoreInterval){
        this.score++;
        console.log(this.score);
        this.scoreDeltaTime = 0;
      }
    this.spawnDeltaTime += delta;
    if (this.spawnDeltaTime >= this.spawnInterval) {
      this.spawnObstacle();
      this.spawnDeltaTime = 0;
    }

    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
    Phaser.Actions.IncX(this.clouds.getChildren(), -0.5);

    // creates an array of numbers casted from string generated from a number
    const score = Array.from(String(this.score), Number);

    for(let i = 0; i < 5-String(this.score).length; i++){
      score.unshift(0);
    }

    // joins the array of string (numbers) into a string text
    this.scoreText.setText(score.join(""));

    // obstacles are out of screen -> delete
    this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody) => {
      if (obstacle.getBounds().right < 0) {
        this.obstacles.remove(obstacle);
      }
    });

    // clouds are out of screen -> recycle
    this.clouds.getChildren().forEach((cloud: SpriteWithDynamicBody) => {
        if (cloud.getBounds().right < 0) {
          cloud.x = this.gameWidth + 30;
        }
      });


    this.ground.tilePositionX += this.gameSpeed;
  }
}

export default PlayScene;
