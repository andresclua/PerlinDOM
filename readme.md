# PerlinDOM

A lightweight JavaScript library for creating smooth, organic animations for DOM elements using Perlin noise.

## Overview

PerlinDOM uses Perlin noise algorithms to generate natural-looking, random movements for HTML elements. Unlike traditional animations that follow predictable paths, Perlin noise creates smooth, organic motion that appears more natural and less mechanical.

The PerlinDOM class provides a way to animate DOM elements using Perlin noise, creating smooth, organic, and natural-looking movements. This implementation uses a 2D Perlin noise algorithm to generate values that change smoothly over time, which are then mapped to x and y coordinates for element positioning.

## Features

- **Smooth Organic Animations**: Create natural-looking movements for any DOM element
- **Configurable Parameters**: Customize the range, speed, and randomness of animations
- **Deterministic Randomness**: Use seeds to create reproducible animations
- **Playback Control**: Pause and resume animations as needed
- **Lightweight**: No dependencies, minimal footprint
- **Easy to Use**: Simple API with minimal setup required
- **Efficient Rendering**: Uses requestAnimationFrame for optimal performance

## Installation

```bash
npm install @andresclua/perlinDOM
```

## Basic Usage

```javascript
import PerlinDOM from '@andresclua/perlinDOM';

// Select elements to animate
const elements = document.querySelectorAll('.animated-element');

// Initialize PerlinDOM for each element
elements.forEach(element => {
  new PerlinDOM({
    element: element,
    x: { min: -50, max: 50 },
    y: { min: -50, max: 50 },
    speed: 0.01,
    seed: Math.random() * 1000
  });
});
```

## API Reference

### Constructor Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `element` | DOM Element | *required* | The DOM element to animate |
| `x` | Object or null | null | The range of horizontal movement: `{ min: Number, max: Number }` |
| `y` | Object or null | null | The range of vertical movement: `{ min: Number, max: Number }` |
| `speed` | Number | 0.01 | The speed of the animation (higher values = faster movement) |
| `seed` | Number | 0 | The random seed for the Perlin noise (same seed = same animation pattern) |
| `lerpSpeed` | Number | 0.1 | The speed of transition between play and pause states (higher values = faster transitions) |

### Methods

#### `init(seed)`

Initializes the Perlin noise generator with the given seed and starts the animation.

**Parameters:**
- `seed` (Number): The random seed to use for the Perlin noise generator

```javascript
// This is called automatically by the constructor
perlinInstance.init(42); // Initialize with a specific seed
```

#### `pause()`

Gradually slows down the animation until it pauses completely, using a smooth transition.

```javascript
// Smoothly pause the animation
perlinInstance.pause();

// You can later resume it with play()
```

#### `play()`

Gradually speeds up a paused animation until it reaches full speed, using a smooth transition.

```javascript
// Smoothly resume a paused animation
perlinInstance.play();
```

#### `animate()`

The animation loop function that updates the element's position based on Perlin noise values. This method is bound to the instance and called automatically via requestAnimationFrame.

#### `destroy()`

Stops the animation by canceling the animation frame request.

```javascript
const animation = new PerlinDOM({
  element: document.querySelector('.my-element'),
  x: { min: -100, max: 100 },
  y: { min: -100, max: 100 }
});

// Later, when you want to stop the animation:
animation.destroy();
```

## Examples

### Basic Animation

```javascript
import PerlinDOM from '@andresclua/perlinDOM';

// Create a floating element
const floater = new PerlinDOM({
  element: document.querySelector('.floating-element'),
  x: { min: -20, max: 20 },
  y: { min: -20, max: 20 },
  speed: 0.005 // Slow, gentle movement
});
```

### Horizontal-Only Movement

```javascript
// Create an element that only moves horizontally
const slider = new PerlinDOM({
  element: document.querySelector('.sliding-element'),
  x: { min: -100, max: 100 },
  y: null, // No vertical movement
  speed: 0.02
});
```

### Multiple Elements with Different Seeds

```javascript
// Animate multiple elements with different patterns
document.querySelectorAll('.particle').forEach((el, index) => {
  new PerlinDOM({
    element: el,
    x: { min: -50, max: 50 },
    y: { min: -50, max: 50 },
    speed: 0.01,
    seed: index * 100 // Different seed for each element
  });
});
```

### Creating a Background Effect

```javascript
// Create a subtle background animation
const bgElements = document.querySelectorAll('.background-element');
bgElements.forEach(el => {
  new PerlinDOM({
    element: el,
    x: { min: -5, max: 5 },
    y: { min: -5, max: 5 },
    speed: 0.002, // Very slow movement
    seed: Math.random() * 2000
  });
});
```

### Pause and Play with Mouse Events

```javascript
// Create an animation that pauses when mouse leaves the container
const animation = new PerlinDOM({
  element: document.querySelector('.animated-element'),
  x: { min: -50, max: 50 },
  y: { min: -50, max: 50 },
  speed: 0.01
});

// Pause on mouse leave
document.querySelector('.container').addEventListener('mouseleave', () => {
  animation.pause();
});

// Resume on mouse enter
document.querySelector('.container').addEventListener('mouseenter', () => {
  animation.play();
});
```

## Technical Details

### Perlin Noise Implementation

This library uses a 2D implementation of Perlin noise, which generates smooth, continuous, pseudo-random values. The algorithm:

1. Uses a permutation table generated from the seed value
2. Applies interpolation and gradient functions to create smooth transitions between points in a 2D space
3. Outputs values between -1 and 1, which are then mapped to the specified ranges
4. Creates more natural and varied movement patterns than 1D noise

### Animation Process

1. The `animate` method is called on each animation frame
2. The time value is incremented by the speed parameter
3. Perlin noise values are generated for both x and y coordinates
4. These values are mapped to the specified ranges
5. The element's position is updated using CSS left/top properties
6. The next animation frame is requested

### Playback Control

The library provides smooth playback control with transitions between states:
- When pausing, the animation gradually slows down until it stops completely
- When playing, the animation gradually speeds up until it reaches full speed
- The transition speed is controlled by the `lerpSpeed` parameter

This creates more natural-looking transitions between play and pause states, rather than abrupt stops and starts.

### Performance Considerations

- The library uses `requestAnimationFrame` for optimal performance and battery efficiency
- CSS left/top properties are used for positioning elements
- The initial position of the element is cached to avoid reflows
- The animation can be paused when not visible to save resources

## Browser Support

PerlinDOM works in all modern browsers that support:
- ES6 Classes and private methods/fields
- requestAnimationFrame
- CSS Positioning

## Known Limitations

- Elements must have a position (relative, absolute, or fixed) for the animation to work properly
- Very high speed values may cause the animation to appear less smooth

## License

MIT © Andres Clua
