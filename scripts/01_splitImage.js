// npm install sharp

const sharp = require("sharp");
const fs = require("fs");
// Downloaded from https://raw.githubusercontent.com/larvalabs/cryptopunks/master/punks.png
const punkspng = "punks.png";
const OUTPUTFILE = "../docs/punkImages.js";

async function doit() {
  console.log("Output to: " + OUTPUTFILE);
  const images = [];
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const punkId = y * 100 + x;
      console.log("Processing: " + punkId);
      const image = sharp(punkspng);
      await image
        .extract({ left: x * 24, top: y * 24, width: 24, height: 24 })
        .png()
        .toBuffer()
        .then(buffer => {
          const base64String = buffer.toString('base64');
          images.push(base64String);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
  console.log("Images: " + Object.keys(images).length);
  fs.writeFile(OUTPUTFILE, "// Prefix with 'data:image/png;base64,'\nconst PUNK_IMAGES=\[\n" + images.map(e => "  \"" + e + "\"").join(",\n") + "\n\];\n", (err) => {
    if (err) throw err;
    console.log('Data written to ' + OUTPUTFILE);
  });
}
doit();

console.log(process.cwd());
