import PerlinDOM from "./PerlinDom";
console.log('PerlinDOM loaded');

const elements = document.querySelectorAll('.box');
elements.forEach(el =>
  new PerlinDOM({
    element: el,
    x: { min: -120, max: 120 },
    y: { min: 0, max: 120 },
    speed: 0.001,
    seed: 1
  })
);