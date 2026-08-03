const sharp = require('sharp');
const path = require('path');

async function cropAssets() {
  const inputFile = 'assetsgroup.png';
  const outDir = path.join('src', 'assets', 'dashboard');

  try {
    // 1. Wallet (Top-Left)
    await sharp(inputFile)
      .extract({ left: 0, top: 0, width: 512, height: 600 })
      // Use threshold to trim whitespace if background is solid white
      .trim({ threshold: 250, background: '#ffffff' })
      .toFile(path.join(outDir, 'wallet-3d.png'));
      
    // 2. Shield (Top-Right)
    await sharp(inputFile)
      .extract({ left: 512, top: 0, width: 512, height: 600 })
      .trim({ threshold: 250, background: '#ffffff' })
      .toFile(path.join(outDir, 'shield-3d.png'));
      
    // 3. Red Line (Bottom-Left)
    await sharp(inputFile)
      .extract({ left: 0, top: 1000, width: 512, height: 536 })
      .trim({ threshold: 250, background: '#ffffff' })
      .toFile(path.join(outDir, 'trend-down.png'));

    // 4. Green Line (Bottom-Right)
    await sharp(inputFile)
      .extract({ left: 512, top: 1000, width: 512, height: 536 })
      .trim({ threshold: 250, background: '#ffffff' })
      .toFile(path.join(outDir, 'trend-up.png'));

    console.log("Assets cropped successfully.");
  } catch (err) {
    console.error("Error cropping assets:", err);
  }
}

cropAssets();
