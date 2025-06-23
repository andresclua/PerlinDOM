// Example 7: Animated Button with Circles
import PerlinDOM from './PerlinDom.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get all the circle elements inside the button
  const circleElements = document.querySelectorAll('.animated-button .circle');
  
  // Create an array to store the animation instances
  let circleAnimations = [];
  
  // Function to initialize animations
  function initCircleAnimations() {
    // Clear any existing animations
    circleAnimations.forEach(anim => anim.destroy());
    circleAnimations = [];
    
    // Create new animations for each circle
    circleElements.forEach((el, index) => {
      const animation = new PerlinDOM({
        element: el,
        x: { min: -15, max: 15 },
        y: { min: -15, max: 15 },
        speed: 0.007,
        seed: index * 1000,
        lerpSpeed: 0.2 * index
      });
      circleAnimations.push(animation);
    });
  }
  
  // Add event listeners to the button
  document.querySelector('.animated-button')?.addEventListener('mouseenter', () => {
    initCircleAnimations();
    circleAnimations.forEach(anim => anim.play());
  });
  
  document.querySelector('.animated-button')?.addEventListener('mouseleave', () => {
    circleAnimations.forEach(anim => anim.pause());
  });
});
