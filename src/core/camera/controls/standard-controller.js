
import { Camera } from '../camera.js';
import { Timer } from '../../timer.js';
import { Vector3 } from '../../vector3.js';

/**
 * Controls camera movement with mouse and keyboard input.
 */
class StandardController
{
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

    constructor(camera)
    {
        if (!(camera instanceof Camera)) {
            throw new TypeError(
                'Camera must be a valid Camera class instance!'
            );
        }

        this.#camera = camera;

        // Calculate current forward and right vectors
        this.#cameraForward = Vector3.subtract(
            this.#camera.getTarget(),
            this.#camera.getPosition()
        );
        this.#cameraForward.normalize();

        this.#cameraRight = Vector3.cross(
            this.#cameraForward,
            this.#camera.getUp()
        );
        this.#cameraRight.normalize();

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
            this.#moveLeft(timer);
        }

        if (this.#actions.right) {
            this.#moveRight(timer);
        }

        if (this.#actions.up) {
            this.#moveUp(timer);
        }

        if (this.#actions.down) {
            this.#moveDown(timer);
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
        const speed = 5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#cameraForward, distance
        );

        this.#camera.setPosition(
            Vector3.subtract(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.subtract(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Moves the camera from current direction it is facing.
     * Updates the position and target.
     */
    #moveBackward(timer)
    {
        const speed = 5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#cameraForward, distance
        );

        this.#camera.setPosition(
            Vector3.add(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.add(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Moves the camera 90 degrees to the left of the direction it is facing.
     * Updates the position and target.
     */
    #moveLeft(timer)
    {
        const speed = 5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#cameraRight,
            distance
        );

        this.#camera.setPosition(
            Vector3.add(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.add(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Moves the camera 90 degrees to the right of the direction it is facing.
     * Updates the position and target.
     */
    #moveRight(timer)
    {
        const speed = 5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#cameraRight,
            distance
        );

        this.#camera.setPosition(
            Vector3.subtract(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.subtract(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Moves the camera 90 degrees upwards from the direction it is facing.
     * Updates the position and target.
     */
    #moveUp(timer)
    {
        const speed = 5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#camera.getUp(),
            distance
        );

        this.#camera.setPosition(
            Vector3.subtract(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.subtract(this.#camera.getTarget(), movement)
        );
    }

    /**
     * Moves the camera 90 degrees downwards from the direction it is facing.
     * Updates the position and target.
     */
    #moveDown(timer)
    {
        const speed = 5;
        const distance = speed * timer.getDeltaTime();

        const movement = Vector3.multiplyScalar(
            this.#camera.getUp(),
            distance
        );

        this.#camera.setPosition(
            Vector3.add(this.#camera.getPosition(), movement)
        );
        this.#camera.setTarget(
            Vector3.add(this.#camera.getTarget(), movement)
        );
    }
}

export {
    StandardController
};