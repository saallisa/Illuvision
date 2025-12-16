
# Illuvision Engine

[![DeepScan grade](https://deepscan.io/api/teams/27485/projects/30515/branches/980824/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=27485&pid=30515&bid=980824)

This is an unfinished and experimental 3D rendering engine for WebGPU only.
It is free of dependencies and is coded in plain JavaScript.
Once I reach a stage of development that appears to be useful and error-free,
I will make the code completely open source.
In the meantime, I advise against using it for anything other than experimentation.

## Getting started

To install Illuvision, simply download the project as a zip and unpack it. Reename the src directory to something like illuvision or ive and copy it into your js or assets folder.

From there, simply import the classes from the illuvision.js file prefixed with IVE.

```javascript
import * as IVE from '/path/to/illuvision/illuvision.js';
```

Before you can render anything you must first initialize the engine.

```javascript
const engine = new IVE.Engine();
```

By default the canvas is 800 x 600 px, but you can either set the size to a custom value with ```engine.setSize(width, height)``` or you can set it to the current window size with ```engine.setSizeToWindow()```. The background of your canvas is black by default, but if you’d like to change this, simply call ```engine.setClearColor(color)```. This method expects a color object.

```javascript
engine.setSizeToWindow(); // or engine.setSize();
engine.setClearColor(IVE.Color.fromHex('87ceeb')); // sky blue
```

After configuring the engine it must be initialized.

```javascript
await engine.initialize();
```

Now you can get the canvas created and used by the engine with ```engine.getCanvas()```. You must append it to the html document with JavaScript, for example with ```document.body.appendChild(canvas)```.

## Todo

This list gives an overview of what is planned for and what is already implemented in the first release.

- [x] Geometries
  - [x] Triangle
  - [x] Plane
  - [x] Box
- [x] Lights
  - [x] Ambient light
  - [x] Directional light
- [x] Materials
  - [x] Basic
  - [x] Lambert
- [x] Cameras
  - [x] Orthographic camera
  - [x] Perspective camera
- [x] Scene
  - [x] Meshes
  - [x] Scene Nodes
- [x] Rendering

More features will be added in later releases.

## Contribution guide

As I currently use this project mainly for learning purposes, I'd like to implement most of its features myself.
If, by any chance, you decide to use this library and find any bugs, please feel free to create an issue.
Sometimes I will mark bugs with the "help wanted" tag. You are welcome to propose a solution by creating a pull request.
