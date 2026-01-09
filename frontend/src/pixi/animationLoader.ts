import * as PIXI from 'pixi.js';

export async function loadAnimations(config: AnimationConfig) {
  console.group(`🎞️ loadAnimations: ${config.src || 'files'}`);
  console.log('Config:', config);

  if (config.type === 'sheet') {
    console.log('📄 Sprite sheet mode');

    const texture = PIXI.Texture.from(config.src);

    console.log('BaseTexture valid:', texture.baseTexture.valid);

    await texture.baseTexture.resource?.load?.();
    console.log('✅ BaseTexture loaded');
    console.log(
      'Texture size:',
      texture.baseTexture.width,
      texture.baseTexture.height
    );

    const result: Record<string, PIXI.Texture[]> = {};

    for (const [name, anim] of Object.entries(config.animations)) {
      console.group(`▶ Animation "${name}"`);
      console.log('Row:', anim.row);
      console.log('Frame range:', anim.from, '→', anim.to);

      result[name] = [];

      // Skip if row is undefined
      if (anim.row === undefined || anim.from === undefined || anim.to === undefined) {
        console.warn(`⚠️ Skipping animation "${name}" - missing row, from, or to`);
        console.groupEnd();
        continue;
      }

      for (let i = anim.from; i <= anim.to; i++) {
        const rect = new PIXI.Rectangle(
          i * config.frameWidth,
          anim.row * config.frameHeight,
          config.frameWidth,
          config.frameHeight
        );

        console.log(`🧩 Frame ${i}`, rect);

        result[name].push(
          new PIXI.Texture(texture.baseTexture, rect)
        );
      }

      console.log(`Frames loaded: ${result[name].length}`);
      console.groupEnd();
    }

    console.groupEnd();
    return result;
  }

  console.log('📂 Multiple files mode');

  const result: Record<string, PIXI.Texture[]> = {};
  for (const [name, files] of Object.entries(config.animations)) {
    console.group(`▶ Animation "${name}"`);
    result[name] = files.map((src, i) => {
      console.log(`Frame ${i}:`, src);
      return PIXI.Texture.from(src);
    });
    console.groupEnd();
  }

  console.groupEnd();
  return result;
}
