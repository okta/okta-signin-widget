
import path from 'path';
import fs from 'fs';



export async function saveScreenshot(fileName?: string) {
  const timeStamp = Date.now();
  fileName = fileName || 'shot';
  fileName = `${timeStamp}-${fileName}.png`;
  fileName = fileName.replace(/[^a-z0-9.-]/gi, '-'); // sanitize filename
  const { TMP_LOGS_LOCATION } = process.env;
  const baseDir = TMP_LOGS_LOCATION || path.resolve(__dirname, '../../../build2');
  const dir = path.join(baseDir, 'screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  const relativePath = path.relative('./', filePath);
  console.log(`Saving screenshot to: ${relativePath}`);
  await browser.saveScreenshot(relativePath);
}
