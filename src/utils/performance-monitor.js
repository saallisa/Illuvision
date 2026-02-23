
import { Timer } from '../core/timer.js';

/**
 * Class for monitoring rendering performance
 */
class PerformanceMonitor
{
    #timer = null;
    #timeSinceLastFpsUpdate = 0;
    #fpsUpdateInterval = 1.0;
    #container = null;

    constructor(timer)
    {
        if (!(timer instanceof Timer)) {
            throw new Error('Timer must be an instance of Timer.');
        }

        this.#timer = timer;
        this.#init();
    }

    /**
     * Returns the container for the performance monitor.
     */
    getContainer() {
        return this.#container;
    }

    /**
     * Updates the performance monitor.
     */
    update()
    {
        this.#timeSinceLastFpsUpdate += this.#timer.getDeltaTime();

        if (this.#timeSinceLastFpsUpdate >= this.#fpsUpdateInterval) {
            this.#container.textContent = 'FPS: ' + this.#timer.getFps();
            this.#timeSinceLastFpsUpdate = 0;
        }
    }

    /**
     * Initialize the performance monitor and apply default styling.
     */
    #init()
    {
        this.#container = document.createElement('div');

        const defaultStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '4px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '14px',
            left: '10px',
            padding: '8px 12px',
            pointerEvents: 'none',
            position: 'absolute',
            top: '10px',
            zIndex: '1000'
        };

        Object.assign(this.#container.style, defaultStyle);
        this.#container.textContent = 'FPS: --';
    }
}

export {
    PerformanceMonitor
};