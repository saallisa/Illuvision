
import { Camera } from '../camera.js';
import { Timer } from '../../timer.js';
import { Vector3 } from '../../vector3.js';

/**
 * Controls camera movement with mouse and keyboard input.
 */
class StandardController
{
    #speed = new Vector3(5, 5, 5);
    #camera = null;
    #cameraForward = null;
    #cameraRight = null;

    #boundHandlers = {
        keydown: null,
        keyup: null
    };

    #actions = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
    };

    #keyMap = {
        // Forward
        'KeyW': 'forward',
        'ArrowUp': 'forward',

        // Backward
        'KeyS': 'backward',
        'ArrowDown': 'backward',

        // Left
        'KeyA': 'left',
        'ArrowLeft': 'left',

        // Right
        'KeyD': 'right',
        'ArrowRight': 'right',

        // Up
        'KeyQ': 'up',
        
        // Down
        'KeyE': 'down'
    };

    constructor(camera, options = {})
    {
        if (!(camera instanceof Camera)) {
            throw new TypeError(
                'Camera must be a valid Camera class instance!'
            );
        }

        this.#camera = camera;

        // Set options
        if (options.speed) {
            this.speed = options.speed;
        }

        // Bind event handlers
        this.#boundHandlers.keydown = this.#handleKeyDown.bind(this);
        this.#boundHandlers.keyup = this.#handleKeyUp.bind(this);
    }

    /**
     * Starts the controller by setting the event handlers.
     */
    start()
    {
        document.addEventListener('keydown', this.#boundHandlers.keydown);
        document.addEventListener('keyup', this.#boundHandlers.keyup);
    }

    /**
     * Stops the controller by removing the event handlers.
     */
    stop()
    {
        document.removeEventListener('keydown', this.#boundHandlers.keydown);
        document.removeEventListener('keyup', this.#boundHandlers.keyup);
    }

    /**
     * Updates camera
     */
    update(timer)
    {
        if (!(timer instanceof Timer)) {
            throw new Error('Timer must be a valid timer instance.')
        };

        // Calculate current forward and right vectors
        this.#calculateCameraDirections();

        // Movement intent
        const movement = new Vector3(0, 0, 0);
        let distance = 0;

        // Keyboard movements
        if (this.#actions.forward) {
            distance = this.#speed.x * timer.getDeltaTime();

            movement.subtract(
                Vector3.multiplyScalar(this.#cameraForward, distance)
            );
        }

        if (this.#actions.backward) {
            distance = this.#speed.x * timer.getDeltaTime();

            movement.add(
                Vector3.multiplyScalar(this.#cameraForward, distance)
            );
        }

        if (this.#actions.left) {
            distance = this.#speed.y * timer.getDeltaTime();

            movement.add(
                Vector3.multiplyScalar(this.#cameraRight, distance)
            );
        }

        if (this.#actions.right) {
            distance = this.#speed.y * timer.getDeltaTime();

            movement.subtract(
                Vector3.multiplyScalar(this.#cameraRight, distance)
            );
        }

        if (this.#actions.up) {
            distance = this.#speed.z * timer.getDeltaTime();

            movement.subtract(
                Vector3.multiplyScalar(this.#camera.getUp(), distance)
            );
        }

        if (this.#actions.down) {
            distance = this.#speed.z * timer.getDeltaTime();

            movement.add(
                Vector3.multiplyScalar(this.#camera.getUp(), distance)
            );
        }

        // Update position and target
        this.#camera.setPosition(
            Vector3.add(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.add(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Get's the current movement speed.
     */
    get speed() {
        return this.#speed;
    }

    /**
     * Set's a new movement speed.
     */
    set speed(speed)
    {
        Vector3.validateInstance(speed);
        this.#speed = speed;
    }

    /**
     * Calculates the current forward and right of the camera.
     */
    #calculateCameraDirections()
    {
        // Forward vector
        this.#cameraForward = Vector3.subtract(
            this.#camera.getTarget(),
            this.#camera.getPosition()
        );
        this.#cameraForward.normalize();

        // Right vector
        this.#cameraRight = Vector3.cross(
            this.#cameraForward,
            this.#camera.getUp()
        );
        this.#cameraRight.normalize();
    }

    /**
     * Handles keydown events.
     */
    #handleKeyDown(event)
    {
        const action = this.#keyMap[event.code];

        if (action) {
            this.#actions[action] = true;
        }
    }

    /**
     * Handles keyup events.
     */
    #handleKeyUp(event)
    {
        const action = this.#keyMap[event.code];
        
        if (action) {
            this.#actions[action] = false;
        }
    }
}

export {
    StandardController
};