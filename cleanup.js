const fs = require("fs");
const readimage = require("readimage");
const Jimp = require("jimp");
const { crc32 } = require('crc');
const stringToEmoji = require('./string_to_emoji')

// Settings
const imageFolder = "./glitters";
const folders = [
  "generic",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
  "new-year",
  "easter",
  "liberation",
  "valentine",
  "halloween",
  "christmas",
  "welcome"
];
const fileName = "images.json";

const data = {};

for (const folder of folders) {
  let images = [];
  const files = fs.readdirSync(`${imageFolder}/${folder}`);
  for (const file of files) {
    if (file.match(/\.((?:gif|jpg|png))(?:[\?#]|$)/i)) {
      const path = `${imageFolder}/${folder}`;
      const hash = crc32(fs.readFileSync(`${path}/${file}`, "utf8")).toString(
        16
      );
      const emojiHash = stringToEmoji(hash);
      const filetype = file.split(".").pop();
      const name = `${emojiHash}.${filetype}`;

      // Check if gifs have multiple frames
      if (filetype == "gif") {
        var gifFile = fs.readFileSync(`${path}/${file}`);
        readimage(gifFile, function(err, image) {
          if (err) {
            console.log("failed to parse the image");
            console.log(err);
          }
          const frames = image.frames.length;
          // If a gif has only a single frame it gets converted into a PNG file
          // so Telegram will show it properly
          if (frames === 1) {
            const pngName = `${path}/${hash}.png`;
            console.log(`${path}/${name} has 1 frame, converting to PNG`);
            Jimp.read(gifFile, (err, image) => {
              if (err) throw err;
              image.write(pngName);
              images.push(pngName);
              // Remove the old gif file
              try {
                fs.unlinkSync(`${path}/${file}`);
              } catch (err) {
                console.error(err);
              }
            });
            // Otherwise also only rename the file
          } else {
            fs.renameSync(`${path}/${file}`, `${path}/${name}`);
            images.push(name);
          }
        });
        // Rename all non gif files right away
      } else {
        fs.renameSync(`${path}/${file}`, `${path}/${name}`);
        images.push(name);
      }
    }
  }
  data[folder] = images;
}

fs.writeFile(`${imageFolder}/${fileName}`, JSON.stringify(data), err => {
  if (err) throw err;
  console.log("images.json saved");
});
