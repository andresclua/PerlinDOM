// Examples 1-4: Basic PerlinDOM Examples
import PerlinDOM from './PerlinDom.js';

document.addEventListener('DOMContentLoaded', () => {
  // Example 1: Basic Animation
  const basicAnimation = new PerlinDOM({
    element: document.querySelector('.basic-element'),
    x: { min: -50, max: 50 },
    y: { min: -50, max: 50 },
    speed: 0.01,
    seed: 123
  });
  
  // Example 2: Horizontal Only
  const horizontalAnimation = new PerlinDOM({
    element: document.querySelector('.horizontal-element'),
    x: { min: -100, max: 100 },
    y: null, // No vertical movement
    speed: 0.02
  });
  
  // Example 3: Multiple Elements
  document.querySelectorAll('.particle').forEach((el, index) => {
    new PerlinDOM({
      element: el,
      x: { min: -100, max: 100 + index * 20 }, // Slightly wider range for each element
      y: { min: -100, max: 120}, // Random vertical range
      speed: index * 0.001, // Slightly different speed for each element
      seed: index * 16700 // Different seed for each element
    });
  });
  
  // Example 4: Background Effect
  document.querySelectorAll('.bg-element').forEach(el => {
    new PerlinDOM({
      element: el,
      x: { min: -110, max: 110 },
      y: { min: -110, max: 110 },
      speed: 0.002, // Very slow movement
      seed: Math.random() * 2000
    });
  });
});
