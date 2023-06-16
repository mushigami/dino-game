import Phaser from "phaser";
import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";


class PlayScene extends Phaser.Scene{
    player : Player;
    ground : Phaser.GameObjects.TileSprite;
    startTrigger: SpriteWithDynamicBody;

    get gameHeight(){
        return this.game.config.height as number;
    }

    get gameWidth(){
        return this.game.config.width as number;
    }

    constructor(){
        super("PlayScene")
    }

    create(){
        this.createEnvironment();
        this.createPlayer();

        this.startTrigger = this.physics.add.sprite(0,10,null)
            .setOrigin(0,1)
            .setAlpha(0);
        this.physics.add.overlap(this.startTrigger, this.player, () =>{ // trigger collision
            if(this.startTrigger.y === 10){
                this.startTrigger.body.reset(0, this.gameHeight);
                return;
            } // trigger touched two times
            this.startTrigger.body.reset(9999, 9999); // triggered is moved away
            // role out the ground
            this.time.addEvent({
                delay: 1000/60,
                loop: true,
                callback:()=>{
                    if(this.ground.width < this.gameWidth)
                    this.ground.width += 10;
                }
            })
        })

        }
    createEnvironment(){
        this.ground = this.add
            .tileSprite(0,this.gameHeight, 88, 26, 'ground')
            .setOrigin(0,1);
    }
    createPlayer(){
        this.player = new Player(this, 0,this.gameHeight);
    }

    update(time: number, delta: number): void {
             
    }


}

export default PlayScene;