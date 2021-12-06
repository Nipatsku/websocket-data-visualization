# Websocket real-time data visualization using LightningChart JS

Super compact test application of visualizing real-time data stream in a scrolling line chart with multiple channels.

A **single** `HTML` file - no build or external content script required...

... creates **this** chart:

![screenshot](capture.PNG "Chart")

Chart is rendered with [LightningChart JS](https://www.arction.com/lightningchart-js/).

The data is generated in a `Node.js` server and streamed with `WebSocket` to the client. WebSocket is really powerful for real-time data transferring - with my average PC I could easily stream **1 000 000** data points per second and rendered it with stable 60 FPS by using `LCJS`.

I also tested this by hosting the server in USA, and testing the streaming to Finland, which still could handle 30 000 data points per second.

The communication is highly optimized by packing all information to binary format. The below picture is a simplified structure presentation of each data message.

![](data-packet.png)

Packing communication is technically quite complex, but results in very efficient bandwidth usage - transferring 30000 data points / second uses approximately 120 kilobytes.

## Try it yourself

1. Install `Node.js`

2. Start test server

```bash
cd server
npm i
npm start
```

3. Start client

```bash
cd client
npm i --global live-server
live-server
```

Client can be viewed by opening browser at `URL`: _localhost:8080_
