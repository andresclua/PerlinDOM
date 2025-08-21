# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] - 2025-01-07

- **Remove logs** : remove logs

## [0.0.4] - 2025-01-07

### Changed
- **Package Configuration**: Updated package to be public (removed `"private": true`)
- **NPM Publishing**: Package is now available for public installation via npm
- **Module Exports**: Enhanced module exports configuration for better compatibility
- **Package Metadata**: Updated package name to `@andresclua/perlindom` with proper scoping

### Improved
- **Distribution**: Better UMD and ES module support through improved exports configuration
- **Accessibility**: Package now publicly available on npm registry

## [0.0.3] - 2025-01-07

### Fixed
- **Positioning Issue**: Fixed problem where inline styles (`left`, `top`) were conflicting with transform animations, causing double positioning
- **Transform Initialization**: PerlinDOM now properly initializes transform property if it doesn't exist

### Improved
- **Automatic Position Detection**: PerlinDOM now automatically detects and works from the element's current position (CSS or inline styles)
- **Cleaner API**: No need for specific inline styles - elements animate from wherever they are positioned
- **Better Performance**: Improved transform handling for smoother animations

### Documentation
- **README**: Completely restructured with better organization and clearer examples
- **Examples**: Cleaned up HTML examples, moved positioning from inline styles to CSS classes
- **Best Practices**: Added section explaining when to use CSS vs inline styles
- **Troubleshooting**: New section with common issues and solutions

### Code Quality
- **Examples Cleanup**: Removed unnecessary inline styles from demo particles
- **CSS Organization**: Better separation of positioning and styling concerns

## [0.0.2] - 2024-12-XX

### Added
- **Percentage Support**: Added support for percentage-based movement values (`'-10%'`, `'10%'`)
- **Responsive Animations**: Animations now adapt to container size changes
- **Mixed Values**: Support for mixing pixel and percentage values in same animation
- **Window Resize Handling**: Automatic recalculation when using percentage values

### Features
- **2D Perlin Noise**: Enhanced noise generation for more natural movement patterns
- **Smooth Transitions**: Improved lerp-based pause/play functionality
- **Performance Optimization**: Better requestAnimationFrame usage

## [0.0.1] - 2024-11-XX

### Added
- **Initial Release**: Basic PerlinDOM functionality
- **Core Animation**: Smooth organic animations using Perlin noise
- **Basic API**: Constructor with element, x/y ranges, speed, and seed options
- **Control Methods**: `play()`, `pause()`, `destroy()`, and `init()` methods
- **Transform-based Movement**: CSS transform animations for better performance

### Features
- **Perlin Noise Generation**: Custom implementation with seeded random generation
- **Configurable Ranges**: Separate X and Y movement ranges
- **Speed Control**: Adjustable animation speed
- **Seed Support**: Reproducible animations with custom seeds
- **Element Positioning**: Automatic relative positioning for static elements

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
- **Improved**: Performance or usability improvements
- **Documentation**: Documentation changes
- **Code Quality**: Code organization and cleanup
