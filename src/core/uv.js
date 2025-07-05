
/**
 * Represents a texture coordinate with u and v components.
 * Both components are stored as floating-point values in the range 0-1.
 */
class Uv
{
    constructor(u, v)
    {
        Uv.#validateComponent(u, 'u');
        Uv.#validateComponent(v, 'v');

        this.u = u;
        this.v = v;
    }

    /**
     * Creates an exact copy of this UV coordinate.
     */
    clone() {
        return new Uv(this.u, this.v);
    }

    /**
     * Convert the UV coordinate to an array.
     */
    toArray()
    {
        return [
            this.u,
            this.v
        ];
    }

    /**
     * Validates that a single UV component is in the range 0-1.
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
}

export {
    Uv
};