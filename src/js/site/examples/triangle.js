import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { span } from './shared.js';

// 8. No element at all: the instance only computes lastX / lastY, and the page uses them
// to move one vertex of an SVG clip-path triangle.
export const OPTIONS = { x: span(30), y: span(20), speed: 0.005, seed: 7 };
export const TOP = { x: 150, y: 50 };
export const REST = '250,250 50,250';
export const COMMENTS = { element: 'nothing to move, values only' };

export const snippet = `const polygon = document.querySelector('#triangle-clip polygon');
const apex = ${literal(TOP)};

const vertex = new PerlinDOM(${literal({ element: null, ...OPTIONS }, { comments: COMMENTS })});

function frame() {
  const x = apex.x + vertex.lastX;
  const y = apex.y + vertex.lastY;
  polygon.setAttribute('points', \`\${x},\${y} ${REST}\`);
  requestAnimationFrame(frame);
}
frame();`;

export function mount(card) {
  const polygon = card.querySelector('.ex-triangle polygon');
  const marker = card.querySelector('.ex-triangle__vertex');
  const vertex = new PerlinDOM({ element: null, ...OPTIONS });
  let raf = requestAnimationFrame(function frame() {
    const x = TOP.x + vertex.lastX;
    const y = TOP.y + vertex.lastY;
    polygon.setAttribute('points', `${x},${y} ${REST}`);
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', y);
    raf = requestAnimationFrame(frame);
  });
  return {
    pause: () => vertex.pause(),
    play: () => vertex.play(),
    destroy() {
      cancelAnimationFrame(raf);
      vertex.destroy();
      polygon.setAttribute('points', `${TOP.x},${TOP.y} ${REST}`);
      marker.setAttribute('cx', TOP.x);
      marker.setAttribute('cy', TOP.y);
    },
  };
}
