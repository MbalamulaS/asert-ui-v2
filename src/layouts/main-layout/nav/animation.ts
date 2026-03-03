import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export const animations = [
  trigger('submenu', [
    state(
      'closed',
      style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
      }),
    ),
    state(
      'open',
      style({
        height: '*',
        opacity: 1,
        overflow: 'hidden',
      }),
    ),
    transition('closed <=> open', [animate('300ms ease-in-out')]),
  ]),
];
