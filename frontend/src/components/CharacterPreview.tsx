// src/components/CharacterPreview.tsx
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { loadAnimations } from '../pixi/animationLoader';
import { CHARACTER_ANIMATIONS } from '../assets/CharacterAnimation';

interface Props {
  type: string;
  color: string;
  scale?: number;
}

export function CharacterPreview({ type, color, scale = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    const app = new PIXI.Application({
      width: 150,
      height: 150,
      backgroundColor: parseInt(color.replace('#', '0x')),
      antialias: true
    });

    ref.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    loadAnimations(CHARACTER_ANIMATIONS[type]).then((animations) => {
      if (cancelled || !appRef.current || !appRef.current.stage) return;
      
      const sprite = new PIXI.AnimatedSprite(animations.idle);

      // Center sprite using actual canvas dimensions
      sprite.anchor.set(0.5);
      sprite.x = appRef.current.screen.width / 2;
      sprite.y = appRef.current.screen.height / 2;
      sprite.animationSpeed = 0.12;
      sprite.play();

      const frame = animations.idle[0];
      const baseScale = Math.min(120 / frame.width, 120 / frame.height);
      sprite.scale.set(baseScale * scale);

      appRef.current.stage.addChild(sprite);

      // Add gentle floating animation
      let elapsed = 0;
      const centerY = appRef.current.screen.height / 2;
      appRef.current.ticker.add((delta) => {
        elapsed += delta * 0.05;
        sprite.y = centerY + Math.sin(elapsed) * 5;
      });
    }).catch(() => {
      // Ignore errors if component unmounted/destroyed
    });


    return () => {
      cancelled = true;
      const current = appRef.current;
      if (current) {
        try {
          current.ticker.stop();
          current.destroy(true, { children: true });
        } finally {
          const view = current.view as HTMLCanvasElement | undefined;
          if (view && view.parentNode) {
            view.parentNode.removeChild(view);
          }
          appRef.current = null;
        }
      }
    };
  }, [type, color, scale]);

  return <div ref={ref} className="character-icon" />;
}
