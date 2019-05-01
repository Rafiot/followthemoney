const fs = require('fs');
const path = require('path')
const SVGO =  require('svgo')

const svgo = new SVGO({ plugins: [{ convertShapeToPath: { convertArcs: true } }] });

fs.readdir('./icons', null, async function(error, list) {
  if (error) {
    console.error(error)
  } else {
    const iconsPaths = buildPathsObject(list.map(l => l.replace(/\.svg$/, '')));

    writeLinesToFile('./generated/icons.json', "{",
      (await iconsPaths).join(','),
      "}");
  }
})

async function writeLinesToFile(filename, ...lines) {
  const outputPath = path.join(filename);
  const contents = [ ...lines, ""].join('');
  fs.writeFileSync(outputPath, contents);
}

function buildPathsObject(ICONS_METADATA) {
  return Promise.all(
    ICONS_METADATA.map(async icon => {
      const filepath = path.resolve(__dirname, `../icons/${icon}.svg`);
      const svg = fs.readFileSync(filepath, "utf-8");
      const pathStrings = await svgo
        .optimize(svg, { path: filepath })
        .then(({ data }) => data.match(/ d="[^"]+"/g) || [])
        .then(paths => paths.map(s => s.slice(3)));
      return `"${icon}": [${pathStrings.join(",\n")}]`;
    }),
  );
}