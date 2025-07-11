
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

    // Some quick factory methods for creating base colors.

    static get RED() {
        return new Color(1, 0, 0, 1);
    }

    static get GREEN() {
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
}

export {
    Color
};