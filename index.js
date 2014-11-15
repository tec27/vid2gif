var fs = require('fs')
var workerScriptSrc =
    fs.readFileSync(__dirname + '/Animated_GIF.worker.min.js', { encoding: 'utf8' })
var workerScriptBlob = new Blob([ workerScriptSrc ], { type: 'text/javascript' })

var AnimatedGif = require('animated_gif/src/Animated_GIF.js')
  , toBlob = require('data-uri-to-blob')

module.exports = function(videoElem, numFrames, cb) {
  var frameDuration = videoElem.duration / numFrames
    , recordingElem = document.createElement('video')
    , uriData = getSrcUri(videoElem.src)
    , workerScriptUri = window.URL.createObjectURL(workerScriptBlob)
    , gifCreator = new AnimatedGif({ workerPath: workerScriptUri })
    , canvas = document.createElement('canvas')
    , context = canvas.getContext('2d')

  gifCreator.setSize(videoElem.videoWidth, videoElem.videoHeight)
  gifCreator.setDelay(frameDuration * 1000)
  canvas.width = videoElem.videoWidth
  canvas.height = videoElem.videoHeight
  var frame = 0

  recordingElem.addEventListener('error', function(err) {
    cleanup()
    cb(err)
  })

  recordingElem.addEventListener('loadeddata', function() {
    recordingElem.pause()
    // seek to the first frame (triggering the seeked callback below)
    recordingElem.currentTime = frame * frameDuration
  })

  recordingElem.addEventListener('seeked', function() {
    try {
      context.drawImage(recordingElem, 0, 0)
      gifCreator.addFrameImageData(context.getImageData(0, 0, canvas.width, canvas.height))
      frame++

      if (frame < numFrames) {
        recordingElem.currentTime = frame * frameDuration
      } else {
        gifCreator.getBlobGIF(function(image) {
          cleanup()
          cb(null, image)
        })
      }
    } catch (err) {
      cleanup()
      cb(err)
    }
  })

  function cleanup() {
    window.URL.revokeObjectURL(workerScriptUri)
    uriData.cleanup()
    gifCreator.destroy()
    delete recordingElem.src
  }

  recordingElem.src = uriData.uri
  recordingElem.load()
  // Firefox mobile doesn't like to load videos unless it *really* has to, so we play it to get
  // things started there
  recordingElem.play()
}

function getSrcUri(videoElemSrc) {
  if (/^data:/.test(videoElemSrc)) {
    // Work around Firefox not considering data URI's "origin-clean" (meaning we can't draw from the
    // data URI video to our canvas and still be able to call getImageData). Object URIs count as
    // origin-clean correctly, however, so we construct one of those
    var srcBlob = toBlob(videoElemSrc)
      , srcUri = window.URL.createObjectURL(srcBlob)
    return {
      uri: srcUri,
      cleanup: function() {
        window.URL.revokeObjectURL(srcUri)
      }
    }
  }

  return { uri: videoElemSrc, cleanup: function() {} }
}
