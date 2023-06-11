
import Phaser from "phaser";
import PreloadScene from "./scene/PreloadScene";
import PlayScene from "./scene/PlayScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 340,
  pixelArt: true,
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug:true,

    }
  },
  scene:[PreloadScene, PlayScene]
};

new Phaser.Game(config);

