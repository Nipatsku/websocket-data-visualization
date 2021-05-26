const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

const timeDomain = 60 * 1000
const dataRate = 500 // Amount of data points per channel per 50 ms interval.

const Channel = (opts) => Object.assign({
    name: 'Unnamed channel',
    min: 0,
    max: 1,
}, opts)

const channels = [
    Channel({
        name: 'Power source voltage (V)',
        min: 4.4,
        max: 4.5,
    }),
    Channel({
        name: 'Reading A (V)',
        color: '#f00'
    }),
    Channel({
        name: 'Reading B (V)',
        color: '#0f0'
    }),
    Channel({
        name: 'Reading C (V)',
        color: '#00f'
    }),
]

wss.on('connection', function connection(ws) {
    console.log('connection')
    
    let open = true

    ws.send(JSON.stringify({
        id: 'info',
        timeDomain,
        channels
    }))

    ws.addEventListener('close', (e) => {
        open = false
    })

    let tPrev = Date.now()
    const streamData = () => {    
        const tNow = Date.now()
        const newSamplesCount = dataRate
        const samples = new Array(newSamplesCount).fill(0).map((_, iSample) => ({
            timestamp: tPrev + ((iSample + 1) / newSamplesCount) * (tNow - tPrev),
            values: channels.map((channel, iChannel) => 
                channel.min + Math.random() * (channel.max - channel.min)
            )
        }))

        ws.send(JSON.stringify({
            id: 'data',
            samples
        }))
        tPrev = tNow

        setTimeout(streamData, 50)
    }
    setTimeout(streamData, 500)

});