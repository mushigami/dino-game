export class Player extends Phaser.Physics.Arcade.Sprite{
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x:number, y:number){
        super(scene, x, y, "dino-idle");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.init();
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update,this)
    }

    init():void{
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        console.log(this.cursors)

        this
            .setOrigin(0,1)
            .setGravityY(5000)
            .setCollideWorldBounds(true)
            .setBodySize(44,92);
    }

    update(...args: any[]): void {
        const {space} = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space); // in order dino to fall down again
        const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor(); // casting arcade.body to staticbody (strange that it's static when created)
        if(isSpaceJustDown && onFloor){
            this.setVelocityY(-1600);
        }        
    }
}