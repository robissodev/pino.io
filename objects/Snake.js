// Snake.js

export default class Snake {
  constructor(scene, x, y, globalScale = 1, initialSpeed = 300, texture = 'snake_head') {
    this.scene = scene;
    this.globalScale = globalScale;

    this.head = this.scene.physics.add.image(x, y, texture)
      .setDepth(101)
      .setOrigin(0.5)
      .setScale(texture === 'snake_head' ? 0.2 * globalScale : 0.14 * globalScale)
      .setAngle(270);
    this.head.body.setCircle(18 * globalScale).setOffset(6 * globalScale, 6 * globalScale);
    this.head.setCollideWorldBounds(true);

    this.bodyParts = [this.head];
    this.segmentSpacing = 14 * globalScale;
    this.moveSpeed = initialSpeed;

    this.pendingGrowth = 0;
    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    this.handleInput();
    this.moveHead(delta);
    this.moveBody();
    this.handleGrowth();
  }

  handleInput() {
    const isTouch = this.scene.sys.game.device.input.touch;
    const turnRate = isTouch ? 2.5 : 1.5;

    if (this.cursors.left.isDown) {
      this.head.angle -= turnRate;
    } else if (this.cursors.right.isDown) {
      this.head.angle += turnRate;
    }
  }

  moveHead(delta) {
    const radians = Phaser.Math.DegToRad(this.head.angle);
    const dx = Math.cos(radians) * this.moveSpeed * (delta / 1000);
    const dy = Math.sin(radians) * this.moveSpeed * (delta / 1000);
    this.head.x += dx;
    this.head.y += dy;
  }

  moveBody() {
    if (!this.head) return;

    if (!this.positions) {
      this.positions = [];
    }

    const currentHeadPos = { x: this.head.x, y: this.head.y };
    const lastRecorded = this.positions[0];

    // Only record new position if the head has moved significantly
    if (!lastRecorded || Phaser.Math.Distance.Between(currentHeadPos.x, currentHeadPos.y, lastRecorded.x, lastRecorded.y) > 2) {
      this.positions.unshift(currentHeadPos);
    }

    // Update each body segment to follow a position at a specific distance behind
    for (let i = 1; i < this.bodyParts.length; i++) {
      const segment = this.bodyParts[i];
      const targetDistance = this.segmentSpacing * i;

      let cumulativeDistance = 0;
      for (let j = 1; j < this.positions.length; j++) {
        const p1 = this.positions[j - 1];
        const p2 = this.positions[j];
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        cumulativeDistance += dist;
        if (cumulativeDistance >= targetDistance) {
          segment.x = p2.x;
          segment.y = p2.y;
          break;
        }
      }
    }

    // Limit history length
    const maxLength = this.segmentSpacing * this.bodyParts.length * 2;
    if (this.positions.length > maxLength) {
      this.positions.length = maxLength;
    }
  }

  grow() {
    this.pendingGrowth++;
  }

  handleGrowth() {
    while (this.pendingGrowth > 0) {
      const last = this.bodyParts[this.bodyParts.length - 1];
      const radius = 36;
      const colors = [0xff0077, 0x00ffff, 0xffff00, 0xff00ff, 0x00ff00];
      const color = Phaser.Utils.Array.GetRandom(colors);
      const segmentGraphics = this.scene.add.graphics();
      segmentGraphics.fillStyle(color, 1);
      segmentGraphics.fillCircle(radius, radius, radius);
      const textureKey = `segment-${Phaser.Math.RND.uuid()}`;
      segmentGraphics.generateTexture(textureKey, radius * 2, radius * 2);
      segmentGraphics.destroy();

      const newPart = this.scene.physics.add.image(last.x, last.y, textureKey)
        .setOrigin(0.5)
        .setDepth(100 - this.bodyParts.length);
      newPart.body.setCircle(18 * this.globalScale);
      this.bodyParts.push(newPart);
      this.pendingGrowth--;

      this.updateSegmentScales();
    }
  }

  updateSegmentScales() {
    const uniformScale = 0.5 * this.globalScale;
    for (let i = 1; i < this.bodyParts.length; i++) {
      this.bodyParts[i].setScale(uniformScale);
    }
  }

  destroy() {
    this.bodyParts.forEach(part => part.destroy());
    this.bodyParts = [];
    this.positions = [];
  }
}
