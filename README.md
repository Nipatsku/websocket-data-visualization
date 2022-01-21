# Websocket real-time data visualization using LightningChart JS

Super compact test application of visualizing real-time data stream in a scrolling line chart with multiple channels.

Read more about the applications and context in this [short technical article](https://niilo-keinanen-93801.medium.com/real-time-data-visualization-with-websocket-79773edbf477).

A **single** `HTML` file - no build or external content script required...

... creates **this** chart:

<img width="1915" alt="capture" src="https://user-images.githubusercontent.com/55391673/144894515-9d396a84-9ce1-48fd-a61a-e18d21800700.PNG">

Chart is rendered with [LightningChart JS](https://www.arction.com/lightningchart-js/).

The data is generated in a `Node.js` server and streamed with `WebSocket` to the client. WebSocket is really powerful for real-time data transferring - with my average PC I could easily stream **1 000 000** data points per second and rendered it with stable 60 FPS by using `LCJS`.

I also tested this by hosting the server in USA, and testing the streaming to Finland, which still could handle 30 000 data points per second.

The communication is highly optimized by packing all information to binary format. The below picture is a simplified structure presentation of each data message.

![data-packet](https://user-images.githubusercontent.com/55391673/144894546-146d9132-b5ab-4ebe-8227-c4369f6922f3.png)

Binary communication is technically quite complex, but results in very efficient bandwidth usage - transferring 30000 data points / second uses approximately 120 kilobytes.

To understand the benefit better, we can compare to the more traditional data transfer method - `JSON`, where all communication is done with UTF-8 encoded text.

![traditional-data-packet](https://user-images.githubusercontent.com/55391673/144898549-163b639b-926b-430f-8ca6-9c89fe40992a.png)

Quick testing in this scenario resulted in ~4 times less bandwidth usage with binary method. However, on top of this binary communication is simply more flexible in terms of bandwidth usage. For example, if data would be coming from an IoT sensor for example, 1 byte integers could be precise enough (rather than 4 byte floats) which would result in even 4 times less bandwidth usage.

A previous version of this repository exists, which used `JSON`. This version can be viewed [here](https://github.com/Nipatsku/websocket-data-visualization/tree/json-version).

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
