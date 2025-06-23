// Example 5: Pause and Play with Mouse Events
import PerlinDOM from './PerlinDom.js';

document.addEventListener('DOMContentLoaded', () => {
  // Create the animation
  const pausePlayAnimation = new PerlinDOM({
    element: document.querySelector('.pause-play-element'),
    x: { min: -80, max: 80 },
    y: { min: -180, max: 80 },
    speed: 0.01,
    seed: 42,
    lerpSpeed: 0.05 // Controls how smooth the transition is
  });
  
  // Pause on mouse leave
  document.querySelector('.pause-play-container')?.addEventListener('mouseleave', () => {
    pausePlayAnimation.pause();
    document.querySelector('.status-indicator').textContent = 'Pausing...';
  });
  
  // Play on mouse enter
  document.querySelector('.pause-play-container')?.addEventListener('mouseenter', () => {
    pausePlayAnimation.play();
    document.querySelector('.status-indicator').textContent = 'Playing...';
  });
  
  // Update lerpSpeed when slider changes
  document.getElementById('lerp-speed')?.addEventListener('input', (e) => {
    const newSpeed = parseFloat(e.target.value);
    pausePlayAnimation.lerpSpeed = newSpeed;
    document.querySelector('.lerp-value').textContent = newSpeed.toFixed(2);
  });
});
