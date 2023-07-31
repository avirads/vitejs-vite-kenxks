import { WebContainer } from '@webcontainer/api';
import JSZip from 'jszip';

window.addEventListener('load', async () => {
  const container = await WebContainer.boot();
  await container.spawn('npm', ['i', 'vite']);
  container.on('server-ready', async (port, url) => {
    document.querySelector('#dev-url').setAttribute('src', `${url}`);
  });

  function fileCounter(zipContent) {
    let fileCount = 0;
    for (const filename in zipContent.files) {
      if (!zipContent.files[filename].dir) {
        fileCount++;
      }
    }
    return fileCount;
  }

  document.getElementById('daj_world').addEventListener('change', (e) => {
    //container.fs.rm('/',{ force:true,recursive: true })
    const zipFile = e.target.files[0];
    const zip = new JSZip();
    let fileCount = 0,
      progress = 0;
    zip.loadAsync(zipFile).then((zipContent) => {
      for (const filename in zipContent.files) {
        if (!zipContent.files[filename].dir) {
          fileCount++;
        }
      }
      //console.log(fileCount)
    });
    zip.loadAsync(zipFile).then((zipContent) => {
      for (const filename in zipContent.files) {
        const file = zipContent.files[filename];
        if (!file.dir) {
          file.async('uint8array').then((fileData) => {
            container.fs.writeFile(file.name, fileData);
            //console.log(file.name)
            progress++;
            let status = parseFloat((progress / fileCount) * 100) + '%';
            document.querySelector('#progress').style.width = status;
            document.querySelector('#progress').innerHTML = status;
          });
        } else {
          container.fs.mkdir(file.name);
        }
      }
    });
    container.spawn('npx', ['vite']);
  });
});
