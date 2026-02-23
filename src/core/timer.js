
/**
 * Timer utility class for tracking time.
 */
class Timer
{
    #lastTime = 0;
    #deltaTime = 0;
    #maxDeltaTime = 0.1;

    constructor() {
        this.reset();
    }

    /**
     * Sets the maximum allowed delta time in seconds.
     * Useful to prevent issues when the tab is in the background.
     */
    setMaxDeltaTime(max)
    {
        if (typeof max !== 'number' || max <= 0) {
            throw new Error('Max delta time must be a positive number.');
        }
        this.#maxDeltaTime = max;
    }

    /**
     * Returns the maximum allowed delta time in seconds.
     */
    getMaxDeltaTime() {
        return this.#maxDeltaTime;
    }

    /**
     * Returns the time elapsed since the last frame in seconds.
     */
    getDeltaTime() {
        return this.#deltaTime;
    }

    /**
     * Returns the current frames per second.
     */
    getFps()
    {
        if (this.#deltaTime > 0) {
            return Math.round(1 / this.#deltaTime);
        }

        return 0;
    }

    /**
     * Resets the timer to its initial state.
     */
    reset() {
        this.#lastTime = performance.now();
        this.#deltaTime = 0;
    }

    /**
     * Calculates the time difference since the last call in seconds.
     */
    update(timestamp = null)
    {
        const currentTime = timestamp ?? performance.now();
        const rawDeltaTime = (currentTime - this.#lastTime) / 1000;

        this.#deltaTime = Math.min(rawDeltaTime, this.#maxDeltaTime);
        this.#lastTime = currentTime;
    }
}

export {
    Timer
};