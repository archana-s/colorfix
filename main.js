const recursive = require('recursive-readdir');
const fs = require('fs');

if (process.argv.length < 4) {
  throw('Please provide a colors file and a directory to fix colors in.');
}

const colorsFile = process.argv[2];
const dir = process.argv[3];

const colorRegex = /(#[A-Fa-f0-9]{3,6})/g;

const colorMap = {};

function getColorsFromFile() {
  const recommendedColorsContent = fs.readFileSync(colorsFile, 'utf-8');
  
  recommendedColorsContent.split('\n').forEach(line => {
    const colorVarRegex = /(--[A-Za-z0-9-]+)\:\s*(#[A-Za-z0-8]{6})/;
    const colorItems = line.match(colorVarRegex);
    const colorVar = colorItems && colorItems.length && colorItems[1];
    const colorHex = colorItems && colorItems.length && colorItems[2];

    if (colorVar && colorHex) {
      colorMap[colorHex] = colorVar;     
    }
  })
}

function replaceColorsWithNearestColorVar() {
  const recommendedColors = Object.keys(colorMap);
  
  const nearestColor = require('nearest-color').from(recommendedColors);
  
  recursive(dir, function (err, files) {
    files.forEach(file => {
      if (file.match(/^(.*)(.less|.css|.scss)$/)) {
        let fileContents = fs.readFileSync(file, 'utf-8');
        const colors = fileContents.match(colorRegex);
  
        if (colors) {
          for (color of colors)  {
            var nearestMatch = nearestColor(color);
            fileContents = fileContents.replace(color, `var(${colorMap[nearestMatch]})`);
          }
          fs.writeFileSync(file, fileContents);
        }
      }
    })
  });
}

getColorsFromFile();
replaceColorsWithNearestColorVar();
