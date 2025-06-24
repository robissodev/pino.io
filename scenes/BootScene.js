// BootScene.js
// Cena responsável por carregar os assets e iniciar a próxima cena

import Phaser from 'phaser';
import GameScene from './GameScene.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Mostra uma barra de carregamento básica (opcional)
    const width = this.scale.width;
    const height = this.scale.height;
    const progressBar = this.add.graphics();
    // const progressBox = this.add.graphics();
    // progressBox.fillStyle(0x222222, 0.8);
    // progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      // progressBox.destroy();
    });

    // Carrega os novos assets organizados
    this.load.image('snake_head', 'assets/images/skins/head/pepe_head.png');
    this.load.image('snake_body', 'assets/images/skins/body/green.png');
    this.load.image('token', 'assets/images/tokens/pizzatoken.png');

    // Preload the arrow sprite sheet for the animated arrow
    this.load.spritesheet('arrow', 'assets/cursor/arrow.png', {
      frameWidth: 512,
      frameHeight: 512,
      endFrame: 179
    });
  }

  create() {
    // Test message to confirm canvas is rendering
    this.add.text(100, 100, 'PINO.IO', { fontSize: '32px', fill: '#00ff00' });

    // Create the animated arrow animation
    this.anims.create({
      key: 'arrow_anim',
      frames: this.anims.generateFrameNumbers('arrow', { start: 0, end: 179 }),
      frameRate: 24,
      repeat: -1
    });

    // Inicia a cena principal do jogo após o carregamento
    this.scene.start('MenuScene');
  }
}
