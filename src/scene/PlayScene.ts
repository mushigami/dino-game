import Phaser from "phaser";
import { GameScene } from "./GameScene";
import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";
import { PRELOAD_CONFIG } from "..";


class PlayScene extends GameScene {
    player: Player;
    ground: Phaser.GameObjects.TileSprite;
    startTrigger: SpriteWithDynamicBody;

    spawnInterval: number = 1500;
    spawnTime: number = 0;
    gameSpeed: number = 10;

    obstacles: Phaser.Physics.Arcade.Group;

    gameOverContainer: Phaser.GameObjects.Container;
    gameOverText: Phaser.GameObjects.Image;
    restartText: Phaser.GameObjects.Image;

    constructor() {
        //debugger
        super("PlayScene")
    }

    create() {
        this.createEnvironment();
        this.createPlayer();
        this.createObstacles();
        this.createGameOverContainer();
        this.createAnimations();

        this.handleGameStart();
        this.handleObstacleCollision();
        this.handleGameRestart();
    }
    createAnimations() {
        this.anims.create({
            key:'enemy-bird-fly',
            frames: this.anims.generateFrameNumbers('enemy-bird'),
            frameRate: 6,
            repeat: -1,
        })
    }
    handleGameRestart() {

        this.restartText.on("pointerup", () => {
            this.physics.resume();
            this.player.setVelocityY(0);
            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.anims.resumeAll();
            this.isGameRunning = true;

        })
    }
    handleObstacleCollision() {
        this.physics.add.collider(this.obstacles, this.player, () => {
            this.isGameRunning = false;
            this.physics.pause();
            this.player.die();
            this.spawnTime = 0;
            this.gameSpeed = 5;
            this.gameOverContainer.setAlpha(1);
        })
    }
    handleGameStart() {
        this.startTrigger = this.physics.add.sprite(0, 10, null)
            .setOrigin(0, 1)
            .setAlpha(0);

        this.physics.add.overlap(this.startTrigger, this.player, () => { // trigger collision
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
                    this.player.setVelocityX(80)
                    this.ground.width += 20;
                    if (this.ground.width >= this.gameWidth) {
                        rollOutEvent.remove();
                        this.ground.width = this.gameWidth // to cut the overflown ground
                        this.player.setVelocityX(0);
                        this.isGameRunning = true;
                    }

                }
            })
        })
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

    update(time: number, delta: number): void {
        if (!this.isGameRunning) { return }
        this.spawnTime += delta;
        if (this.spawnTime >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTime = 0;
        }
        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed)
        this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody) => {
            if (obstacle.getBounds().right < 0) {
                this.obstacles.remove(obstacle);
            }
        });
        this.ground.tilePositionX += this.gameSpeed
    }

    createEnvironment() {
        this.ground = this.add
            .tileSprite(0, this.gameHeight, 88, 26, 'ground')
            .setOrigin(0, 1);
    }
    createPlayer() {
        this.player = new Player(this, 0, this.gameHeight);
    }

    spawnObstacle() {
        const obstalesCount = PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount;
        //const obstacleNum = Math.floor(Math.random() * obstalesCount + 1);
        const obstacleNum = 7;
        const distance = Phaser.Math.Between(600, 900);
        let obstacle;

        if(obstacleNum > PRELOAD_CONFIG.cactusesCount){
            const enemyPossibleHeight = [20, 70];
            const enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)]
            obstacle = this.obstacles.create(distance, this.gameHeight-enemyHeight, `enemy-bird`);
            obstacle.play('enemy-bird-fly', true);
        }
        else{
            obstacle = this.obstacles
                .create(distance, this.gameHeight, `obstacle-${obstacleNum}`)
         
        }
        obstacle                
            .setOrigin(0, 1)
            .setImmovable();


    }


}

export default PlayScene;