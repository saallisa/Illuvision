
/**
 * This class provides comprehensive vector operations for three dimensional
 * graphics programming.
 */
class Vector3
{
    constructor(x = 0, y = 0, z = 0)
    {
        Vector3.#validateComponents(x, y, z);

        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Modifies this vector by adding another vector to it.
     */
    add(other)
    {
        Vector3.#validateInstance(other);

        this.x = this.x + other.x;
        this.y = this.y + other.y;
        this.z = this.z + other.z;
    }

    /**
     * Modifies this vector by subtracting another vector from it.
     */
    subtract(other)
    {
        Vector3.#validateInstance(other);

        this.x = this.x - other.x;
        this.y = this.y - other.y;
        this.z = this.z - other.z;
    }

    /**
     * Modifies this vector by crossing it with another vector.
     */
    cross(other)
    {
        Vector3.#validateInstance(other);

        newX = this.y * other.z - this.z * other.y;
        newY = this.z * other.x - this.x * other.z;
        newZ = this.x * other.y - this.y * other.x;

        this.x = newX;
        this.y = newY;
        this.z = newZ;
    }

    /**
     * Returns the length of this vector.
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Normalizes this vector directly.
     */
    normalize()
    {
        const length = this.length();
        
        if (length !== 0) {
            this.x = this.x / length;
            this.y = this.y / length;
            this.z = this.z / length;
        }
    }

    /**
     * Add another vector to this one and return the result as a new vector.
     */
    addOther(other) {
        return Vector3.add(this, other);
    }

    /**
     * Subtract another vector from this one and return the result as a new
     * vector.
     */
    subtractOther(other) {
        return Vector3.subtract(this, other);
    }

    /**
     * Cross this vector with another and return the result as a new vector.
     */
    crossOther(other) {
        return Vector3.cross(this, other);
    }

    /**
     * Add two vectors without modifying them.
     */
    static add(vectorA, vectorB)
    {
        Vector3.#validateInstance(vectorA);
        Vector3.#validateInstance(vectorB);

        const x = vectorA.x + vectorB.x;
        const y = vectorA.y + vectorB.y;
        const z = vectorA.z + vectorB.z;

        return new Vector3(x, y, z);
    }

    /**
     * Subtracts two vectors without modifying them.
     */
    static subtract(vectorA, vectorB)
    {
        Vector3.#validateInstance(vectorA);
        Vector3.#validateInstance(vectorB);

        const x = vectorA.x - vectorB.x;
        const y = vectorA.y - vectorB.y;
        const z = vectorA.z - vectorB.z;

        return new Vector3(x, y, z);
    }

    /**
     * Calculate cross product of two vectors without modifying them.
     */
    static cross(vectorA, vectorB)
    {
        Vector3.#validateInstance(vectorA);
        Vector3.#validateInstance(vectorB);

        const x = vectorA.y * vectorB.z - vectorA.z * vectorB.y;
        const y = vectorA.z * vectorB.x - vectorA.x * vectorB.z;
        const z = vectorA.x * vectorB.y - vectorA.y * vectorB.x;

        return new Vector3(x, y, z);
    }

    /**
     * Returns a normalized copy of this vector.
     */
    static normalize(vector)
    {
        Vector3.#validateInstance(vector);

        const length = vector.length();
        
        if (length === 0) {
            return new Vector3(0, 0, 0);
        }
        
        return new Vector3(
            vector.x / length,
            vector.y / length,
            vector.z / length
        );
    }

    /**
     * Convert the vector to an array.
     */
    toArray()
    {
        return [
            this.x,
            this.y,
            this.z
        ];
    }

    /**
     * Creates a copy of this vector.
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
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

    /**
     * Validates multiple components at once.
     */
    static #validateComponents(x, y, z)
    {
        Vector3.#validateComponent(x, 'x');
        Vector3.#validateComponent(y, 'y');
        Vector3.#validateComponent(z, 'z');
    }

    /**
     * Validates that an object is a Vector3 instance.
     */
    static #validateInstance(value)
    {
        if (!(value instanceof Vector3)) {
            throw new TypeError('Expected an instance of Vector3.');
        }
    }
}

export {
    Vector3
};