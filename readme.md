# PerlinDOM

[![npm version](https://badge.fury.io/js/@andresclua%2Fperlindom.svg)](https://badge.fury.io/js/@andresclua%2Fperlindom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A lightweight JavaScript library for creating smooth, organic animations on DOM elements using Perlin noise. Create natural, fluid movements that bring your web interfaces to life.

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Examples](#-examples)
- [Best Practices](#-best-practices)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Browser Compatibility](#-browser-compatibility)
- [Changelog](#-changelog)
- [License](#-license)

## ✨ Features

- **🌊 Organic Animations**: Natural movements using Perlin noise that avoid mechanical rigidity
- **📱 Responsive Design**: Support for percentage-based values that adapt to container size
- **🎯 Smart Positioning**: Automatically works from element's current position (CSS or inline styles)
- **⚡ High Performance**: Uses `transform` and `requestAnimationFrame` for smooth 60fps animations
- **🎛️ Full Control**: Play, pause, and destroy animations with smooth transitions
- **📦 Lightweight**: Minimal footprint with zero dependencies
- **🔧 Easy Integration**: Simple API that works with any DOM element
- **🎨 Flexible**: Mix pixel and percentage values, animate on single or both axes

## 📦 Installation

```bash
npm install @andresclua/perlindom
```

Or include directly in your HTML:

```html
<script type="module">
  import PerlinDOM from 'https://unpkg.com/@andresclua/perlindom/dist/perlindom.es.js';
</script>
```

## 🚀 Quick Start

```javascript
import PerlinDOM from '@andresclua/perlindom';

// Basic animation - element will animate from its current position
const animation = new PerlinDOM({
  element: document.querySelector('.my-element'),
  x: { min: -50, max: 50 },  // Move ±50px horizontally
  y: { min: -30, max: 30 },  // Move ±30px vertically
  speed: 0.01,               // Animation speed
  seed: 123                  // Reproducible pattern
});

// Control the animation
animation.pause();  // Smooth pause
animation.play();   // Resume
animation.destroy(); // Clean up
```

```css
/* Your element needs positioning for transforms to work */
.my-element {
  position: relative; /* or absolute, or fixed */
  /* PerlinDOM will animate from wherever this element is positioned */
}
```

## ⚙️ Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `element` | `HTMLElement` | **required** | The DOM element to animate |
| `x` | `Object \| null` | `null` | Horizontal movement: `{min: number, max: number}` |
| `y` | `Object \| null` | `null` | Vertical movement: `{min: number, max: number}` |
| `speed` | `number` | `0.01` | Animation speed (lower = slower) |
| `seed` | `number` | `0` | Seed for reproducible patterns |
| `lerpSpeed` | `number` | `0.1` | Transition smoothness for pause/play |

### Value Types

- **Pixels**: `{ min: -50, max: 50 }` - Fixed pixel movement
- **Percentages**: `{ min: '-10%', max: '10%' }` - Responsive to parent size
- **Mixed**: `x: { min: '-5%', max: '5%' }, y: { min: -20, max: 20 }`
- **Single Axis**: Set unused axis to `null`

## 📚 Examples

### 1. Basic Element Animation

```html
<div class="floating-card">Content</div>
```

```css
.floating-card {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

```javascript
new PerlinDOM({
  element: document.querySelector('.floating-card'),
  x: { min: -20, max: 20 },
  y: { min: -15, max: 15 },
  speed: 0.008,
  seed: 42
});
```

### 2. Responsive Background Elements

```javascript
// Elements adapt to container size changes
document.querySelectorAll('.bg-particle').forEach((el, index) => {
  new PerlinDOM({
    element: el,
    x: { min: '-15%', max: '15%' },  // 15% of parent width
    y: { min: '-10%', max: '10%' },  // 10% of parent height
    speed: 0.003,
    seed: index * 1000
  });
});
```

### 3. Interactive Hover Effects

```javascript
const button = document.querySelector('.animated-button');
let animation;

button.addEventListener('mouseenter', () => {
  animation = new PerlinDOM({
    element: button.querySelector('.effect'),
    x: { min: -5, max: 5 },
    y: { min: -5, max: 5 },
    speed: 0.02,
    lerpSpeed: 0.15
  });
});

button.addEventListener('mouseleave', () => {
  animation?.pause();
});
```

### 4. Multiple Elements with Synchronized Patterns

```javascript
// Same seed = synchronized movement
document.querySelectorAll('.sync-element').forEach(el => {
  new PerlinDOM({
    element: el,
    x: { min: -30, max: 30 },
    y: { min: -30, max: 30 },
    speed: 0.01,
    seed: 12345  // Same seed for all elements
  });
});
```

### 5. Custom Animation Patterns

```javascript
// Horizontal-only movement for sliding effects
new PerlinDOM({
  element: document.querySelector('.slider'),
  x: { min: -100, max: 100 },
  y: null,  // No vertical movement
  speed: 0.005
});

// Vertical-only for floating effects
new PerlinDOM({
  element: document.querySelector('.floater'),
  x: null,  // No horizontal movement
  y: { min: -40, max: 40 },
  speed: 0.008
});
```

### 6. Advanced: SVG Path Animation

```javascript
// Animate SVG elements or paths
const svgElement = document.querySelector('#animated-path');
const pathAnimation = new PerlinDOM({
  element: null,  // No direct element
  x: { min: -20, max: 20 },
  y: { min: -15, max: 15 },
  speed: 0.01,
  seed: 999
});

function updatePath() {
  const offsetX = pathAnimation.lastX;
  const offsetY = pathAnimation.lastY;
  
  // Update SVG path or transform
  svgElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  
  requestAnimationFrame(updatePath);
}
updatePath();
```

## 💡 Best Practices

### ✅ Do

- **Use CSS for initial positioning**: Position elements with CSS classes rather than inline styles
- **Set proper positioning**: Ensure elements have `position: relative`, `absolute`, or `fixed`
- **Use percentage values for responsive designs**: Great for mobile-friendly animations
- **Choose appropriate speeds**: Start with `0.01` and adjust based on desired effect
- **Clean up animations**: Call `destroy()` when removing elements from DOM

### ❌ Don't

- **Don't rely on inline positioning**: PerlinDOM works from any position, but CSS is cleaner
- **Don't use on static elements**: Transform won't work without proper positioning
- **Don't forget to destroy**: Memory leaks can occur if animations aren't cleaned up
- **Don't use extreme speeds**: Very high speeds can cause jittery animations

### 🎯 Performance Tips

```javascript
// Good: Reuse animation instances
const sharedAnimation = new PerlinDOM({...});

// Good: Use percentage values for responsive design
x: { min: '-5%', max: '5%' }

// Good: Appropriate speeds for smooth animation
speed: 0.01  // Smooth and natural

// Good: Clean up when done
animation.destroy();
```

## 📖 API Reference

### Constructor

```javascript
new PerlinDOM(options)
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `play()` | Start or resume animation | `void` |
| `pause()` | Smoothly pause animation | `void` |
| `destroy()` | Stop animation and clean up resources | `void` |
| `init(seed?)` | Reinitialize with optional new seed | `void` |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `lastX` | `number` | Current X offset value |
| `lastY` | `number` | Current Y offset value |
| `isPlaying` | `boolean` | Current animation state |
| `speed` | `number` | Animation speed (writable) |
| `lerpSpeed` | `number` | Transition speed (writable) |

## 🔧 Troubleshooting

### Common Issues

**❓ Animation not visible**
```css
/* Ensure element has positioning */
.my-element {
  position: relative; /* or absolute/fixed */
}
```

**❓ Element jumps on initialization**
- PerlinDOM automatically detects current position
- If element has conflicting inline styles, consider moving to CSS

**❓ Animation too fast/slow**
```javascript
// Adjust speed value
speed: 0.001  // Very slow
speed: 0.01   // Normal
speed: 0.1    // Fast
```

**❓ Percentage values not working**
- Ensure parent container has defined dimensions
- PerlinDOM calculates percentages based on parent size

**❓ Memory leaks**
```javascript
// Always clean up when removing elements
animation.destroy();
```

### Browser DevTools

Monitor performance in DevTools:
- Check for smooth 60fps in Performance tab
- Verify transform properties are being animated (not layout properties)

## 🌐 Browser Compatibility

PerlinDOM works in all modern browsers supporting:

- ✅ **ES6 Modules** (2015+)
- ✅ **requestAnimationFrame** (IE10+)
- ✅ **CSS Transforms** (IE9+)
- ✅ **getComputedStyle** (IE9+)

### Tested Browsers

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### Recent Updates

- **v0.0.3**: Fixed positioning conflicts, improved automatic position detection
- **v0.0.2**: Added percentage support and responsive animations
- **v0.0.1**: Initial release with core Perlin noise animations

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ by [Andres Clua](https://github.com/andresclua)**

*PerlinDOM - Bringing organic motion to the web*
