// tokens.js
// Classe responsável por criar e gerenciar os tokens no jogo

export default class TokenManager {
  constructor(scene, textureKey) {
    this.scene = scene;
    this.textureKey = textureKey;
    this.tokenGroup = this.scene.physics.add.group();
  }

  /**
   * Cria um novo token em uma posição aleatória dentro do mundo
   * Apenas cria o token, sem lógica de escala ou animação.
   */
  spawnToken() {
    const x = Phaser.Math.Between(50, this.scene.physics.world.bounds.width - 50);
    const y = Phaser.Math.Between(50, this.scene.physics.world.bounds.height - 50);

    const radius = 36;
    const tokenGraphics = this.scene.add.graphics();
    const colors = [0xff0077, 0x00ffff, 0xffff00, 0xff00ff, 0x00ff00];
    const color = Phaser.Utils.Array.GetRandom(colors);
    tokenGraphics.fillStyle(color, 1);
    tokenGraphics.fillCircle(radius, radius, radius);
    const tokenTextureKey = `token-${Phaser.Math.RND.uuid()}`;
    tokenGraphics.generateTexture(tokenTextureKey, radius * 2, radius * 2);
    tokenGraphics.destroy();

    const token = this.scene.physics.add.image(x, y, tokenTextureKey)
      .setOrigin(0.5)
      .setScale(1);
    token.setCircle(radius);

    token.setDepth(1);
    token.setImmovable(true);
    token.setData('isToken', true);

    this.tokenGroup.add(token);
  }

  /**
   * Retorna o grupo de tokens (para colisões e interações externas)
   */
  getGroup() {
    return this.tokenGroup;
  }

  /**
   * Remove um token específico da cena
   * @param {Phaser.GameObjects.Image} tokenItem - item de token a ser removido
   */
  removeToken(tokenItem) {
    this.tokenGroup.remove(tokenItem, true, true);
  }

  /**
   * Remove todos os tokens (útil ao resetar o jogo)
   */
  clearAll() {
    this.tokenGroup.clear(true, true);
  }
}