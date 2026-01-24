
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Transparency support in rendering engine

#### Core

- Timer class for getting delta time
- Getters for left, right, top, bottom, near and far in OrthographicCamera
- Setters for left, right, top, bottom, near and far in OrthographicCamera
- Ability to add or remove event listeners to camera class that are notified whenever the camera's view changes
- StandardController camera controller supporting movement via keyboard input

#### Utility

- Performance monitor for displaying current fps rate

## [0.1.3] - 2026-01-24

### Fixed

- Canvas resizing after initializing no longer results in a black canvas

## [0.1.2] - 2026-01-01

### Fixed

- color.multiLerp() now calculates the blue component correctly

## [0.1.1] - 2025-12-29

### Fixed

- camera.update() now updates view and projection matrices correctly

## [0.1.0] - 2025-12-21

### Added

- Initial release
