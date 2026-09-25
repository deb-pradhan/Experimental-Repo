// Render a local HTML/SVG file to PNG with the container's Chromium.
// usage: node tools/shot.js in.html out.png [w] [h]
const {chromium} = require('playwright');
(async () => {
  const [,, inp, out, w = '1200', h = '600'] = process.argv;
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p = await b.newPage({viewport: {width: +w, height: +h}});
  await p.goto('file://' + require('path').resolve(inp));
  await p.waitForTimeout(300);
  await p.screenshot({path: out});
  await b.close();
})();
