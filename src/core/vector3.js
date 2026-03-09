
import { Matrix3 } from './matrix3.js';
import { Quaternion } from './quaternion.js';

/**
 * This class provides comprehensive vector operations for three dimensional
 * graphics programming.
 */
class Vector3
{
    constructor(x = 0, y = 0, z = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Modifies this vector by adding another vector to it.
     */
    add(other)
    {
        Vector3.validateInstance(other);

        this.x = this.x + other.x;
        this.y = this.y + other.y;
        this.z = this.z + other.z;
    }

    /**
     * Modifies this vector by subtracting another vector from it.
     */
    subtract(other)
    {
        Vector3.validateInstance(other);

        this.x = this.x - other.x;
        this.y = this.y - other.y;
        this.z = this.z - other.z;
    }

    /**
     * Modifies this vector by crossing it with another vector.
     */
    cross(other)
    {
        Vector3.validateInstance(other);

        const newX = this.y * other.z - this.z * other.y;
        const newY = this.z * other.x - this.x * other.z;
        const newZ = this.x * other.y - this.y * other.x;

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
     * Calculates the distance between this and another vector.
     */
    distanceTo(other)
    {
        Vector3.validateInstance(other);

        return this.subtractOther(other).length();
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
     * Multiply this vector's components by the given scalar.
     */
    multiplyScalar(scalar)
    {
        Vector3.#validateComponent(scalar, 'scalar');

        this.x = this.x * scalar;
        this.y = this.y * scalar;
        this.z = this.z * scalar;
    }

    /**
     * Transforms this vector by using a 3x3 matrix
     */
    transformMatrix3(matrix)
    {
        Matrix3.validateInstance(matrix);

        const m = matrix.toArray();

        const newX = this.x * m[0] + this.y * m[3] + this.z * m[6];
        const newY = this.x * m[1] + this.y * m[4] + this.z * m[7];
        const newZ = this.x * m[2] + this.y * m[5] + this.z * m[8];

        this.x = newX;
        this.y = newY;
        this.z = newZ;
    }

    /**
     * Transforms this vector by using a Quaternion.
     */
    transformQuaternion(quaternion)
    {
        Quaternion.validateInstance(quaternion);

        const qx = quaternion.x;
        const qy = quaternion.y;
        const qz = quaternion.z;
        const qw = quaternion.w;

        // Calculate the cross product of the quaternion vector and this vector
        const tx = 2 * (qy * this.z - qz * this.y);
        const ty = 2 * (qz * this.x - qx * this.z);
        const tz = 2 * (qx * this.y - qy * this.x);

        // Apply the final formula
        this.x = this.x + qw * tx + (qy * tz - qz * ty);
        this.y = this.y + qw * ty + (qz * tx - qx * tz);
        this.z = this.z + qw * tz + (qx * ty - qy * tx);
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
     * Dot this vector with another vector and return the result.
     */
    dot(other) {
        return Vector3.dot(this, other);
    }

    /**
     * Multiply this vector's components by the given scalar and return the
     * result as a new vector.
     */
    multiplyScalarOther(scalar)
    {
        Vector3.#validateComponent(scalar, 'scalar');

        const x = this.x * scalar;
        const y = this.y * scalar;
        const z = this.z * scalar;

        return new Vector3(x, y, z);
    }

    /**
     * Transforms this vector by using a 3x3 matrix and return the result as
     * a new vector.
     */
    transformMatrix3Other(matrix)
    {
        Matrix3.validateInstance(matrix);

        const m = matrix.toArray();

        const newX = this.x * m[0] + this.y * m[3] + this.z * m[6];
        const newY = this.x * m[1] + this.y * m[4] + this.z * m[7];
        const newZ = this.x * m[2] + this.y * m[5] + this.z * m[8];

        return new Vector3(newX, newY, newZ);
    }

    /**
     * Transforms this vector by using a Quaternion and return the result as
     * a new vector.
     */
    transformQuaternionOther(quaternion)
    {
        Quaternion.validateInstance(quaternion);

        const qx = quaternion.x;
        const qy = quaternion.y;
        const qz = quaternion.z;
        const qw = quaternion.w;

        // Calculate the cross product of the quaternion vector and this vector
        const tx = 2 * (qy * this.z - qz * this.y);
        const ty = 2 * (qz * this.x - qx * this.z);
        const tz = 2 * (qx * this.y - qy * this.x);

        // Apply the final formula
        return new Vector3(
            this.x + qw * tx + (qy * tz - qz * ty), // x
            this.y + qw * ty + (qz * tx - qx * tz), // y
            this.z + qw * tz + (qx * ty - qy * tx)  // z
        );
    }

    /**
     * Add two vectors without modifying them.
     */
    static add(vectorA, vectorB)
    {
        Vector3.validateInstance(vectorA);
        Vector3.validateInstance(vectorB);

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
        Vector3.validateInstance(vectorA);
        Vector3.validateInstance(vectorB);

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
        Vector3.validateInstance(vectorA);
        Vector3.validateInstance(vectorB);

        const x = vectorA.y * vectorB.z - vectorA.z * vectorB.y;
        const y = vectorA.z * vectorB.x - vectorA.x * vectorB.z;
        const z = vectorA.x * vectorB.y - vectorA.y * vectorB.x;

        return new Vector3(x, y, z);
    }

    /**
     * Calculate the dot product of two vectors.
     */
    static dot(vectorA, vectorB)
    {
        Vector3.validateInstance(vectorA);
        Vector3.validateInstance(vectorB);

        const x = vectorA.x * vectorB.x;
        const y = vectorA.y * vectorB.y;
        const z = vectorA.z * vectorB.z;

        return x + y + z;
    }

    /**
     * Returns a normalized copy of this vector.
     */
    static normalize(vector)
    {
        Vector3.validateInstance(vector);

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
     * Multiplies a vector with a scalar.
     */
    static multiplyScalar(vector, scalar)
    {
        Vector3.validateInstance(vector);
        Vector3.#validateComponent(scalar, 'scalar');

        return vector.multiplyScalarOther(scalar);
    }

    /**
     * Calculate the distance between two vectors.
     */
    static distance(vectorA, vectorB)
    {
        Vector3.validateInstance(vectorA);
        Vector3.validateInstance(vectorB);

        return vectorA.subtractOther(vectorB).length();
    }

    /**
     * Transforms a vector with a 3x3 matrix and returns the result as a new
     * vector.
     */
    static transformMatrix3(vector, matrix)
    {
        Vector3.validateInstance(vector);

        return vector.transformMatrix3Other(matrix);
    }

    /**
     * Transforms a vector with a quaternion and returns the result as a new
     * vector.
     */
    static transformQuaternion(vector, quaternion)
    {
        Vector3.validateInstance(vector);

        return vector.transformQuaternionOther(quaternion);
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
        Vector3.#validateComponent(x, 'x');
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
        Vector3.#validateComponent(y, 'y');
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
        Vector3.#validateComponent(z, 'z');
        this._z = z;
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
     * Validates that an object is a Vector3 instance.
     */
    static validateInstance(value)
    {
        if (!(value instanceof Vector3)) {
            throw new TypeError('Expected an instance of Vector3.');
        }
    }
}

export {
    Vector3
};