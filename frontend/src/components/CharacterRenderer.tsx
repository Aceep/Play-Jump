import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface CharacterRendererProps {
  characterType: string;
  width?: number;
  height?: number;
}

const CHARACTER_SPRITES: Record<string, { path: string; frames?: number; rows?: number; cols?: number; frameWidth?: number; frameHeight?: number; scale?: number }> = {
  luneblade: { 
    path: '/assets/Luneblade/Sprite%20Sheet/Idle.png',
    frames: 6,
    scale: 40.0 // Adjust this value (0.5 = half size, 2.0 = double size)
  },
  satyr: { 
    path: '/assets/Satyr/SPRITE_SHEET.png',
    rows: 4, // Number of rows in sprite sheet
    cols: 4, // Number of columns in sprite sheet  
    scale: 1.0 // Adjust this value for satyr size
  }
};

export default function CharacterRenderer({ 
  characterType, 
  width = 300, 
  height = 300 
}: CharacterRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    // Create PixiJS application
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    });

    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    const spriteConfig = CHARACTER_SPRITES[characterType];
    
    console.log('Loading character:', characterType, spriteConfig);
    
    if (spriteConfig) {
      // Load the sprite texture
      PIXI.Assets.load(spriteConfig.path).then((texture) => {
        if (cancelled || !appRef.current || !appRef.current.stage) return;
        console.log('Texture loaded:', spriteConfig.path, 'Size:', texture.width, 'x', texture.height);
        console.log('Sprite config frames:', spriteConfig.frames);
        
        if (spriteConfig.frames || (spriteConfig.rows && spriteConfig.cols)) {
          // Auto-calculate frame dimensions if not provided
          let frameWidth, frameHeight;
          let totalFrames;
          
          if (spriteConfig.rows && spriteConfig.cols) {
            // 2D sprite sheet (rows x columns)
            frameWidth = spriteConfig.frameWidth || (texture.width / spriteConfig.cols);
            frameHeight = spriteConfig.frameHeight || (texture.height / spriteConfig.rows);
            totalFrames = spriteConfig.rows * spriteConfig.cols;
          } else {
            // 1D sprite sheet (horizontal only)
            frameWidth = spriteConfig.frameWidth || (texture.width / spriteConfig.frames!);
            frameHeight = spriteConfig.frameHeight || texture.height;
            totalFrames = spriteConfig.frames!;
          }
          
          console.log('Creating animation with frames:', totalFrames);
          console.log('Frame dimensions:', frameWidth, 'x', frameHeight);
          
          // Animated sprite sheet
          const frames: PIXI.Texture[] = [];
          
          // Extract frames from sprite sheet
          if (spriteConfig.rows && spriteConfig.cols) {
            // Extract from 2D grid
            for (let row = 0; row < spriteConfig.rows; row++) {
              for (let col = 0; col < spriteConfig.cols; col++) {
                const frame = new PIXI.Texture(
                  texture.baseTexture,
                  new PIXI.Rectangle(
                    col * frameWidth,
                    row * frameHeight,
                    frameWidth,
                    frameHeight
                  )
                );
                frames.push(frame);
                console.log('Added frame at row:', row, 'col:', col);
              }
            }
          } else {
            // Extract from horizontal strip
            for (let i = 0; i < totalFrames; i++) {
              const frame = new PIXI.Texture(
                texture.baseTexture,
                new PIXI.Rectangle(
                  i * frameWidth,
                  0,
                  frameWidth,
                  frameHeight
                )
              );
              frames.push(frame);
              console.log('Added frame', i, 'at x:', i * frameWidth);
            }
          }
          
          console.log('Total frames created:', frames.length);
          
          // Create animated sprite
          const animatedSprite = new PIXI.AnimatedSprite(frames);
          animatedSprite.animationSpeed = 0.1; // Adjust animation speed
          animatedSprite.play();
          
          console.log('AnimatedSprite created and playing');
          
          // Scale sprite to fit nicely in the container
          const baseScale = Math.min(
            width / frameWidth,
            height / frameHeight
          );
          const finalScale = baseScale * (spriteConfig.scale || 1.0);
          animatedSprite.scale.set(finalScale);
          
          console.log('Scale set to:', finalScale, '(base:', baseScale, 'x multiplier:', spriteConfig.scale || 1.0, ')');
          
          // Center the sprite
          animatedSprite.anchor.set(0.5);
          animatedSprite.x = width / 2;
          animatedSprite.y = height / 2;
          
          if (!cancelled && appRef.current && appRef.current.stage) {
            appRef.current.stage.addChild(animatedSprite);
          }
          
          console.log('AnimatedSprite added to stage');
          
          // Gentle floating animation
          let elapsed = 0;
          const baseY = height / 2;
          if (appRef.current) {
            appRef.current.ticker.add((delta) => {
              elapsed += delta * 0.05;
              animatedSprite.y = baseY + Math.sin(elapsed) * 8;
            });
          }
        } else {
          console.log('No frames config, using static sprite');
          // Static sprite
          const sprite = new PIXI.Sprite(texture);
          
          // Scale sprite to fit nicely in the container
          const baseScale = Math.min(
            width / sprite.width,
            height / sprite.height
          );
          const finalScale = baseScale * (spriteConfig.scale || 1.0);
          sprite.scale.set(finalScale);
          
          // Center the sprite
          sprite.anchor.set(0.5);
          sprite.x = width / 2;
          sprite.y = height / 2;
          
          if (!cancelled && appRef.current && appRef.current.stage) {
            appRef.current.stage.addChild(sprite);
          }
          
          // Idle animation (gentle floating)
          let elapsed = 0;
          if (appRef.current) {
            appRef.current.ticker.add((delta) => {
              elapsed += delta * 0.05;
              sprite.y = (height / 2) + Math.sin(elapsed) * 8;
            });
          }
        }
      }).catch((error) => {
        console.error('Failed to load sprite:', error);
        
        // Fallback: show colored circle
        if (!cancelled && appRef.current && appRef.current.stage) {
          const graphics = new PIXI.Graphics();
          graphics.beginFill(0x45b7d1);
          graphics.drawCircle(width / 2, height / 2, 50);
          graphics.endFill();
          appRef.current.stage.addChild(graphics);
        }
      });
    }

    // Cleanup
    return () => {
      cancelled = true;
      app.ticker.stop();
      app.destroy(true, { children: true });
    };
  }, [characterType, width, height]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }} 
    />
  );
}
