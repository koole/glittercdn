import test from "ava";
import fs from "fs";
import axios from "axios";
import readimage from "readimage";
import { crc32 } from "crc";

const source = "https://super.vette.website";
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
  "welcome",
  "congratulations"
];
const indexFile = "images.json";

const allFiles = () => {
  let files = [];
  for (const folder of folders) {
    const fileList = fs.readdirSync(`${imageFolder}/${folder}`);
    for (const file of fileList) {
      const path = `${imageFolder}/${folder}`;
      files.push({ file, path, folder });
    }
  }
  return files;
};

test.cb("Test if files are hashed correctly", t => {
  for (const { file, path } of allFiles()) {
    const hash = crc32(fs.readFileSync(`${path}/${file}`, "utf8")).toString(16);
    t.is(
      file,
      hash + "." + file.split(".").pop(),
      `${path}/${file} is not hashed correctly. Please run cleanup.js.`
    );
  }
  t.end();
});

test.cb("Test if all gifs have multiple frames", t => {
  for (const { file, path } of allFiles()) {
    const filetype = file.split(".").pop();
    if (filetype == "gif") {
      var gifFile = fs.readFileSync(`${path}/${file}`);
      readimage(gifFile, function(err, image) {
        if (err) {
          t.fail(`${path}/${file} is not a valid image.`);
        }
        t.not(
          image.frames.length,
          1,
          `${path}/${file} only has a single frame. Run cleanup.js to convert to png.`
        );
      });
    }
  }
  t.end();
});

test.cb("Test is there are only png, gif and jpg files", t => {
  for (const { file, path } of allFiles()) {
    const filetype = file.split(".").pop();
    t.true(
      ["png", "gif", "jpg"].includes(filetype),
      `${path}/${file} is not a png, gif or jpg.`
    );
  }
  t.end();
});

test.cb("Test if we can parse all images", t => {
  for (const { file, path } of allFiles()) {
    var image = fs.readFileSync(`${path}/${file}`);
    readimage(image, function(err, image) {
      if (err) {
        t.fail(`${path}/${file} is not a valid image.`);
      } else {
        t.pass();
      }
    });
  }
  t.end();
});

test.cb("Test if images.json matches the files", t => {
  const indexString = fs.readFileSync(`${imageFolder}/${indexFile}`, "utf8");
  const index = JSON.parse(indexString);

  for (const folder of folders) {
    const fileList = fs.readdirSync(`${imageFolder}/${folder}`);
    for (const file of fileList) {
      t.true(
        index[folder].includes(file),
        `${file} not found in images.json. Please run cleanup.js.`
      );
    }
    t.is(
      fileList.length,
      index[folder].length,
      `The amount of files listed in ${folder} in images.json is not correct. Please run cleanup.js.`
    );
  }

  t.end();
});

// Check for filesize, see issue #1
test.cb("Test if images are small enough", t => {
  for (const { file, path } of allFiles()) {
    const { size } = fs.statSync(`${path}/${file}`);
    if (size > 2000000) {
      t.fail(`Warning! Size of ${file} is too large!`);
    } else {
      t.pass();
    }
  }
  t.end();
});

test(
  "Test if there aren't less images than there are currently live",
  async t => {
    const newFileLength = allFiles().length;
    let currentFileLength = 0;
    try {
      const { data } = await axios.get(`${source}/images.json`);
      for (const folder of folders) {
        if (data.hasOwnProperty(folder)) {
          currentFileLength += data[folder].length;
        } else {
          currentFileLength = 0;
        }
      }
      t.true(
        newFileLength >= currentFileLength,
        "There are less glitterplaatjes in this version than there are currenctly online. If you have removed glitterplaatjes, please also add new ones."
      );
    } catch(e) {
      t.fail(e)
    }
  }
);
