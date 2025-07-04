class PerlinDOM {
    /* ---------- helpers privados y estáticos ---------- */
    static #mulberry32(a) {
      return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
  
    static #generatePermutation(seed = 0) {
      const permutation = Array.from({ length: 256 }, (_, i) => i);
      const rand = PerlinDOM.#mulberry32(seed);
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
      }
      return permutation.concat(permutation);
    }

    // Helper to check if a value is a percentage string
    static #isPercentage(value) {
      return typeof value === 'string' && value.endsWith('%');
    }

    // Helper to convert percentage to pixels
    static #percentToPixels(percentage, dimension) {
      if (!PerlinDOM.#isPercentage(percentage)) return percentage;
      const value = parseFloat(percentage);
      return (value / 100) * dimension;
    }
  
    constructor({
      element,
      x = null,
      y = null,
      speed = 0.01,
      seed = 0,
      lerpSpeed = 0.1
    }) {
      this.el = element;
      this.xRange = x;
      this.yRange = y;
      this.speed = speed;
      this.time = seed;
      this.isPlaying = true;
      this.lerpFactor = 1; // 1 = full speed, 0 = paused
      this.lerpSpeed = lerpSpeed; // How fast to transition between play/pause states
      this.targetLerpFactor = 1; // Target state (1 = play, 0 = pause)
      this.lastX = 0;
      this.lastY = 0;
      
      // Check if we have percentage values
      this.hasPercentages = false;
      if (x && (PerlinDOM.#isPercentage(x.min) || PerlinDOM.#isPercentage(x.max)) ||
          y && (PerlinDOM.#isPercentage(y.min) || PerlinDOM.#isPercentage(y.max))) {
        this.hasPercentages = true;
      }
  
      // Solo inicializar estas propiedades si el elemento no es null
      if (element) {
        // Ensure element has positioning for transform to work properly
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'static') {
          element.style.position = 'relative';
        }
        
        // Initialize transform if it doesn't exist
        const currentTransform = computedStyle.transform;
        if (!currentTransform || currentTransform === 'none') {
          element.style.transform = 'translate3d(0px, 0px, 0px)';
        }
        
        // If using percentages, add resize listener
        if (this.hasPercentages) {
          this.handleResize = this.handleResize.bind(this);
          window.addEventListener('resize', this.handleResize);
        }
      }
      
      this.animate = this.animate.bind(this);
      
      this.init(seed);
    }
    
  init(seed) {
      this.noise = this.#createPerlin(PerlinDOM.#generatePermutation(seed));
      this.isPlaying = true;
      this.lerpFactor = 1;
      this.targetLerpFactor = 1;
      this.raf = requestAnimationFrame(this.animate);
      console.log('PerlinDOM initialized');
    }
    
  // Handle window resize for percentage-based values
  handleResize() {
      // Only recalculate if we're using percentages
      if (this.hasPercentages && this.el) {
        // Force a recalculation on next animation frame
        this.needsRecalculation = true;
      }
    }
    
  pause() {
      if (this.isPlaying) {
        this.targetLerpFactor = 0; // Target paused state
        this.isPlaying = false;
        console.log('PerlinDOM pausing...');
      }
    }
    
  play() {
      if (!this.isPlaying) {
        this.targetLerpFactor = 1; // Target playing state
        this.isPlaying = true;
        
        // Only start a new animation frame if we're completely paused
        if (this.lerpFactor === 0) {
          this.raf = requestAnimationFrame(this.animate);
        }
        
        console.log('PerlinDOM playing...');
      }
    }
  
    #createPerlin(p) {
      const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
      const lerp = (t, a, b) => a + t * (b - a);
      
      // Enhanced gradient function for 2D
      const grad2D = (hash, x, y) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : 0);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };
      
      // 1D gradient (kept for backward compatibility)
      const grad1D = (hash, x) => (hash & 1 ? -x : x);
      
      return {
        // Original 1D Perlin noise function
        perlin1(x) {
          const X = Math.floor(x) & 255;
          x -= Math.floor(x);
          const u = fade(x);
          return lerp(u, grad1D(p[X], x), grad1D(p[X + 1], x - 1));
        },
        
        // New 2D Perlin noise function
        perlin2(x, y) {
          // Integer parts of coordinates
          const X = Math.floor(x) & 255;
          const Y = Math.floor(y) & 255;
          
          // Fractional parts of coordinates
          x -= Math.floor(x);
          y -= Math.floor(y);
          
          // Fade curves for x and y
          const u = fade(x);
          const v = fade(y);
          
          // Hash coordinates of the 4 square corners
          const A = p[X] + Y;
          const B = p[X + 1] + Y;
          const AA = p[A];
          const AB = p[A + 1];
          const BA = p[B];
          const BB = p[B + 1];
          
          // Blend the four corner gradients
          return lerp(
            v,
            lerp(
              u,
              grad2D(p[AA], x, y),
              grad2D(p[BA], x - 1, y)
            ),
            lerp(
              u,
              grad2D(p[AB], x, y - 1),
              grad2D(p[BB], x - 1, y - 1)
            )
          );
        }
      };
    }
  
    #lerp(a, b, t) {
      return a + t * (b - a);
    }
  
    animate = () => {
      // Update lerp factor towards target
      if (this.lerpFactor !== this.targetLerpFactor) {
        this.lerpFactor = this.#lerp(
          this.lerpFactor, 
          this.targetLerpFactor, 
          this.lerpSpeed
        );
        
        // Snap to target if very close
        if (Math.abs(this.lerpFactor - this.targetLerpFactor) < 0.001) {
          this.lerpFactor = this.targetLerpFactor;
        }
      }
      
      // Only update time if not completely paused
      if (this.lerpFactor > 0) {
        // Scale time increment by lerp factor for smooth speed transition
        this.time += this.speed * this.lerpFactor;
        
        // Use 2D Perlin noise for more natural movement
        // We use time for one dimension and a fixed offset for the other
        // This creates a path through the 2D noise field
        const noiseX = this.noise.perlin2(this.time, 0);
        const noiseY = this.noise.perlin2(this.time, 100); // Different slice of the noise field
    
        // Only process if we have an element
        if (this.el) {
          let minX, maxX, minY, maxY;
          
          // Get parent dimensions for percentage calculations if needed
          if (this.hasPercentages) {
            const parent = this.el.parentElement || document.body;
            const parentWidth = parent.clientWidth;
            const parentHeight = parent.clientHeight;
            
            // Convert percentage values to pixels if needed
            if (this.xRange) {
              minX = PerlinDOM.#isPercentage(this.xRange.min) 
                ? PerlinDOM.#percentToPixels(this.xRange.min, parentWidth)
                : this.xRange.min;
              
              maxX = PerlinDOM.#isPercentage(this.xRange.max)
                ? PerlinDOM.#percentToPixels(this.xRange.max, parentWidth)
                : this.xRange.max;
            }
            
            if (this.yRange) {
              minY = PerlinDOM.#isPercentage(this.yRange.min)
                ? PerlinDOM.#percentToPixels(this.yRange.min, parentHeight)
                : this.yRange.min;
              
              maxY = PerlinDOM.#isPercentage(this.yRange.max)
                ? PerlinDOM.#percentToPixels(this.yRange.max, parentHeight)
                : this.yRange.max;
            }
          } else {
            // Use the original values if not using percentages
            minX = this.xRange?.min;
            maxX = this.xRange?.max;
            minY = this.yRange?.min;
            maxY = this.yRange?.max;
          }
          
          // Calculate the actual pixel values
          const valX = this.xRange
            ? this.#map(noiseX, -1, 1, minX, maxX)
            : 0;
      
          const valY = this.yRange
            ? this.#map(noiseY, -1, 1, minY, maxY)
            : 0;
          
          // Store current values for interpolation
          this.lastX = valX;
          this.lastY = valY;
      
          // Update position using transform for better performance
          this.el.style.transform = `translate3d(${valX}px, ${valY}px, 0)`;
        } else {
          // If no element, just calculate and store the values
          const valX = this.xRange
            ? this.#map(noiseX, -1, 1, this.xRange.min, this.xRange.max)
            : 0;
      
          const valY = this.yRange
            ? this.#map(noiseY, -1, 1, this.yRange.min, this.yRange.max)
            : 0;
          
          // Store current values for interpolation
          this.lastX = valX;
          this.lastY = valY;
        }
      }
  
      // Continue animation if not completely paused or still transitioning
      if (this.lerpFactor > 0 || this.targetLerpFactor > 0) {
        this.raf = requestAnimationFrame(this.animate);
      }
    };
  
    #map(n, inMin, inMax, outMin, outMax) {
      return ((n - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
  
    destroy() {
      cancelAnimationFrame(this.raf);
      
      // Remove resize listener if it was added
      if (this.hasPercentages) {
        window.removeEventListener('resize', this.handleResize);
      }
    }
  }
  export default PerlinDOM;
