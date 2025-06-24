// config/gameConfig.js
// Arquivo de configuração do jogo Phaser

import GameScene from '../main.js';

const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: GameScene,
};

export default gameConfig;
