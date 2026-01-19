
import { Timer } from '../../timer.js';
import { Vector3 } from '../../vector3.js';
import { Camera } from '../camera.js';

/**
 * Controls camera movement with mouse and keyboard input.
 */
class StandardController
{
    #camera = null;
    #cameraDirection = null;

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

    constructor(camera)
    {
        if (!(camera instanceof Camera)) {
            throw new TypeError(
                'Camera must be a valid Camera class instance!'
            );
        }

        this.#camera = camera;
        this.#cameraDirection = Vector3.subtract(
            this.#camera.getPosition(),
            this.#camera.getTarget()
        );

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

        if (this.#actions.forward) {
            this.#moveForward(timer);
        }

        if (this.#actions.backward) {
            this.#moveBackward(timer);
        }

        if (this.#actions.left) {
            // TODO: Move left
        }

        if (this.#actions.right) {
            // TODO: Move right
        }

        if (this.#actions.up === true) {
            // TODO: Move upwards
        }

        if (this.#actions.down === true) {
            // TODO: Move downwards
        }
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

    /**
     * Moves the camera in the current direction it is facing.
     * Updates the position and target.
     */
    #moveForward(timer)
    {
        const speed = 0.5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#cameraDirection, distance
        );

        this.#camera.setPosition(
            Vector3.add(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.add(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Moves the camera from current direction it is facing.
     * Updates the position and target.
     */
    #moveBackward(timer)
    {
        const speed = 0.5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#cameraDirection, distance
        );

        this.#camera.setPosition(
            Vector3.subtract(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.subtract(this.#camera.getTarget(), movement)
        );
    }
}

export {
    StandardController
};