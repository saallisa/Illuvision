
/**
 * Represents a quaternion and allows various operations.
 */
class Quaternion
{
    constructor(x = 0, y = 0, z = 0, w = 1)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Multiplies this quaternion by another quaternion.
     */
    multiply(other)
    {
        Quaternion.validateInstance(other);

        const result = Quaternion.#multiplyArray(
            this.toArray(),
            other.toArray()
        );

        this.x = result[0];
        this.y = result[1];
        this.z = result[2];
        this.w = result[3];
    }

    /**
     * Multiplies this quaternion by another quaternion and returns the result
     * as a new Quaternion.
     */
    multiplyOther(other)
    {
        Quaternion.validateInstance(other);

        const result = Quaternion.#multiplyArray(
            this.toArray(),
            other.toArray()
        );

        return new Quaternion(
            result[0],
            result[1],
            result[2],
            result[3]
        );
    }

    /**
     * Converts this quaternion to an array representation.
     */
    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Creates a copy of this quaternion.
     */
    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    /**
     * Gets x directly.
     */
    get x() {
        return this._x;
    }

    /**
     * Sets x directly, but with validation.
     */
    set x(x)
    {
        Quaternion.#validateComponent(x, 'x');
        this._x = x;
    }

    /**
     * Gets y directly.
     */
    get y() {
        return this._y;
    }

    /**
     * Sets y directly, but with validation.
     */
    set y(y)
    {
        Quaternion.#validateComponent(y, 'y');
        this._y = y;
    }

    /**
     * Gets z directly.
     */
    get z() {
        return this._z;
    }

    /**
     * Sets z directly, but with validation.
     */
    set z(z)
    {
        Quaternion.#validateComponent(z, 'z');
        this._z = z;
    }

    /**
     * Gets w directly.
     */
    get w() {
        return this._w;
    }

    /**
     * Sets w directly, but with validation.
     */
    set w(w)
    {
        Quaternion.#validateComponent(w, 'w');
        this._w = w;
    }

    /**
     * Multiplies two quaternions together and returns the result as a new
     * Quaternion.
     */
    static multiply(q1, q2)
    {
        Quaternion.validateInstance(q1);
        Quaternion.validateInstance(q2);

        const result = Quaternion.#multiplyArray(
            q1.toArray(),
            q2.toArray()
        );

        return new Quaternion(
            result[0],
            result[1],
            result[2],
            result[3]
        );
    }

    /**
     * Validates that the provided value is an instance of Quaternion.
     */
    static validateInstance(value)
    {
        if (!(value instanceof Quaternion)) {
            throw new Error('Value must be an instance of Quaternion.');
        }
    }

    /**
     * Multiplies two quaternions represented as arrays and returns the result
     * as an array.
     */
    static #multiplyArray(q1, q2)
    {
        const q1x = q1[0];
        const q1y = q1[1];
        const q1z = q1[2];
        const q1w = q1[3];

        const q2x = q2[0];
        const q2y = q2[1];
        const q2z = q2[2];
        const q2w = q2[3];
        
        const x = q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y;
        const y = q1w * q2y - q1x * q2z + q1y * q2w + q1z * q2x;
        const z = q1w * q2z + q1x * q2y - q1y * q2x + q1z * q2w;
        const w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;

        return [x, y, z, w];
    }

    /**
     * Validates that a single component is a finite number.
     */
    static #validateComponent(value, componentName)
    {
        if (typeof value !== 'number' || !isFinite(value)) {
            throw new TypeError(
                `Invalid value for ${componentName}: expected a finite number`
            );
        }
    }
}

export {
    Quaternion
};