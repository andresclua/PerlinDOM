# PerlinDOM

A lightweight JavaScript library for creating organic and fluid animations on DOM elements using Perlin noise.

## Description

PerlinDOM allows you to animate HTML elements with natural and organic movements based on Perlin noise. This technique creates movements that appear random but are smooth and predictable, perfect for subtle and attractive visual effects.

## Methods

| Method | Description |
|--------|-------------|
| `play()` | Starts or resumes the animation |
| `pause()` | Pauses the animation |
| `destroy()` | Stops the animation and cleans up resources |
| `init(seed)` | Reinitializes the animation with an optional new seed |

## Features

- **Organic animations**: Natural movements that avoid the rigidity of traditional animations
- **Customizable**: Control over movement ranges, speed, and noise seed
- **Lightweight**: Minimal implementation with no external dependencies
- **Easy to use**: Simple API to implement complex effects
- **Optimized performance**: Uses requestAnimationFrame for smooth animations

## Installation

```bash
npm install @andresclua/PerlinDOM
```


## Basic Usage

```javascript
import PerlinDOM from '@andresclua/PerlinDOM';

// Create a basic animation
const animation = new PerlinDOM({
  element: document.querySelector('.my-element'),
  x: { min: -50, max: 50 },  // Horizontal movement range in pixels
  y: { min: -50, max: 50 },  // Vertical movement range in pixels
  speed: 0.01,               // Animation speed
  seed: 123                  // Seed for the noise generator
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `element` | HTMLElement | The DOM element to animate |
| `x` | Object or null | Horizontal movement configuration: `{min: value, max: value}`. Use `null` to disable horizontal movement |
| `y` | Object or null | Vertical movement configuration: `{min: value, max: value}`. Use `null` to disable vertical movement |
| `speed` | Number | Animation speed (smaller values = slower movement) |
| `seed` | Number | Seed for the Perlin noise generator |
| `lerpSpeed` | Number | Interpolation speed for smooth transitions (default: 0.1) |

## Examples

### 1. Basic Animation

Create an element with smooth movement on both axes.

```javascript
const basicAnimation = new PerlinDOM({
  element: document.querySelector('.element'),
  x: { min: -50, max: 50 },
  y: { min: -50, max: 50 },
  speed: 0.01,
  seed: 123
});
```

### 2. Horizontal-Only Movement

Animate an element only on the horizontal axis.

```javascript
const horizontalAnimation = new PerlinDOM({
  element: document.querySelector('.horizontal-element'),
  x: { min: -100, max: 100 },
  y: null, // No vertical movement
  speed: 0.02
});
```

### 3. Multiple Elements with Different Seeds

Animate multiple elements with different patterns.

```javascript
document.querySelectorAll('.particle').forEach((el, index) => {
  new PerlinDOM({
    element: el,
    x: { min: -100, max: 100 },
    y: { min: -100, max: 100 },
    speed: 0.01,
    seed: index * 100 // Different seed for each element
  });
});
```

### 4. Background Effect

Create a dynamic background with slowly moving elements.

```javascript
document.querySelectorAll('.bg-element').forEach(el => {
  new PerlinDOM({
    element: el,
    x: { min: -10, max: 10 },
    y: { min: -10, max: 10 },
    speed: 0.002, // Very slow movement
    seed: Math.random() * 2000
  });
});
```

### 5. Pause and Play with Mouse Events

Control the animation with mouse events.

```javascript
const pausePlayAnimation = new PerlinDOM({
  element: document.querySelector('.pause-element'),
  x: { min: -80, max: 80 },
  y: { min: -80, max: 80 },
  speed: 0.01,
  seed: 42,
  lerpSpeed: 0.05 // Controls how smooth the transition is
});

// Pause on mouse leave
document.querySelector('.container').addEventListener('mouseleave', () => {
  pausePlayAnimation.pause();
});

// Play on mouse enter
document.querySelector('.container').addEventListener('mouseenter', () => {
  pausePlayAnimation.play();
});
```

### 6. Interactive Controls

Allow the user to adjust animation parameters.

```javascript
// Create the animation with initial settings
const interactiveAnimation = new PerlinDOM({
  element: document.querySelector('.interactive-element'),
  x: { min: -50, max: 50 },
  y: { min: -50, max: 50 },
  speed: 0.01,
  seed: 0
});

// Update settings based on user input
speedControl.addEventListener('input', () => {
  interactiveAnimation.speed = parseFloat(speedControl.value);
  interactiveAnimation.init(); // Restart with new settings
});
```

### 7. Animated Button with Circles

Create a button with animated hover effects.

```javascript
// Get all the circle elements inside the button
const circleElements = document.querySelectorAll('.animated-button .circle');
let circleAnimations = [];

// Function to initialize animations
function initCircleAnimations() {
  // Clear existing animations
  circleAnimations.forEach(anim => anim.destroy());
  circleAnimations = [];
  
  // Create new animations for each circle
  circleElements.forEach((el, index) => {
    const animation = new PerlinDOM({
      element: el,
      x: { min: -15, max: 15 },
      y: { min: -15, max: 15 },
      speed: 0.03,
      seed: index * 1000,
      lerpSpeed: 0.1
    });
    circleAnimations.push(animation);
  });
}

// Add event listeners to the button
document.querySelector('.animated-button').addEventListener('mouseenter', () => {
  initCircleAnimations();
  circleAnimations.forEach(anim => anim.play());
});

document.querySelector('.animated-button').addEventListener('mouseleave', () => {
  circleAnimations.forEach(anim => anim.pause());
});
```

### 8. Triangle with Animated Vertex

Use PerlinDOM to animate a vertex of an SVG polygon.

```javascript
// Get the polygon element
const trianglePath = document.getElementById('trianglePath');

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
```

## Use Cases

- **Background elements**: Create dynamic and organic backgrounds
- **Hover effects**: Enhance the interactivity of buttons and links
- **Data visualizations**: Add subtle movement to charts and visualizations
- **Decorative elements**: Bring decorative elements to life on your website
- **User interfaces**: Create more dynamic and attractive interfaces

## Compatibility

PerlinDOM works in all modern browsers that support:
- ES6 (ECMAScript 2015)
- requestAnimationFrame
- CSS transform

## License

MIT
