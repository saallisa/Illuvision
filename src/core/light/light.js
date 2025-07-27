
import { Color } from '../color.js';

/**
 * Abstract class representing the common values for any form of light.
 */
class Light
{
    #color = null;
    #intensity = null;

    constructor(color = Color.WHITE, intensity = 0.1)
    {
        Light.#validateColor(color);
        Light.#validateIntensity(intensity);

        this.#color = color;
        this.#intensity = intensity;
    }

    /**
     * Gets the light's color.
     */
    get color() {
        return this.#color;
    }

    /**
     * Sets the light's color.
     */
    set color(color)
    {
        Light.#validateColor(color);

        this.#color = color;
    }

    /**
     * Gets the light's intensity.
     */
    get intensity() {
        return this.#intensity;
    }

    /**
     * Sets the light's intensity.
     */
    set intensity(intensity)
    {
        Light.#validateIntensity(intensity);

        this.#intensity = intensity;
    }

    /**
     * Validates that the color is a valid color instance.
     */
    static #validateColor(color)
    {
        if (!(color instanceof Color) && color !== null) {
            throw new TypeError(
                'Light color must be a Color instance or null.'
            );
        }
    }

    /**
     * Validates that the intensity is in the range 0-1.
     */
    static #validateIntensity(intensity)
    {
        if (typeof intensity !== 'number' || !isFinite(intensity)) {
            throw new TypeError(
                `Invalid value for intensity: expected a finite number`
            );
        }

        if (intensity < 0 || intensity > 1) {
            throw new RangeError(
                `Invalid value for intensity: must be between 0 and 1`
            );
        }
    }
}

export {
    Light
};