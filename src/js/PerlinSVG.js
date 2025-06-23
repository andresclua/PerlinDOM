import PerlinDOM from './PerlinDom.js';

/**
 * PerlinSVG - Clase para animar paths SVG usando ruido Perlin
 * 
 * Esta clase extiende PerlinDOM para proporcionar animaciones orgánicas
 * a elementos SVG path, creando efectos de ondulación fluidos y naturales.
 */
class PerlinSVG extends PerlinDOM {
  /**
   * Constructor de PerlinSVG
   * 
   * @param {Object} options - Opciones de configuración
   * @param {Element|Element[]} options.element - El/los elemento(s) SVG path a animar
   * @param {number} options.numPoints - Número de puntos de control para cada path (más puntos = curvas más detalladas)
   * @param {number} options.amplitude - Amplitud máxima de la animación (altura de las ondas en píxeles)
   * @param {boolean} options.isOpen - Estado inicial (true = abierto/visible, false = cerrado/oculto)
   * @param {number} options.speed - Velocidad de la animación (valores más altos = movimiento más rápido)
   * @param {number} options.seed - Semilla para el generador de ruido Perlin (misma semilla = mismo patrón)
   * @param {number} options.lerpSpeed - Velocidad de interpolación entre estados (valores más altos = transiciones más rápidas)
   * @param {number} options.delayPointsMax - Retraso máximo aleatorio para cada punto (crea efectos de cascada)
   * @param {number} options.delayPerPath - Retraso entre capas/paths consecutivos (crea efecto escalonado)
   */
  constructor({
    element,                // El/los elemento(s) SVG path a animar
    numPoints = 10,         // Número de puntos de control (más puntos = curvas más detalladas)
    amplitude = 100,        // Amplitud máxima de la animación (altura de las ondas)
    isOpen = false,         // Estado inicial (true = abierto/visible, false = cerrado/oculto)
    speed = 0.01,           // Velocidad de la animación (valores más altos = movimiento más rápido)
    seed = 0,               // Semilla para el generador de ruido Perlin (misma semilla = mismo patrón)
    lerpSpeed = 0.1,        // Velocidad de interpolación entre estados
    delayPointsMax = 0.3,   // Retraso máximo aleatorio para cada punto (crea efectos de cascada)
    delayPerPath = 0.25     // Retraso entre capas/paths consecutivos (crea efecto escalonado)
  }) {
    // Call parent constructor with null element
    // since we'll handle the SVG differently
    super({
      element: null,
      speed: speed,
      seed: seed,
      lerpSpeed: lerpSpeed
    });
    
    // SVG specific properties
    this.svgElement = element;
    this.paths = Array.isArray(element) ? element : [element];
    this.numPoints = numPoints;
    this.amplitude = amplitude;
    this.isOpen = isOpen;
    this.delayPointsMax = delayPointsMax;
    this.delayPerPath = delayPerPath;
    this.isAnimating = false;
    
    // Arrays to store points and delays
    this.allPoints = [];
    this.pointsDelay = [];
    
    // Initialize points and delays
    this.initPoints();
    
    // Add click event
    if (this.paths.length > 0 && this.paths[0].ownerSVGElement) {
      this.paths[0].ownerSVGElement.addEventListener('click', () => this.toggle());
    }
  }
  
  // Initialize points for all paths
  initPoints() {
    // Initialize delays for points
    for (let i = 0; i < this.numPoints; i++) {
      this.pointsDelay[i] = Math.random() * this.delayPointsMax;
    }
    
    // Initialize points for each path
    for (let i = 0; i < this.paths.length; i++) {
      let points = [];
      this.allPoints.push(points);
      
      for (let j = 0; j < this.numPoints; j++) {
        points.push(this.isOpen ? 0 : this.amplitude);
      }
    }
    
    // Render initial paths
    this.render();
  }
  
  // Toggle between open/closed states
  toggle() {
    if (this.isAnimating) return;
    
    this.isOpen = !this.isOpen;
    this.isAnimating = true;
    
    // Schedule animations for each point with Perlin noise-based delays
    const startTime = performance.now();
    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      let stillAnimating = false;
      
      // Update all points
      for (let i = 0; i < this.paths.length; i++) {
        const pathDelay = this.delayPerPath * 1000 * (this.isOpen ? i : (this.paths.length - i - 1));
        
        for (let j = 0; j < this.numPoints; j++) {
          const pointDelay = this.pointsDelay[j] * 1000; // Convert to ms
          const totalDelay = pointDelay + pathDelay;
          
          if (elapsed > totalDelay) {
            // Calculate animation progress
            const animProgress = Math.min(1, (elapsed - totalDelay) / (1000 * this.lerpSpeed * 5));
            
            // Target value
            const targetValue = this.isOpen ? 0 : this.amplitude;
            
            // Interpolate towards target
            if (Math.abs(this.allPoints[i][j] - targetValue) > 0.1) {
              // Use Perlin noise to add natural variation
              const noiseValue = this.noise.perlin2(j * 0.1, i * 0.1 + this.time);
              const variation = noiseValue * 2; // Small variation
              
              // Use our own lerp function since we can't access the private one
              this.allPoints[i][j] = this.lerp(
                this.allPoints[i][j],
                targetValue + (this.isOpen ? 0 : variation), // Only add variation in closed state
                animProgress
              );
              
              stillAnimating = true;
            } else {
              this.allPoints[i][j] = targetValue;
            }
          } else {
            stillAnimating = true;
          }
        }
      }
      
      // Update the display
      this.render();
      
      // Continue animation if needed
      if (stillAnimating) {
        this.raf = requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
      }
      
      // Update time for Perlin noise
      this.time += this.speed;
    };
    
    // Start animation
    this.raf = requestAnimationFrame(animate);
  }
  
  // Render SVG paths
  render() {
    for (let i = 0; i < this.paths.length; i++) {
      const path = this.paths[i];
      const points = this.allPoints[i];
      
      let d = "";
      d += this.isOpen ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;
      
      for (let j = 0; j < this.numPoints - 1; j++) {
        let p = (j + 1) / (this.numPoints - 1) * 100;
        let cp = p - (1 / (this.numPoints - 1) * 100) / 2;
        d += ` ${cp} ${points[j]} ${cp} ${points[j+1]} ${p} ${points[j+1]}`;
      }
      
      d += this.isOpen ? ` V 100 H 0` : ` V 0 H 0`;
      path.setAttribute("d", d);
    }
  }
  
  // Override parent's animate method
  // so it doesn't interfere with our custom animation
  animate = () => {
    // We don't do anything here, as we handle animation in toggle()
    this.raf = requestAnimationFrame(this.animate);
  };
  
  // Our own lerp function since we can't access the private one from PerlinDOM
  lerp(a, b, t) {
    return a + t * (b - a);
  }
}

export default PerlinSVG;
