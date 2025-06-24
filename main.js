// main.js
// Entry point do jogo Pino.io

import Phaser from 'phaser';

// Importação das cenas
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

// Constantes globais de configuração
const GAME_CONTAINER_ID = 'phaser-game';
const GAME_WIDTH = 1080;
const GAME_HEIGHT = 1920;

// Configuração principal do Phaser
const config = {
  type: Phaser.AUTO,
  parent: GAME_CONTAINER_ID,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1080,
    height: 1920
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false, // Ative para debugging visual
    }
  },
  scene: [BootScene, MenuScene, GameScene],
  backgroundColor: '#1d1d1d',
};

// Inicializa o jogo
const game = new Phaser.Game(config);