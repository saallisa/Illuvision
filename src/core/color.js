
/**
 * Represents a color with red, green, blue, and alpha components.
 * All components are stored as floating-point values in the range 0-1.
 */
class Color
{
    constructor(red = 0, green = 0, blue = 0, alpha = 1)
    {
        Color.#validateComponents(red, green, blue, alpha);

        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    /**
     * Linear interpolation from this color towards another color.
     */
    lerpSelf(color, t)
    {
        Color.#validateColorInstance(color, 'color');
        Color.#validateComponent(t, 'interpolation factor');

        this.red += (color.red - this.red) * t;
        this.green += (color.green - this.green) * t;
        this.blue += (color.blue - this.blue) * t;
    }

    /**
     * Fade the color towards black by a specified amount.
     * Modifies the original color instance.
     */
    darkenSelf(amount) {
        return this.lerpSelf(Color.BLACK, amount);
    }

    /**
     * Fade the color towards white by a specified amount.
     * Modifies the original color instance.
     */
    lightenSelf(amount) {
        return this.lerpSelf(Color.WHITE, amount);
    }

    /**
     * Linear interpolation from this color towards another color.
     * Returns a new Color instance without modifying the original.
     */
    lerp(color, t)
    {
        Color.#validateColorInstance(color, 'color');
        Color.#validateComponent(t, 'interpolation factor');

        const red = this.red + (color.red - this.red) * t;
        const green = this.green + (color.green - this.green) * t;
        const blue = this.blue + (color.blue - this.blue) * t;

        return new Color(red, green, blue, this.alpha);
    }

    /**
     * Darken the color towards black by a specified amount.
     * Returns a new Color instance without modifying the original.
     */
    darken(amount) {
        return this.lerp(Color.BLACK, amount);
    }

    /**
     * Lighten the color towards white by a specified amount.
     * Returns a new Color instance without modifying the original.
     */
    lighten(amount) {
        return this.lerp(Color.WHITE, amount);
    }

    /**
     * Create an exact copy of this color.
     */
    clone() {
        return new Color(this.red, this.green, this.blue, this.alpha);
    }

    /**
     * Convert the color to an array suitable for WebGPU uniforms.
     */
    toArray()
    {
        return [
            this.red,
            this.green,
            this.blue,
            this.alpha
        ];
    }

    /**
     * Convert the color to an array with only red, green and blue, without
     * using the alpha value.
     */
    toRgbArray()
    {
        return [
            this.red,
            this.green,
            this.blue
        ];
    }

    /**
     * Return as an object which can be used in the clearValue of a render pass
     * descriptor.
     */
    toClearValue()
    {
        return {
            r: this.red,
            g: this.green,
            b: this.blue,
            a: this.alpha
        }
    }

    /**
     * Linear interpolation from one color towards another color.
     * Returns a new Color instance without modifying the originals.
     */
    static lerp(color, other, t)
    {
        Color.#validateColorInstance(color, 'color');
        Color.#validateColorInstance(other, 'other');

        return color.lerp(other, t);
    }

    /**
     * Linear interpolation for multiple, differently weighted colors.
     * Returns a new Color instance without modifying the originals.
     */
    static multiLerp(colors, weights)
    {
        this.#validateMultiLerp(colors, weights);

        let red = 0;
        let green = 0;
        let blue = 0;
        let alpha = 0;

        // Add all the color values together using the weight.
        colors.forEach((color, index) => {
            if (!(color instanceof Color)) {
                throw new TypeError(
                    'All colors must be an instance of Color class.'
                );
            }

            red += color.red * weights[index];
            green += color.green * weights[index];
            blue += color.green * weights[index];
            alpha += color.alpha * weights[index];
        });

        return new Color(red, green, blue, alpha);
    }

    /**
     * Converts a hex color string to gpu compatible float values.
     */
    static fromHex(hex)
    {
        Color.#validateHexCode(hex);

        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;

        return new Color(r, g, b, 1);
    }

    /**
     * Validates that a single color component is in the range 0-1.
     */
    static #validateComponent(value, componentName)
    {
        if (typeof value !== 'number' || !isFinite(value)) {
            throw new TypeError(
                `Invalid value for ${componentName}: expected a finite number`
            );
        }

        if (value < 0 || value > 1) {
            throw new RangeError(
                `Invalid value for ${componentName}: must be between 0 and 1`
            );
        }
    }

    /**
     * Validates that all color components are in the valid range.
     */
    static #validateComponents(red, green, blue, alpha)
    {
        Color.#validateComponent(red, 'red');
        Color.#validateComponent(green, 'green');
        Color.#validateComponent(blue, 'blue');
        Color.#validateComponent(alpha, 'alpha');
    }

    /**
     * Validates that a value is a color instance.
     */
    static #validateColorInstance(value, name)
    {
        if (!(value instanceof Color)) {
            throw new TypeError(
                `${name} must be an instance of Color class.`
            );
        }
    }

    /**
     * Validates the input for the multi lerp method.
     */
    static #validateMultiLerp(colors, weights)
    {
        if (!Array.isArray(colors) || !Array.isArray(weights)) {
            throw new TypeError(
                'Colors and weights must be provided in an array!'
            );
        }

        if (colors.length !== weights.length) {
            throw new TypeError('There must be a weight for each color!');
        }

        Color.#validateWeights(weights);
    }

    /**
     * Validates that a weights array adds up to approximately 1.
     */
    static #validateWeights(weights)
    {
        const sumWeights = weights.reduce(function (total, weight) {
            Color.#validateComponent(weight, 'weight');
            return total + weight;
        }, 0);

        if (sumWeights < 0.99 || sumWeights > 1.01) {
            throw new Error('Sum of weights must be approximately 1!');
        }
    }

    /**
     * Validates that a hex color string is valid.
     */
    static #validateHexCode(hex)
    {
        if (hex === null || hex === undefined) {
            throw new Error('Hex code may not be empty.');
        }

        if (typeof hex !== 'string' || hex.trim().length !== 6) {
            throw new TypeError(
                'Hex code must be provided as a string.'
            );
        }

        if (hex.match(/^[A-Fa-f0-9]{6}$/) === null) {
            throw new Error('Invalid hex color code.');
        }
    }

    // Some quick factory methods for creating base colors.

    static get RED() {
        return new Color(1, 0, 0, 1);
    }

    static get MAROON() {
        return new Color(0.5, 0, 0, 1);
    }

    static get GREEN() {
        return new Color(0, 0.5, 0, 1);
    }

    static get LIME() {
        return new Color(0, 1, 0, 1);
    }

    static get BLUE() {
        return new Color(0, 0, 1, 1);
    }

    static get WHITE() {
        return new Color(1, 1, 1, 1);
    }

    static get BLACK() {
        return new Color(0, 0, 0, 1);
    }

    static get GREY() {
        return new Color(0.5, 0.5, 0.5, 1);
    }

    static get YELLOW() {
        return new Color(1, 1, 0, 1);
    }

    static get MAGENTA() {
        return new Color(1, 0, 1, 1);
    }

    static get PURPLE() {
        return new Color(0.5, 0, 0.5, 1);
    }
}

export {
    Color
};