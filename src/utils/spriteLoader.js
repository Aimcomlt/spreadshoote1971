const spriteSources = {
  bullets: 'bullets.png',
  enemies: 'enemy_ships.png',
  explosion: 'explosion_sheet.png',
  levelComplete: 'level_complete.png',
  mainMenu: 'main_menu.png',
  powerups: 'powerups.png',
};

export default function loadSprites() {
  const promises = Object.entries(spriteSources).map(([key, file]) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = `${process.env.PUBLIC_URL}/images/${file}`;
      img.onload = () => resolve([key, img]);
      img.onerror = reject;
    });
  });

  return Promise.all(promises).then((entries) =>
    entries.reduce((acc, [key, img]) => {
      acc[key] = img;
      return acc;
    }, {})
  );
}
