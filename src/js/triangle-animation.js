// Example 8: ClipPath Triangle with Animated Vertex
import PerlinDOM from './PerlinDom.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get the polygon element
  const trianglePath = document.getElementById('trianglePath');
  
  if (!trianglePath) return;
  
  // Store the original points
  const originalPoints = {
    x1: 150, y1: 50,  // Top vertex
    x2: 250, y2: 250, // Bottom right
    x3: 50,  y3: 250  // Bottom left
  };
  
  // Create a custom animation function
  function animateTriangle() {
    // Create a PerlinDOM instance for the top vertex
    const topVertexAnimation = new PerlinDOM({
      element: null, // We're not moving a DOM element directly
      x: { min: -30, max: 30 },
      y: { min: -20, max: 20 },
      speed: 0.005,
      seed: 42
    });
    
    // Animation function
    function updateTriangle() {
      // Get the current noise values
      const offsetX = topVertexAnimation.lastX;
      const offsetY = topVertexAnimation.lastY;
      
      // Update the polygon points
      const newPoints = `${originalPoints.x1 + offsetX},${originalPoints.y1 + offsetY} ${originalPoints.x2},${originalPoints.y2} ${originalPoints.x3},${originalPoints.y3}`;
      trianglePath.setAttribute('points', newPoints);
      
      // Continue animation
      requestAnimationFrame(updateTriangle);
    }
    
    // Start the animation
    updateTriangle();
  }
  
  // Initialize the animation
  animateTriangle();
});
