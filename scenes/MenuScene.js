// MenuScene.js
// Scene for main menu and skin selection

import Phaser from 'phaser';
import Snake from '../objects/Snake.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // Load assets for the menu
    this.load.image('menu_bg', 'assets/images/backgrounds/menu_bg.png');
    this.load.spritesheet('play_button', 'assets/buttons/play_button.png', {
      frameWidth: 200,
      frameHeight: 80
    });

    // Preload UI button placeholders
    this.load.image('btn_play', 'assets/buttons/btn_play.png');
    this.load.image('btn_music', 'assets/buttons/btn_music.png');
    this.load.image('btn_exit', 'assets/buttons/btn_exit.png.png');
    this.load.image('btn_wallet', 'assets/buttons/btn_wallet.png');
    this.load.image('btn_profile', 'assets/buttons/btn_profile.png');

    // Preload the game title image
    this.load.image('game_title', 'assets/game_title.png');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, 'menu_bg')
      .setOrigin(0)
      .setDepth(-1);
    bg.setDisplaySize(this.scale.width, this.scale.height);

    const title = this.add.image(this.scale.width / 2, this.scale.height * 0.2, 'game_title')
      .setOrigin(0.5)
      .setDepth(1);
    title.setScale(Math.min(this.scale.width / 1200, 0.4));

    const buttons = [
      { key: 'btn_exit', x: 0.1, y: 0.08 },
      { key: 'btn_music', x: 0.1, y: 0.2 },
      { key: 'btn_wallet', x: 0.85, y: 0.08 },
      { key: 'btn_profile', x: 0.85, y: 0.2 }
    ];

    buttons.forEach(({ key, x, y }) => {
      this.add.image(width * x, height * y, key)
        .setInteractive()
        .setOrigin(0.5)
        .setScale(0.07)
        .setScrollFactor(0)
        .setDepth(2);
    });

    const btnPlay = this.add.image(this.scale.width / 2, this.scale.height * 0.8, 'btn_play')
      .setScale(Math.min(this.scale.width / 1200, 0.35))
      .setInteractive();
    btnPlay.on('pointerdown', () => {
      this.scene.start('GameScene', { selectedSkin: this.selectedSkin });
    });
  }

  highlightSelected(selectedImage) {
    // No-op: skin selection removed
  }

  update(time, delta) {
  }
}
