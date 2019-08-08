const { createCanvas, ImageData } = require('canvas');
const osversion = require('./os_version');
const express = require('express')
const robot = require('robotjs');
const os = require('os');

const server     = express();
const screenSize = robot.getScreenSize();
const canvas     = createCanvas(screenSize.width, screenSize.height);
const context    = canvas.getContext('2d');

server.get('/info', (req, res) => {
  res.send({
    computerName : os.hostname(),
    userName     : os.userInfo().username,
    osVersion    : osversion(),
  });
});

server.get('/mouse', (req, res) => {
  const x = req.query.x || 0;
  const y = req.query.y || 0;
  const type = req.query.type || 'down';
  const button = req.query.button || 'right';
  robot.moveMouse( x * screenSize.width, y * screenSize.height);
  if (type == 'down' || type == 'up') {
    robot.mouseToggle(type, button);
  }
  res.send({result:'success'});
});

server.get('/screen', (req, res) => {
  let capture = robot.screen.capture();
  let pixels = capture.width * capture.height;
  let rawdata = new Uint8ClampedArray(capture.image);
  // convert from BGRA to RGBA
  for(let i = 0; i < pixels; i++) {
      let index = i * 4;
      let blue = rawdata[index + 0];
      rawdata[index + 0] = rawdata[ index + 2];
      rawdata[index + 2] = blue;
  }
  imageData = new ImageData(rawdata, capture.width, capture.height);
  context.putImageData(imageData, 0, 0);
  canvas.createPNGStream().pipe(res);
});

server.use(express.static('public'));
server.listen(8080, () => {
  console.log('Server listening on http://127.0.0.1:8080');
});
