#vid2gif
Convert a video element to an animated GIF in the browser.

[![NPM](https://nodei.co/npm/vid2gif.png)](https://www.npmjs.org/package/vid2gif)

## Usage
`vid2gif` is designed to be used with browserify. To use it, include it in a browserified module:
```javascript
var vid2gif = require('vid2gif')
var NUM_FRAMES = 10

vid2gif(document.querySelector('video'), NUM_FRAMES, function(err, gifBlob) {
  if (err) {
    alert('oh no!: ' + err)
    return
  }

  var img = document.createElement('img')
  img.src = window.URL.createObjectURL(gifBlob)
  docuument.body.appendChild(img)
})
```

## API
`var vid2gif = require('vid2gif')`

<b><code>vid2gif(videoElement, numFrames, cb)</code></b>

Convert `videoElement`'s source (with known number of frames `numFrames`, assumed to be evenly
distributed) to an animated GIF, calling `cb` when done. `cb` is a `function(err, gifBlob)`.

## Installation
`npm install vid2gif`

## License
MIT
