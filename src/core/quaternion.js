
import { Matrix3 } from './matrix3.js';
import { Matrix4 } from './matrix4.js';
import { Vector3 } from './vector3.js';

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
     * Calculates the magnitude of this quaternion.
     */
    magnitude()
    {
        return Math.sqrt(
            this.x * this.x + this.y * this.y
            + this.z * this.z + this.w * this.w
        );
    }

    /**
     * Normalizes this quaternion directly.
     */
    normalize()
    {
        const magnitude = this.magnitude();

        if (magnitude > 0) {
            this.x = this.x / magnitude;
            this.y = this.y / magnitude;
            this.z = this.z / magnitude;
            this.w = this.w / magnitude;
        }
    }

    /**
     * Conjugates this quaternion directly.
     */
    conjugate()
    {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        // this.w stays the same
    }

    /**
     * Calculates the conjugate of this quaternion and returns the result as a
     * new Quaternion.
     */
    conjugateOther()
    {
        return new Quaternion(
            -this.x,
            -this.y,
            -this.z,
            this.w
        );
    }

    /**
     * Inverts this quaternion directly.
     */
    inverse()
    {
        const inverse = this.#inverseArray();

        this.x = inverse[0];
        this.y = inverse[1];
        this.z = inverse[2];
        this.w = inverse[3];
    }

    /**
     * Calculates the inverse of this quaternion and returns the result as a
     * new Quaternion.
     */
    inverseOther()
    {
        const inverse = this.#inverseArray();

        return new Quaternion(
            inverse[0],
            inverse[1],
            inverse[2],
            inverse[3]
        );
    }

    /**
     * Converts this quaternion to an array representation.
     */
    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Converts this quaternion into a rotation matrix for Matrix3
     */
    toMatrix3()
    {
        return new Matrix3(
            this.#toMatrixArray()
        );
    }

    /**
     * Converts this quaternion into a rotation matrix for Matrix4
     */
    toMatrix4()
    {
        const m = this.#toMatrixArray();

        return new Matrix4([
            m[0], m[1], m[2], 0,
            m[3], m[4], m[5], 0,
            m[6], m[7], m[8], 0,
            0, 0, 0, 1
        ]);
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
     * Creates a quaternion from axis and angle information.
     */
    static fromAxisAngle(axis, angle)
    {
        Vector3.validateInstance(axis);

        const radian = angle * Math.PI / 180;
        const halfRadian = radian / 2;

        const sin = Math.sin(halfRadian);

        return new Quaternion(
            sin * axis.x,
            sin * axis.y,
            sin * axis.z,
            Math.cos(halfRadian)
        );
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
     * Returns a normalized copy of this quaternion.
     */
    static normalize(quaternion)
    {
        Quaternion.validateInstance(quaternion);

        const magnitude = quaternion.magnitude();
        
        if (magnitude === 0) {
            return new Quaternion(0, 0, 0, 0);
        }
        
        return new Quaternion(
            quaternion.x / magnitude,
            quaternion.y / magnitude,
            quaternion.z / magnitude,
            quaternion.w / magnitude
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
     * Converts this quaternion into a rotation matrix. The resulting
     * matrix is returned as an array.
     */
    #toMatrixArray()
    {
        let matrix = [];

        const xx2 = 2 * this.x * this.x;
        const yy2 = 2 * this.y * this.y;
        const zz2 = 2 * this.z * this.z;

        const xy2 = 2 * this.x * this.y;
        const xz2 = 2 * this.x * this.z;

        const yz2 = 2 * this.y * this.z;

        const wx2 = 2 * this.w * this.x;
        const wy2 = 2 * this.w * this.y;
        const wz2 = 2 * this.w * this.z;

        matrix[0] = 1 - yy2 - zz2;
        matrix[1] = xy2 - wz2;
        matrix[2] = xz2 + wy2;
        matrix[3] = xy2 + wz2;
        matrix[4] = 1 - xx2 - zz2;
        matrix[5] = yz2 - wx2;
        matrix[6] = xz2 - wy2;
        matrix[7] = yz2 + wx2;
        matrix[8] = 1 - xx2 - yy2;

        return matrix;
    }

    /**
     * Inverts this quaternion and returns the result as an array.
     */
    #inverseArray()
    {
        const magSquared = this.x * this.x + this.y * this.y + 
            this.z * this.z + this.w * this.w;

        if (magSquared === 0) {
            return [0, 0, 0, 0];
        }

        const invMagSquared = 1.0 / magSquared;

        return [
            -this.x * invMagSquared,
            -this.y * invMagSquared,
            -this.z * invMagSquared,
            this.w * invMagSquared
        ];
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