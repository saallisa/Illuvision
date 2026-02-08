
import { Camera } from '../camera.js';
import { Engine } from '../../../engine.js';
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
    #canvas = null;
    #sensitivity = 0.001;

    #yaw = null;
    #pitch = null;

    #boundHandlers = {
        keydown: null,
        keyup: null,
        mousemove: null
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

        if (options.sensitivity !== undefined) {
            this.sensitivity = options.sensitivity;
        }

        // Calculate current yaw and pitch
        this.#calculateAngles();

        // Bind event handlers
        this.#boundHandlers.keydown = this.#handleKeyDown.bind(this);
        this.#boundHandlers.keyup = this.#handleKeyUp.bind(this);
        this.#boundHandlers.mousemove = this.#handleMouseMove.bind(this);
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
     * Locks the pointer to the canvas and enables mouse look
     */
    pointerLock(engine)
    {
        Engine.validateEngine(engine);

        this.#canvas = engine.getCanvas();
        this.#canvas.requestPointerLock();

        document.addEventListener('mousemove', this.#boundHandlers.mousemove);
    }

    /**
     * Removes the pointer lock and disables mouse look
     */
    pointerUnlock()
    {
        if (document.pointerLockElement === this.#canvas) {
            document.exitPointerLock();
        }
        
        document.removeEventListener('mousemove', this.#boundHandlers.mousemove);
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
     * Gets the current movement speed.
     */
    get speed() {
        return this.#speed;
    }

    /**
     * Sets a new movement speed.
     */
    set speed(speed)
    {
        Vector3.validateInstance(speed);
        this.#speed = speed;
    }

    /**
     * Gets current mouse sensitivity
     */
    get sensitivity() {
        return this.#sensitivity;
    }

    /**
     * Sets mouse sensitivity
     */
    set sensitivity(sensitivity)
    {
        if (typeof sensitivity !== 'number' || sensitivity <= 0) {
            throw new TypeError('Sensitivity must be a positive number.');
        }
        
        this.#sensitivity = sensitivity;
    }

    /**
     * Calculates the current forward and right of the camera.
     */
    #calculateCameraDirections()
    {
        // Forward vector
        this.#cameraForward = Vector3.subtract(
            this.#camera.getPosition(),
            this.#camera.getTarget()
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
     * Calculate current yaw and pitch angles of the camera.
     */
    #calculateAngles()
    {
        const direction = Vector3.subtract(
            this.#camera.getTarget(), 
            this.#camera.getPosition()
        );
        direction.normalize();

        this.#yaw = Math.atan2(direction.x, direction.z);
        this.#pitch = Math.asin(direction.y);
    }

    /**
     * Updates camera target based on yaw and pitch
     */
    #updateCameraTarget()
    {
        // Calculate new direction vector
        const direction = new Vector3(
            Math.sin(this.#yaw) * Math.cos(this.#pitch),
            Math.sin(this.#pitch),
            Math.cos(this.#yaw) * Math.cos(this.#pitch)
        );

        // Update camera target
        this.#camera.setTarget(Vector3.add(
            this.#camera.getPosition(), direction
        ));
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
     * Handles mouse movement for camera rotation
     */
    #handleMouseMove(event)
    {
        // Only process if pointer is locked
        if (document.pointerLockElement !== this.#canvas) {
            return;
        }

        // Update yaw (horizontal rotation) and pitch (vertical rotation)
        this.#yaw -= event.movementX * this.#sensitivity;
        this.#pitch -= event.movementY * this.#sensitivity;

        // Update camera target based on new angles
        this.#updateCameraTarget();
    }
}

export {
    StandardController
};