export const CHARACTER_ANIMATIONS = {
  satyr: {
    type: 'sheet',
    src: '/assets/Satyr/SPRITE_SHEET.png',
    frameWidth: 64,
    frameHeight: 64,
    animations: {
      idle:   { row: 0, from: 0, to: 3 },
      walk:   { row: 1, from: 0, to: 3 },
      attack: { row: 2, from: 0, to: 3 },
      cast:   { row: 3, from: 0, to: 3 }
    }
  },
    luneblade: {
    type: 'sheet',
    src: '/assets/Luneblade/Sprite Sheet/Idle.png',
    frameWidth: 64,
    frameHeight: 64,
    animations: {
      idle:   { row: 0, from: 0, to: 5 },
      walk:   { row: 1, from: 0, to: 5 },
      attack: { row: 2, from: 0, to: 5 },
      cast:   { row: 3, from: 0, to: 5 }
    }
  }
};