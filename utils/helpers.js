/Users/robisso/Downloads/pepeio_gamev1/utils/helpers.js
/**
 * Calculate distance between two points.
 * @param {number} x1 - X coordinate of first point.
 * @param {number} y1 - Y coordinate of first point.
 * @param {number} x2 - X coordinate of second point.
 * @param {number} y2 - Y coordinate of second point.
 * @returns {number} Distance between the two points.
 */
export function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get a random position within the game world.
 * @param {number} worldWidth - Width of the game world.
 * @param {number} worldHeight - Height of the game world.
 * @returns {{x: number, y: number}} A random position object.
 */
export function getRandomPosition(worldWidth, worldHeight) {
  return {
    x: Math.floor(Math.random() * worldWidth),
    y: Math.floor(Math.random() * worldHeight)
  };
}

/**
 * Format number to a shorter string (e.g., 1.2K, 3.4M).
 * @param {number} num - The number to format.
 * @returns {string} Formatted number string.
 */
export function formatScore(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}
