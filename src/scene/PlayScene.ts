import Phaser from "phaser";

class PlayScene extends Phaser.Scene{
    constructor(){
        super("PlayScene")
    }

    create(){
        alert("Play Scene loaded")
    }
}

export default PlayScene;