// Scoreboard.js
// UI component to display player score and leaderboard

export default class Scoreboard {
  constructor(scene) {
    this.scene = scene;

    // Player score display
    this.scoreText = scene.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);

    // Leaderboard placeholder
    this.leaderboardText = scene.add.text(scene.scale.width - 220, 16, 'Leaderboard:', {
      fontSize: '20px',
      fill: '#ffff66',
      align: 'right',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    });
    this.leaderboardText.setScrollFactor(0);
  }

  updateScore(score) {
    this.scoreText.setText(`Score: ${score}`);
  }

  updateLeaderboard(leaderboardArray) {
    const formatted = leaderboardArray
      .map((entry, i) => `${i + 1}. ${entry.name} (${entry.score})`)
      .join('\n');
    this.leaderboardText.setText(`Leaderboard:\n${formatted}`);
  }
}
