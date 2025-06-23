// Example 6: Interactive Controls
import PerlinDOM from './PerlinDom.js';

document.addEventListener('DOMContentLoaded', () => {
  let interactiveAnimation;
  
  function initInteractiveAnimation() {
    // Destroy previous instance if it exists
    if (interactiveAnimation) {
      interactiveAnimation.destroy();
    }
    
    // Get current values
    const xRange = parseInt(document.getElementById('x-range').value);
    const yRange = parseInt(document.getElementById('y-range').value);
    const speed = parseFloat(document.getElementById('speed').value);
    const seed = parseInt(document.getElementById('seed').value);
    
    // Create new instance
    interactiveAnimation = new PerlinDOM({
      element: document.querySelector('.interactive-element'),
      x: { min: -xRange, max: xRange },
      y: { min: -yRange, max: yRange },
      speed: speed,
      seed: seed
    });
    
    // Update displays
    document.querySelector('#x-range + .value-display').textContent = `-${xRange} to ${xRange}`;
    document.querySelector('#y-range + .value-display').textContent = `-${yRange} to ${yRange}`;
    document.querySelector('#speed + .value-display').textContent = speed.toFixed(3);
    document.querySelector('#seed + .value-display').textContent = seed;
  }
  
  // Initialize
  initInteractiveAnimation();
  
  // Add event listeners
  document.getElementById('x-range')?.addEventListener('input', initInteractiveAnimation);
  document.getElementById('y-range')?.addEventListener('input', initInteractiveAnimation);
  document.getElementById('speed')?.addEventListener('input', initInteractiveAnimation);
  document.getElementById('seed')?.addEventListener('input', initInteractiveAnimation);
});
