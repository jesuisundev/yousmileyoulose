const listOfVideoIds = [
    '_swN8e_DNPg',
    'ZkNMZlkrzaU',
    'xHoxkD8kKJg',
    'G7RgN9ijwE4',
    'K0E_qdXpZcc',
    '0ZMc9xrehxA',
    'wFJ6UZ0SkYY',
    'w3m4N0UVt0M',
    'NsaSG-0U4mU',
    'F-X4SLhorvw',
    'El1BhIQFMfs',
    'jiudBq7z8wk',
    'rZhBEMpbxC4',
    'ZdZ7NKVAQJU',
    'JUe0GaScPdY',
    'a5GPB8VDcqg',
    'fjHGTeTtaac',
    'l1Qerh-h5Vc',
    'f5OR6eDhaoI',
    'rw3I2JhmxmE',
    'qpObCUeOe5Y',
    'VdVEwk-5hoI',
    '-w-58hQ9dLk',
    'MC2XkigeXiI',
    'rKm24Z99hY8',
    'bfCR0dEDO1A',
    '_Z-Nu351j58',
    'nsaH7gjZYXE',
    'wfzadSG4NH0',
    'v-7Fs9HJvs0',
    'FMe3J5i1BLY'
]

let isFirstRound = true
let isUsingCamera = false
let currentSmileStatus = false

document.getElementById('actualshit').addEventListener('click', event => setupFaceDetection(event))
document.getElementById('nextVideo').addEventListener('click', event => showNextVideo(event))

// initiate webcam
const webcam = document.getElementById("webcam")
webcam.addEventListener("play", refreshState)

// initiate youtube player and api
let player
const tag = document.createElement('script')
tag.src = "https://www.youtube.com/iframe_api"
const firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

/**
 * Launch the whole process following thoses steps
 * - Load models from faceapi
 * - Ask user for the video stream and setup the video
 *
 * @async
 * @param {Object} event event of the click
 */
async function setupFaceDetection(event) {
    event.preventDefault()

    document.getElementById('home').remove()
    document.getElementById("smileStatus").style.display = "block"

    await loadModels()
    setupWebcam()
    setupYoutubePlayer()
}

/**
 * Load models from faceapi.
 * 
 * Host need be replaced by your local ip if you running this in local !
 * @async
 */
async function loadModels() {
    let modelsUrl = "https://www.smile-lose.com/models"

    // Use this for local development
    // this should be the IP of your HTTPS server (example : 192.168.5.40)
    //const host = "192.168.5.40"
    // this should the port where your HTTPS server is served (default : 8080)
    //const port = "8080"
    //modelsUrl = `https://${host}:${port}/models`

    await faceapi.nets.tinyFaceDetector.loadFromUri(modelsUrl)
    await faceapi.nets.faceExpressionNet.loadFromUri(modelsUrl)
}

/**
 * Setup the webcam stream for the user.
 * On success, the stream of the webcam is set to the source of the HTML5 tag.
 * On error, the error is logged and the process continue.
 */
function setupWebcam() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(stream => {
            webcam.srcObject = stream
            if (isFirstRound) startFirstRound()
        })
        .catch(() => {
            document.getElementById("smileStatus").textContent = "camera not found"
            isUsingCamera = false
            if (isFirstRound) startFirstRound()
        })
}

/**
 * Setup the youtube player using the official API
 */
function setupYoutubePlayer() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'ewjkzE6X3BM',
        playerVars: {
            'controls': 0,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'iv_load_policy': 3,
            'disablekb': 1
        },
        events: { 'onStateChange': onPlayerStateChange }
    })
}

/**
 * Set an refresh interval where the faceapi will scan the face of the subject
 * and return an object of the most likely expressions.
 * Use this detection data to pick an expression and spread background gifs on divs.
 * @async
 */
async function refreshState() {
    setInterval(async() => {
        const detections = await faceapi
            .detectAllFaces(webcam, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions()

        if (detections && detections[0] && detections[0].expressions) {
            isUsingCamera = true

            if (isSmiling(detections[0].expressions)) {
                currentSmileStatus = true
                document.getElementById("smileStatus").textContent = "YOU SMILE !"
            } else {
                document.getElementById("smileStatus").textContent = "not smiling"
            }
        }
    }, 400)
}

/**
 * Entrypoint. This should be use once.
 */
function startFirstRound() {
    isFirstRound = false
    currentSmileStatus = false

    document.getElementById("loading").style.display = 'none'
    document.getElementById('intermission').className = 'fadeOut'

    player.playVideo()
}

/**
 * We want to show the intermissions when a video is over.
 * Listening to the event onPlayerStateChange of the youtube api.
 */
function onPlayerStateChange(event) {
    // 0 means the video is over
    if (event.data === 0) {
        player.stopVideo()
        showIntermission()
    }
}

/**
 * Showing the screen beetwen videos.
 * Result is defined by various global variable updated by the models.
 */
function showIntermission() {
    let smileStatusText = "Your camera is off, you not even trying to beat the game."

    if (isUsingCamera) {
        if (currentSmileStatus) {
            smileStatusText = "You SMILED during the video !"
            document.getElementById('resultSmileStatus').className = "lose"
        } else {
            smileStatusText = "You didn't smile during the video !"
            document.getElementById('resultSmileStatus').className = "win"
        }
    }

    document.getElementById('resultSmileStatus').textContent = smileStatusText
    document.getElementById('loading').style.display = 'none'
    document.getElementById('nextVideo').style.display = 'inline-block'
    document.getElementById('result').style.display = 'block'
    document.getElementById('intermission').className = 'fadeIn'
}

/**
 * Showing the next video to the user.
 * This should be only trigger but the click on next video.
 */
function showNextVideo(event) {
    event.preventDefault()

    document.getElementById('loading').style.display = 'block'
    document.getElementById('result').style.display = 'none'

    if (listOfVideoIds.length) {
        const nextVideoId = extractRandomAvailableVideoId()
        player.loadVideoById({ videoId: nextVideoId })
        player.playVideo()

        setTimeout(() => {
            currentSmileStatus = false
            document.getElementById('intermission').className = 'fadeOut'
        }, 1000)
    } else {
        showCredit()
    }
}

/**
 * Show the end screen
 * TODO : Webcam is not really stopped here.
 */
function showCredit() {
    document.getElementById('theater').remove()
    webcam.srcObject = null

    document.getElementById('credit').style.display = 'flex'
    document.getElementById('credit').className = 'fadeIn'
}

/**
 * Get a video id randomly in the pool of videos.
 * We use splice here to delete the chosen video from the pool.
 */
function extractRandomAvailableVideoId() {
    const randomNumber = Math.floor(Math.random() * listOfVideoIds.length)
    const randomVideoId = listOfVideoIds.splice(randomNumber, 1)

    return randomVideoId
}

/**
 * Determine if the user is smiling or not by getting the most likely current expression 
 * using the facepi detection object. Build a array to iterate on each possibility and 
 * pick the most likely.
 * @param {Object} expressions object of expressions
 * @return {Boolean}
 */
function isSmiling(expressions) {
    // filtering false positive
    const maxValue = Math.max(
        ...Object.values(expressions).filter(value => value <= 1)
    )

    const expressionsKeys = Object.keys(expressions)
    const mostLikely = expressionsKeys.filter(
        expression => expressions[expression] === maxValue
    )

    if (mostLikely[0] && mostLikely[0] == 'happy')
        return true

    return false
}