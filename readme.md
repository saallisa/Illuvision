
# Illuvision Engine

[![DeepScan grade](https://deepscan.io/api/teams/27485/projects/30515/branches/980824/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=27485&pid=30515&bid=980824)

A lightweight, dependency-free 3D rendering engine for WebGPU, written in pure JavaScript.
This is an experimental project under active development. The API is subject to change, and you may encounter bugs. Use in production environments is not recommended at this time.

## Requirements

* A browser with WebGPU support
* Experience with HTML and JavaScript
* Basic understanding of 3D graphics

**Warning:** As WebGPU is a cutting-edge web standard that is still being rolled out across browsers, Illuvision isn't supported in every browser or on every platform, yet.
Check [this page](https://caniuse.com/webgpu) for current browser support.

## Installation

1. Download the project as a ZIP file and extract it
2. Copy the `src` directory to your project
3. Rename it to something like `illuvision` or `ive`
4. Import the engine in your JavaScript files

```javascript
import * as IVE from './path/to/illuvision/illuvision.js';
```

## Examples

In the \examples directory of this repository you can find examples showing you

* How to render the simple "Hello Triangle" (triangle.js)
* How to render spinning cubes and a plane using different material settings (lambert.js)
* How to render a group of objects using SceneNode (scene-graph.js)
* How to use the StandardController to move around in a simple 3D world (terrain.js).

## Contributing

While I'm primarily developing this project for learning purposes, contributions are welcome:

- **Bug Reports**: Create an issue with reproduction steps
- **Bug Fixes**: PRs for issues tagged "help wanted" are appreciated
- **Feedback**: Share your experience using the engine

Please note that feature implementations will mostly be done by me to preserve the learning aspect of the project.
