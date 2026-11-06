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
- [Amplitude and target](#-amplitude-and-target)
- [Use with GSAP + ScrollTrigger](#-use-with-gsap--scrolltrigger)
- [Examples](#-examples)
- [Best Practices](#-best-practices)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Browser Compatibility](#-browser-compatibility)
- [Live site](#-live-site)
- [Changelog](#-changelog)
- [License](#-license)

## ✨ Features

- **🌊 Organic Animations**: Natural movements using Perlin noise that avoid mechanical rigidity
- **📱 Responsive Design**: Support for percentage-based values that adapt to container size
- **🎯 Smart Positioning**: Automatically works from element's current position (CSS or inline styles)
- **⚡ High Performance**: Uses `transform` and one shared `requestAnimationFrame` loop for all instances; instances scrolled out of the viewport pause automatically
- **🧲 Amplitude & Target**: Scale the drift from 0 to 1 and pin elements to a target position, ideal for scroll-driven effects
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

Instances start playing as soon as they are created. PerlinDOM sets `position: relative` itself if the element is `static`, and animates from wherever the element is laid out.

## ⚙️ Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `element` | `HTMLElement \| null` | `undefined` | The DOM element to animate. Optional: with `null` only `lastX` / `lastY` are computed |
| `x` | `Object \| null` | `null` | Horizontal movement: `{min: number, max: number}` |
| `y` | `Object \| null` | `null` | Vertical movement: `{min: number, max: number}` |
| `speed` | `number` | `0.01` | Animation speed (lower = slower) |
| `seed` | `number` | `0` | Seed for reproducible patterns |
| `lerpSpeed` | `number` | `0.1` | Transition smoothness for pause/play |
| `preserveBaseTranslation` | `boolean` | `false` | Keep the element's CSS `translate` (e.g. `translate(-50%, -50%)`); by default it is dropped and only scale/rotate/skew are kept |
| `amplitude` | `number` | `1` | Strength of the drift, clamped to `[0, 1]`; non-numbers become `1`. `1` = free drift, `0` = pinned to `target` (or the base position) |
| `target` | `{x, y} \| null` | `null` | Offset in px from the element's base position that `amplitude` pulls toward. Coordinates that are not finite numbers become `0` |
| `pauseOffscreen` | `boolean` | `true` | Skip frames while the element's parent is outside the viewport. `false` keeps it running everywhere |

### Value Types

- **Pixels**: `{ min: -50, max: 50 }` - Fixed pixel movement
- **Percentages**: `{ min: '-10%', max: '10%' }` - Relative to the parent's `clientWidth` / `clientHeight` (padding included), re-read every frame. They need an `element` (with `element: null` they produce `NaN`)
- **Mixed**: `x: { min: '-5%', max: '5%' }, y: { min: -20, max: 20 }`
- **Single Axis**: Set unused axis to `null`

## 🎚️ Amplitude and Target

`amplitude` scales how far the noise moves the element. `target` is where it settles as `amplitude` goes to `0`: an `{ x, y }` offset in px from the element's base position (the object is copied). Without a `target` the element settles on its base position.

```javascript
const dot = new PerlinDOM({
  element: document.querySelector('.dot'),
  x: { min: -120, max: 120 },
  y: { min: -120, max: 120 },
  target: { x: 40, y: -20 }
});

dot.amplitude = 0.5;               // half the drift, pulled toward the target
dot.amplitude = 0;                 // pinned at { x: 40, y: -20 }
dot.setTarget({ x: 0, y: 0 });     // move the target; setTarget(null) removes it
dot.amplitude = 1;                 // free drift again
```

## 🎬 Use with GSAP + ScrollTrigger

PerlinDOM owns the element's `transform`, so GSAP must not write `transform` (`x`, `y`, `scale`, ...) on the same element. Tween `amplitude` instead; to move an element with GSAP and drift it too, put PerlinDOM on a wrapper or a child.

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PerlinDOM from '@andresclua/perlindom';

gsap.registerPlugin(ScrollTrigger);

const shape = [{ x: 0, y: -80 }, { x: 70, y: 40 }, { x: -70, y: 40 }]; // one { x, y } per .dot

const instances = [...document.querySelectorAll('.dot')].map((el, i) =>
  new PerlinDOM({
    element: el,
    x: { min: -120, max: 120 },
    y: { min: -120, max: 120 },
    seed: i * 7919,
    target: shape[i], // { x, y } offsets that draw your shape
  })
);

const state = { amplitude: 1 };
gsap.to(state, {
  amplitude: 0,
  ease: 'none',
  scrollTrigger: { trigger: '.scene', start: 'top top', end: '+=1000', pin: true, scrub: 0.8 },
  onUpdate: () => instances.forEach(inst => { inst.amplitude = state.amplitude; }),
});
```

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
  transform: translate(-50%, -50%); /* centring translate */
}
```

```javascript
new PerlinDOM({
  element: document.querySelector('.floating-card'),
  x: { min: -20, max: 20 },
  y: { min: -15, max: 15 },
  speed: 0.008,
  seed: 42,
  preserveBaseTranslation: true // keep the centring translate
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
  if (!animation) {
    animation = new PerlinDOM({
      element: button.querySelector('.effect'),
      x: { min: -5, max: 5 },
      y: { min: -5, max: 5 },
      speed: 0.02,
      lerpSpeed: 0.15
    });
  } else {
    animation.play();
  }
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

- **Position with CSS, not with `translate`**: Use `left`/`top`, margins, grid or flex. A CSS `translate` is dropped unless you pass `preserveBaseTranslation: true`
- **One instance per element**: Two instances on the same element overwrite each other's transform
- **Use percentage values for responsive designs**: Great for mobile-friendly animations
- **Choose appropriate speeds**: Start with `0.01` and adjust based on desired effect
- **Clean up animations**: Call `destroy()` when removing elements from DOM

### ❌ Don't

- **Don't tween `transform` with another library on the same element**: PerlinDOM writes it every frame (see the GSAP recipe above)
- **Don't forget to destroy**: A live instance keeps a reference to its element, so call `destroy()` before removing it
- **Don't use extreme speeds**: Above about `0.05` the motion turns jittery
- **Don't forget reduced motion**: PerlinDOM does not check `prefers-reduced-motion`, so skip creating instances when it is set

### 🎯 Performance Tips

```javascript
// Good: Many instances are cheap, they all share one requestAnimationFrame loop
// and pause on their own while scrolled out of view

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
new PerlinDOM(options) // options: see Configuration
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `play()` | Resume after `pause()` (instances start playing on construction) | `void` |
| `pause()` | Smoothly pause animation | `void` |
| `destroy()` | Stop animation, restore the original inline `transform` and clean up | `void` |
| `init(seed?)` | Rebuild the noise from `seed` (without an argument: seed `0`, not the constructed seed; `time` is not reset) and restart playback, also after `destroy()` | `void` |
| `setTarget({x, y} \| null)` | Set the target offset in px; non-finite coordinates become `0`, the object is copied, `null` removes it | `void` |
| `refreshBaseTransform(preserveTranslation?)` | Re-read the element's CSS transform after classes or styles changed | `void` |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `lastX` | `number` | Current X offset value |
| `lastY` | `number` | Current Y offset value |
| `isPlaying` | `boolean` | Current animation state |
| `speed` | `number` | Animation speed (writable) |
| `lerpSpeed` | `number` | Transition speed (writable) |
| `amplitude` | `number` | Drift strength, clamped to `[0, 1]`, non-numbers reset to `1` (writable) |
| `target` | `{x, y} \| null` | Current target offset (set it with `setTarget()`) |
| `xRange` / `yRange` | `Object \| null` | Movement ranges (writable; whether percentages are used is fixed at construction) |

## 🔧 Troubleshooting

### Common Issues

**❓ Animation not visible**
- Set at least one of `x` / `y`
- The element must not be `display: inline` (e.g. a plain `<span>`): transforms do not apply to inline boxes. Use `inline-block` or `block`
- Static positioning is not the problem: PerlinDOM sets `position: relative` itself

**❓ Element jumps on initialization**
- Usually a CSS `translate`, such as `translate(-50%, -50%)` for centring, which PerlinDOM drops by default
- Pass `preserveBaseTranslation: true`, or centre with `left: calc(50% - half)` or margins

**❓ Animation too fast/slow**
```javascript
// Adjust speed value
speed: 0.001  // Very slow
speed: 0.01   // Normal
speed: 0.1    // Fast
```

**❓ Percentage values not working**
- Ensure parent container has defined dimensions
- Percentages use the parent's `clientWidth` / `clientHeight`, and need an `element`

**❓ Element stops moving while off screen**
- Intended: instances pause while their element's parent is outside the viewport and resume when it returns (needs `IntersectionObserver`; without it everything keeps running). The parent is watched, not the element, so an element's own drift never pauses it. Changing `amplitude` or calling `setTarget()` still renders while paused. Pass `pauseOffscreen: false` to never pause

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

The npm build (`dist/`) targets browsers with native ES modules and ES2020: **Chrome 87+, Edge 88+, Firefox 78+, Safari 14+**. Importing the source file directly needs private class methods and `??=`: Chrome 85+, Edge 85+, Firefox 90+, Safari 15+.

- `requestAnimationFrame`, `getComputedStyle` and CSS transforms are required
- `DOMMatrixReadOnly` separates the CSS translate from scale/rotate/skew; without it the computed transform is used as it is
- `IntersectionObserver` powers the offscreen pause; without it everything keeps running

## 🔗 Live site

Full reference and live demos: [`src/api.html`](./src/api.html) and [`src/examples.html`](./src/examples.html) (home: [`src/index.html`](./src/index.html)).
<!-- TODO: site URL -->

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### Recent Updates

- **v0.0.6**: Enhanced PerlinDOM to preserve design transforms
- **v0.0.4**: Package now public on npm, enhanced module exports configuration
- **v0.0.3**: Fixed positioning conflicts, improved automatic position detection
- **v0.0.2**: Added percentage support and responsive animations
- **v0.0.1**: Initial release with core Perlin noise animations

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ by [Andres Clua](https://github.com/andresclua)**

*PerlinDOM - Bringing organic motion to the web*
