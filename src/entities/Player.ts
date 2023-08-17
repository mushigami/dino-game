import { GameScene } from "../scene/GameScene";

export class Player extends Phaser.Physics.Arcade.Sprite{
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    scene: GameScene;

    constructor(scene: GameScene, x:number, y:number){
        super(scene, x, y, "dino-run"); // first frame from the run animation will be imported
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.init();
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update,this)
    }

    init():void{
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this
            .setOrigin(0,1)
            .setGravityY(5000)
            .setCollideWorldBounds(true)
            .setBodySize(44,92)
            .setOffset(20,0)
            .setDepth(1);

        this.registerAnimations();
    }

    update(...args: any[]): void {
        const {space, down} = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space); // in order dino to fall down again
        const isDownJustDown = Phaser.Input.Keyboard.JustDown(down); 
        const isDownJustUp = Phaser.Input.Keyboard.JustUp(down); 


        const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor(); // casting arcade.body to staticbody (strange that it's static when created)

        if(isSpaceJustDown && onFloor){
            this.setVelocityY(-1600);
        }

        if(isDownJustDown && onFloor){
            this.body.setSize(this.body.width, 58)
                .setOffset(60, 34);
        }

        if(isDownJustUp && onFloor){
            this.body.setSize(44, 92)
                .setOffset(20, 0);
        }

        if(!this.scene.isGameRunning){// at first not available from Player, as this.scene refers to Phaser.scene and not PlayScene
            return; // to prevent running animation at the beginning.
        } 
        if(this.body.deltaAbsY() > 0){
            this.anims.stop();
            this.setTexture("dino-run", 0);
        }else{
            this.playRunAnimation();
        }        
    }

    playRunAnimation(){
        this.body.height <= 58 ? this.play("dino-down", true) : this.play("dino-run", true);
    }

    registerAnimations(){
        this.anims.create(
            {
                key: "dino-run",
                frames: this.anims.generateFrameNames("dino-run", {start:2, end:3}),
                frameRate: 10,
                repeat:-1,
            }
        )

        this.anims.create(
            {
                key: "dino-down",
                frames: this.anims.generateFrameNames("dino-down"),
                frameRate: 10,
                repeat:-1,
            }
        )
    }

    die() {
        this.anims.pause();
        this.setTexture("dino-hurt")
        
    }
}