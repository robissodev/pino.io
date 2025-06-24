// Responsive scaling base resolution
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

import Phaser from 'phaser';
import Snake from '../objects/Snake.js';
import TokenManager from '../objects/tokens.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.boosting = false;
  }

  preload() {
    this.load.atlas('arrow_sheet', 'assets/cursor/arrow_sheet.png', 'assets/cursor/arrow_sheet.json');
  }

  create() {
    // Draw dense grid background manually
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1d1d1d, 1);
    graphics.fillRect(0, 0, 8000, 8000); // Full background

    graphics.lineStyle(1, 0x333333, 1);
    for (let x = 0; x <= 8000; x += 50) {
      graphics.beginPath();
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 8000);
      graphics.strokePath();
    }
    for (let y = 0; y <= 8000; y += 50) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(8000, y);
      graphics.strokePath();
    }

    this.physics.world.setBounds(0, 0, 8000, 8000);
    this.cameras.main.setBounds(0, 0, 8000, 8000);
    this.cameras.main.centerOn(4000, 4000);

    // New zoom logic using full height of the screen with limit
    const baseWidth = 1080;
    const baseHeight = 1920;
    const screenRatio = this.scale.width / this.scale.height;
    const baseRatio = baseWidth / baseHeight;

    // Keep the camera zoom consistent and natural across devices
    let zoomFactor;
    if (screenRatio > baseRatio) {
      zoomFactor = this.scale.height / baseHeight;
    } else {
      zoomFactor = this.scale.width / baseWidth;
    }
    this.cameras.main.setZoom(zoomFactor);

    // Recalculate global scale
    const scaleX = this.scale.width / baseWidth;
    const scaleY = this.scale.height / baseHeight;
    this.globalScale = Math.min(scaleX, scaleY) * zoomFactor;

    this.snake = new Snake(this, 2000, 2000, this.globalScale, this.snake ? this.snake.moveSpeed : 300);
    // Removed explicit scale override for head — handled inside Snake.js
    // Removed explicit scale override for body — handled inside Snake.js

    // Camera follows snake head
    this.cameras.main.startFollow(this.snake.head, true, 0.1, 0.1);

    // Initialize the arrow indicator using the correct atlas key and frame
    this.arrow = this.add.sprite(this.snake.head.x, this.snake.head.y, 'arrow_sheet', '000.png')
      .setOrigin(0.5, 0.5)
      .setDepth(10)
      .setAlpha(0);
    // Add arrow fade tween
    this.arrowFadeTween = this.tweens.add({
      targets: this.arrow,
      alpha: { from: 0, to: 1 },
      duration: 400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    // Dynamically scale the arrow based on device type
    const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    const arrowScale = isMobile ? 0.056 : 0.042;
    this.arrow.setScale(arrowScale * 4);

    // Create and play arrow animation
    this.anims.create({
      key: 'arrow_pulse',
      frames: this.anims.generateFrameNames('arrow_sheet', {
        start: 0,
        end: 179,
        zeroPad: 3,
        prefix: '',
        suffix: '.png'
      }),
      frameRate: 30,
      repeat: -1
    });

    this.arrow.play('arrow_pulse');
 
    this.arrowMaxDistance = 600 * this.globalScale * 5;


    this.tokenManager = new TokenManager(this, 'token');

    for (let i = 0; i < 300; i++) {
      this.tokenManager.spawnToken();
      // Set scale of the last spawned token to 0.28 * globalScale * 2
      const tokens = this.tokenManager.getGroup().getChildren();
      tokens[tokens.length - 1].setScale(0.28 * this.globalScale * 2);
      // Add spinning and scaling animation to the most recently spawned token
      const token = tokens[tokens.length - 1];
      this.tweens.add({
        targets: token,
        angle: 360,
        duration: 4000,
        repeat: -1,
        ease: 'Linear'
      });
      this.tweens.add({
        targets: token,
        scale: { from: 0.28 * this.globalScale * 2, to: 0.25 * this.globalScale * 2 },
        yoyo: true,
        duration: 800,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '50px',
      fill: '#ffffff'
    }).setScrollFactor(0);

    this.physics.add.overlap(
      this.snake.head,
      this.tokenManager.getGroup(),
      this.handleTokenCollision,
      null,
      this
    );

    // Joystick/arrow pointer events
    this.input.on('pointerdown', (pointer) => {
      this.joystickStart = { x: pointer.x, y: pointer.y };
      this.joystickActive = true;
      // (Removed direct arrow alpha set)
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.joystickStart) return;
      const minMoveDistance = 1500;
      const moveDistance = Phaser.Math.Distance.Between(this.joystickStart.x, this.joystickStart.y, pointer.x, pointer.y);
      if (moveDistance < minMoveDistance) return;

      const dx = (pointer.x - this.joystickStart.x) * 2;
      const dy = (pointer.y - this.joystickStart.y) * 2;
      // Update arrow visibility and position (elastic effect)
      this.arrow.setVisible(true);
      // (Removed direct arrow alpha set)
      // Resume arrow fade tween if paused
      if (this.arrowFadeTween && this.arrowFadeTween.isPaused()) {
        this.arrowFadeTween.resume();
      }

      // Use distance and angle for arrow tweening
      const angleRad = Math.atan2(dy, dx);
      const rawDistance = Phaser.Math.Distance.Between(this.joystickStart.x, this.joystickStart.y, pointer.x, pointer.y) * 2;
      const distance = Phaser.Math.Clamp(rawDistance, 120, this.arrowMaxDistance);
      const arrowX = this.snake.head.x + Math.cos(angleRad) * distance;
      const arrowY = this.snake.head.y + Math.sin(angleRad) * distance;

      this.scene.tweens.add({
        targets: this.arrow,
        x: arrowX,
        y: arrowY,
        duration: 100,
        ease: 'Sine.easeOut',
        overwrite: true
      });

      const angleDeg = Phaser.Math.RadToDeg(angleRad);
      this.snake.head.angle = angleDeg;
      this.arrowAngle = angleDeg;
      this.joystickActive = true;
    });

    this.input.on('pointerup', () => {
      this.joystickStart = null;
      this.joystickActive = false;
      // Hide arrow on touch release
      this.arrow.setVisible(false);
      // Replace fade out with stopping fade tween
      if (this.arrowFadeTween) {
        this.arrowFadeTween.pause();
      }
      // Remove: this.arrow.setAlpha(0); (alpha is now managed in update)
    });

    // Boost mechanic: double click and hold to move faster
    this.input.on('pointerdown', (pointer) => {
      const now = this.time.now;
      if (this.lastClickTime && now - this.lastClickTime < 300) {
        this.boosting = true;
      }
      this.lastClickTime = now;
    });

    this.input.on('pointerup', () => {
      this.boosting = false;
    });
  }

  update(time, delta) {
    if (this.boosting) {
      this.snake.moveSpeed = 600; // Increased double speed
    } else {
      this.snake.moveSpeed = 300; // Increased normal speed
    }
    if (this.snake) {
      this.snake.update(time, delta);
      // Token suction effect
      this.tokenManager.getGroup().getChildren().forEach(token => {
        const distance = Phaser.Math.Distance.Between(token.x, token.y, this.snake.head.x, this.snake.head.y);

        if (distance < 200) {
          const attractionSpeed = 80;
          const angle = Phaser.Math.Angle.Between(token.x, token.y, this.snake.head.x, this.snake.head.y);
          const dx = Math.cos(angle) * attractionSpeed * (1 - distance / 200);
          const dy = Math.sin(angle) * attractionSpeed * (1 - distance / 200);

          token.x += dx;
          token.y += dy;

          // Optional: add shrink effect
          const newScale = Phaser.Math.Clamp(token.scale - 0.002, 0.15, 1);
          token.setScale(newScale);
        }
      });
    }

    // Updated arrow movement logic for smooth elastic-like behavior
    if (this.joystickStart && this.input.activePointer.isDown) {
      const dx = (this.input.activePointer.x - this.joystickStart.x) * 5;
      const dy = (this.input.activePointer.y - this.joystickStart.y) * 5;
      const moveDistance = Phaser.Math.Distance.Between(this.joystickStart.x, this.joystickStart.y, this.input.activePointer.x, this.input.activePointer.y);
      if (moveDistance < 10) return;
      const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
      const currentAngle = Phaser.Math.Angle.WrapDegrees(this.snake.head.angle);
      const targetAngle = Phaser.Math.Angle.WrapDegrees(angle);
      const diff = Phaser.Math.Angle.ShortestBetween(currentAngle, targetAngle);
      this.snake.head.angle = currentAngle + diff * 0.1;

      const arrowDistance = Math.min(this.arrowMaxDistance, Phaser.Math.Distance.Between(0, 0, dx, dy));
      const targetX = this.snake.head.x + Math.cos(Phaser.Math.DegToRad(angle)) * arrowDistance;
      const targetY = this.snake.head.y + Math.sin(Phaser.Math.DegToRad(angle)) * arrowDistance;

      this.arrow.setVisible(true);
      this.arrow.setPosition(targetX, targetY);
      this.arrow.setRotation(Phaser.Math.DegToRad(angle));
      // Arrow flashing effect during boosting
      if (this.boosting) {
        this.arrow.setAlpha(Math.abs(Math.sin(time * 0.02))); // Fast flashing alpha
      } else {
        this.arrow.setAlpha(1); // Reset to normal visibility if not boosting
      }
    } else {
      // Keep arrow in front of head if pointer is not moving but still pressed
      if (this.input.activePointer.isDown) {
        const angle = this.snake.head.angle;
        const holdDistance = 120 * this.globalScale;
        const targetX = this.snake.head.x + Math.cos(Phaser.Math.DegToRad(angle)) * holdDistance;
        const targetY = this.snake.head.y + Math.sin(Phaser.Math.DegToRad(angle)) * holdDistance;

        this.arrow.setVisible(true);
        this.arrow.setPosition(targetX, targetY);
        this.arrow.setRotation(Phaser.Math.DegToRad(angle));
        // Arrow flashing effect during boosting
        if (this.boosting) {
          this.arrow.setAlpha(Math.abs(Math.sin(time * 0.02))); // Fast flashing alpha
        } else {
          this.arrow.setAlpha(1); // Reset to normal visibility if not boosting
        }
      } else {
        this.arrow.setVisible(false);
        // No need to set alpha here, as arrow is hidden
      }
    }
  }

  handleTokenCollision = (snakeHead, tokenItem) => {
    this.tokenManager.removeToken(tokenItem);
    this.tokenManager.spawnToken();

    const tokens = this.tokenManager.getGroup().getChildren();
    const token = tokens[tokens.length - 1];
    token.setScale(0.28 * this.globalScale * 2);
    this.tweens.add({
      targets: token,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });
    this.tweens.add({
      targets: token,
      scale: { from: 0.30 * this.globalScale * 2, to: 0.25 * this.globalScale * 2 },
      yoyo: true,
      duration: 800,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
/*    // Removed duplicate animation block
    const tokens = this.tokenManager.getGroup().getChildren();
    if (tokens.length > 0) {
      tokens[tokens.length - 1].setScale(0.08 * this.globalScale * 2);
      const token = tokens[tokens.length - 1];
      this.tweens.add({
        targets: token,
        angle: 360,
        duration: 4000,
        repeat: -1,
        ease: 'Linear'
      });
      this.tweens.add({
        targets: token,
        scale: { from: 0.07 * this.globalScale * 2, to: 0.09 * this.globalScale * 2 },
        yoyo: true,
        duration: 800,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }*/
    this.snake.grow();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}