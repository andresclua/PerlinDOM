import { span } from './shared.js';
import { panes } from './units.js';

// 11. Mixed units: each axis picks px or % on its own.
export const { snippet, mount } = panes([
  {
    comment: 'Horizontal %, vertical px',
    selector: '.dot-a',
    options: { x: span('30%'), y: span(40), speed: 0.01, seed: 789 },
  },
  {
    comment: 'Horizontal px, vertical %',
    selector: '.dot-b',
    options: { x: span(80), y: span('20%'), speed: 0.01, seed: 789 },
  },
]);
