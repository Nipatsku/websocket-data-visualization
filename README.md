# Websocket real-time data visualization using LightningChart JS

Super compact test application of visualizing real-time data stream in a scrolling line chart with multiple channels.

A **single** `HTML` file - no build or external content script required...

... creates **this** chart:

<img width="1915" alt="capture" src="https://user-images.githubusercontent.com/55391673/144894515-9d396a84-9ce1-48fd-a61a-e18d21800700.PNG">

Chart is rendered with [LightningChart JS](https://www.arction.com/lightningchart-js/).

The data is generated in a `Node.js` server and streamed with `WebSocket` to the client. WebSocket is really powerful for real-time data transferring - with my average PC I could easily stream **1 000 000** data points per second and rendered it with stable 60 FPS by using `LCJS`.

I also tested this by hosting the server in USA, and testing the streaming to Finland, which still could handle 30 000 data points per second.

The communication is highly optimized by packing all information to binary format. The below picture is a simplified structure presentation of each data message.

![data-packet](https://user-images.githubusercontent.com/55391673/144894546-146d9132-b5ab-4ebe-8227-c4369f6922f3.png)

Binary communication is technically quite complex, but results in very efficient bandwidth usage - transferring 30000 data points / second uses approximately 120 kilobytes.

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
