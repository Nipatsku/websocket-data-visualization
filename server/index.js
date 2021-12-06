const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

// Time interval between websocket data transactions.
const streamIntervalMs = 1000 / 60
// X Axis displayed value interval as seconds.
const xIntervalSeconds = 10

const Channel = (opts) => Object.assign({
    name: 'Unnamed channel',
    min: 0,
    max: 1,
    frequencyHz: 1000,
}, opts)

const channels = [
    Channel({
        name: 'Power source voltage (V)',
        min: 4.4,
        max: 4.5,
        frequencyHz: 100,
    }),
    Channel({
        name: 'Reading A (V)',
        color: '#f00',
        frequencyHz: 1000,
    }),
    Channel({
        name: 'Reading B (V)',
        color: '#0f0',
        frequencyHz: 1000,
    }),
    Channel({
        name: 'Reading C (V)',
        color: '#00f',
        frequencyHz: 1000,
    }),
]

// Generate channel test data.
const channelsDataSets = channels.map(channel => {
    const dataPointsCount = 200 * 1000
    const yValues = []
    const yInterval = channel.max - channel.min
    for (let i = 0; i < dataPointsCount; i += 1) {
        yValues[i] = channel.min + Math.random() * yInterval
    }
    return yValues
})

wss.on('connection', function connection(ws) {
    console.log('connection')
    
    let open = true

    ws.send(JSON.stringify({
        id: 'info',
        xIntervalSeconds,
        channels
    }))

    ws.addEventListener('close', (e) => {
        open = false
    })

    // Setup data streaming.
    let tPrev = Date.now()
    let channelsDataPointIndexes = channels.map(_ => 0)
    let channelsDataPointModulus = channels.map(_ => 0)
    const streamData = () => {
        const tDataFrame = Date.now()

        if (open) {
            // Pack communication meta data as well as new samples data points data from all channels into a binary array.
            // 1. Calculate the byte length of the entire message.
            const message = {
                metadata: { bytes: 0 },
                gapBytes: 0,
                data: { bytes: 0 },
            }

            // 1.1. Pre-check actual data points counts to be streamed.
            message.data.channelNewSampleCountList = []
            for (let iCh = 0; iCh < channels.length; iCh += 1) {
                const channel = channels[iCh]
                let channelNewSamplesCount = channel.frequencyHz * (tDataFrame - tPrev) / 1000 + channelsDataPointModulus[iCh]
                channelsDataPointModulus[iCh] = channelNewSamplesCount % 1
                channelNewSamplesCount = Math.floor(channelNewSamplesCount)
                message.data.channelNewSampleCountList[iCh] = channelNewSamplesCount
            }
            // 1.2. Calculate bytes length of new samples data points.
            const totalDataPointsCount = message.data.channelNewSampleCountList.reduce((sum, cur) => sum + cur, 0)
            // NOTE: 4 bytes per data point (1 Y coord, Float32).
            message.data.bytes = totalDataPointsCount * 4

            // 1.3. Prepare metadata in JSON format.
            message.metadata.content = {
                timestamp: tDataFrame,
                channelNewSampleCountList: message.data.channelNewSampleCountList,
                dataPointDataType: 'Float32'
            }
            // 1.4. Calculate metadata byte length.
            const metaDataBuffer = Buffer.from(JSON.stringify(message.metadata.content), 'utf8')
            message.metadata.bytes = metaDataBuffer.length
            message.metadata.contentBinary = new Uint8Array(metaDataBuffer.buffer, metaDataBuffer.byteOffset, metaDataBuffer.length / Uint8Array.BYTES_PER_ELEMENT)
            // 1.5. Calculate gap bytes count between metadata and data.
            // NOTE: Data is in Float32 type, the start byte must be a multiple of 4, which is why gap bytes might be needed.
            // NOTE: At very start of message, there is always an Uint16 that is equal to the byte length of message meta data.
            const dataBinaryStartBeforeGap = 2 + message.metadata.bytes
            message.gapBytes = dataBinaryStartBeforeGap % 4 === 0 ? 0 : 4 - (dataBinaryStartBeforeGap % 4)

            // 1.5. Sum total message byte length.
            // NOTE: At very start of message, there is always an Uint16 that is equal to the byte length of message meta data.
            const totalMessageBytes = 2 + message.metadata.bytes + message.gapBytes + message.data.bytes
            

            // 2. Pack message into binary array.
            const messageBinary = new ArrayBuffer(totalMessageBytes)
            let messageBinaryPos = 0
            // 2.1. Pack meta data length at start of binary message.
            const viewMetadataLength = new Uint16Array(messageBinary, messageBinaryPos, 2)
            viewMetadataLength[0] = message.metadata.bytes
            messageBinaryPos += 2
            // 2.2. Pack meta data.
            const viewMetadata = new Uint8Array(messageBinary, messageBinaryPos, messageBinaryPos + message.metadata.bytes)
            viewMetadata.set(message.metadata.contentBinary)
            messageBinaryPos += message.metadata.bytes
            // 2.3. Pack new data samples.
            messageBinaryPos += message.gapBytes
            const viewNewSamples = new Float32Array(messageBinary, messageBinaryPos)
            let iViewNewSamples = 0
            for (let iCh = 0; iCh < channels.length; iCh += 1) {
                let channelNewSamplesCount = message.data.channelNewSampleCountList[iCh]
                let channelDataPointIndex = channelsDataPointIndexes[iCh]
                let channelDataSet = channelsDataSets[iCh]
                for (let i = 0; i < channelNewSamplesCount; i += 1) {
                    const sampleY = channelDataSet[channelDataPointIndex % channelDataSet.length]
                    viewNewSamples[iViewNewSamples] = sampleY
                    iViewNewSamples += 1 
                    channelDataPointIndex += 1
                }
                channelsDataPointIndexes[iCh] = channelDataPointIndex % channelDataSet.length
            }

            ws.send(messageBinary)
        }

        tPrev = tDataFrame
        setTimeout(streamData, streamIntervalMs)
    }

    setTimeout(streamData, 500)

});