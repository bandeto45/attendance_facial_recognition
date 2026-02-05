const rollup = require('rollup');
const fs = require('fs');
const path = require('path');

const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const build = async () => {
  // Copy models folder to www/assets/models
  const modelsSource = path.resolve(__dirname, '../src/assets/models');
  const modelsDest = path.resolve(__dirname, '../cordova/www/assets/models');
  if (fs.existsSync(modelsSource)) {
    console.log('Copying face-api models...');
    copyDir(modelsSource, modelsDest);
    console.log('Models copied successfully');
  }

  // rebuild JS without modules
  let entry = fs
    .readdirSync(path.resolve(__dirname, '../cordova/www/assets'))
    .filter((f) => f.includes('index-') && f.includes('.js'))[0];
  const hash = entry.split('index-')[1].split('.js')[0];

  const bundle = await rollup.rollup({
    input: path.resolve(__dirname, '../cordova/www/assets/', entry),
  });
  await bundle.write({
    file: path.resolve(__dirname, '../cordova/www/assets/', `index-${hash}.js`),
    format: 'iife',
    name: 'MyApp',
    sourcemap: false,
  });

  // Remove old chunk files
  fs.readdirSync(path.resolve(__dirname, '../cordova/www/assets')).forEach((f) => {
    if (f.includes('.js') && f.split('.').length > 2 && f !== `index-${hash}.js`) {
      fs.rmSync(path.resolve(__dirname, '../cordova/www/assets', f));
    }
  });

  // fix index.html
  const indexPath = path.resolve(__dirname, '../cordova/www/index.html');
  const indexContent = fs
    .readFileSync(indexPath, 'utf8')
    .split('\n')
    .map((line) => {
      if (line.includes('<link rel="modulepreload"')) return '';
      if (line.includes('<script type="module"')) return '';
      if (line.includes('</body>'))
        return `  <script src="assets/index-${hash}.js"></script>\n</body>`;
      return line;
    })
    .join('\n');
  fs.writeFileSync(indexPath, indexContent);
};

build();
