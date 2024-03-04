# @ud-viz/game_node

[![NPM package version](https://badgen.net/npm/v/@ud-viz/game_node)](https://npmjs.com/package/@ud-viz/game_node)

Game library interpretable in a nodejs environment. Before to start you should read [@ud-viz/game_shared](../game_shared/Readme.md) and [@ud-viz/game_browser](../game_browser/Readme.md).

## Overview

`@ud-viz/game_node` package allows to create a backend `SocketService` working with [socket.io](https://socket.io/) to communicate with clients implement with [`@ud-viz/game_browser`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_browser/Readme.md). `SocketService` takes an array of `Object3D` and will instanciated a thread for each of them with [worker_threads](https://nodejs.org/api/worker_threads.html) where `Object3D` is running. Then it handles websocket communication with threads.

```mermaid
flowchart TB
subgraph client_1
ExternalContext_1
end

subgraph client_n
ExternalContext_n
end

subgraph backend
subgraph SocketService
thread_Parent_1
thread_Parent_m
end
subgraph thread_Child_1
Object3D_1
end
subgraph thread_Child_m
Object3D_m
end
end

ExternalContext_1-->|websocket Command|SocketService
ExternalContext_n-->|websocket Command|SocketService
SocketService-->|websocket State|ExternalContext_1
SocketService-->|websocket State|ExternalContext_n

thread_Parent_1-->|message|thread_Child_1
thread_Child_1-->|State|thread_Parent_1
thread_Parent_m-->|message|thread_Child_m
thread_Child_m-->|State|thread_Parent_m
```

## Installation

- You can install @ud-viz/game_node via npm:

```bash
npm install @ud-viz/game_node
```


##  Example

### Parent entry

```js
const { SocketService } = require('@ud-viz/game_node');
const { Object3D } = require('@ud-viz/game_shared');

const socketService = new SocketService(httpServer);
socketService.loadGameThreads(
  [new Object3D({ name: 'game_1' }), new Object3D({ name: 'game_2' })],
  './path/to/your/thread/child/entry.js'
);
```

> You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/bin/backEnd.js)

### Child entry

```js
const { thread } = require('@ud-viz/game_node');

const child = new thread.Child();
child.start([scriptsOfYourGames]);
```

> You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/bin/gameThreadChild.js)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/game_node/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/game_node` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).