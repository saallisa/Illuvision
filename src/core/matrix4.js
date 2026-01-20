
import { Matrix3 } from './matrix3.js';
import { Vector3 } from './vector3.js';

/**
 * This class provides comprehensive 4x4 matrix operations for three
 * dimensional graphics programming and transformations.
 */
class Matrix4
{
    #elements;

    constructor(elements = null)
    {
        if (elements === null) {
            this.#elements = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        } else {
            Matrix4.#validateElements(elements);
            this.#elements = Array.from(elements);
        }
    }

    /**
     * Get element at row and column.
     */
    get(row, col)
    {
        Matrix4.#validateComponent(row, 'row');
        Matrix4.#validateComponent(col, 'col');

        Matrix4.#validateRowCol(row, col);

        return this.#elements[row * 4 + col];
    }

    /**
     * Set element at row and column.
     */
    set(row, col, value)
    {
        Matrix4.#validateComponent(row, 'row');
        Matrix4.#validateComponent(col, 'col');
        Matrix4.#validateComponent(value, 'value');

        Matrix4.#validateRowCol(row, col);

        this.#elements[row * 4 + col] = value;
    }

    /**
     * Modifies this matrix by multiplying it with another matrix.
     */
    multiply(other)
    {
        Matrix4.validateInstance(other);

        this.#elements = Matrix4.#multiplyArray(
            this.#elements, other.toArray()
        );
    }

    /**
     * Multiply this matrix with another and return the result as a
     * new matrix.
     */
    multiplyOther(other)
    {
        Matrix4.validateInstance(other);

        const result = Matrix4.#multiplyArray(
            this.#elements, other.toArray()
        );

        return new Matrix4(result);
    }

    /**
     * Transposes this matrix directly.
     */
    transposeSelf()
    {
        const m = this.#elements;
        let temp;

        temp = m[1];  m[1] = m[4];   m[4] = temp;
        temp = m[2];  m[2] = m[8];   m[8] = temp;
        temp = m[3];  m[3] = m[12];  m[12] = temp;
        temp = m[6];  m[6] = m[9];   m[9] = temp;
        temp = m[7];  m[7] = m[13];  m[13] = temp;
        temp = m[11]; m[11] = m[14]; m[14] = temp;
    }

    /**
     * Transposes this matrix and returns the result as a new Matrix4 instance
     * without changing the original one.
     */
    transpose() {
        return new Matrix4(Matrix4.#transposeArray(this.#elements));
    }

    /**
     * Calculate the determinant of this matrix using the leibnitz formula.
     */
    determinant() {
		return Matrix4.#determinantArray(this.#elements);
    }

    /**
     * Inverts this matrix directly.
     */
    invertSelf() {
        this.#elements = Matrix4.#invertArray(this.toArray());
    }

    /**
     * Inverts this matrix and returns the result as a new Matrix4 instance
     * without changing the original one.
     */
    invert() {
        return new Matrix4(Matrix4.#invertArray(this.#elements));
    }

    /**
     * Returns the matrix as an array.
     */
    toArray() {
        return Array.from(this.#elements);
    }

    /**
     * Creates a copy of this matrix.
     */
    clone() {
        return new Matrix4(Array.from(this.#elements));
    }

    /**
     * Multiplies two Matrix4 instances.
     */
    static multiply(matrixA, matrixB)
    {
        Matrix4.validateInstance(matrixA);
        Matrix4.validateInstance(matrixB);

        const ma = matrixA.toArray();
        const mb = matrixB.toArray();

        return new Matrix4(
            Matrix4.#multiplyArray(ma, mb)
        );
    }

    /**
     * Transposes a Matrix4 instance.
     */
    static transpose(matrix)
    {
        Matrix4.validateInstance(matrix);

        return new Matrix4(Matrix4.#transposeArray(matrix.toArray()));
    }

    /**
     * Inverts a Matrix4 instance.
     */
    static invert(matrix)
    {
        Matrix4.validateInstance(matrix);

        return new Matrix4(Matrix4.#invertArray(matrix.toArray()));
    }

    /**
     * Convenience method for creating a translation matrix.
     */
    static createTranslation(x, y, z)
    {
        Matrix4.#validateComponent(x, 'x');
        Matrix4.#validateComponent(y, 'y');
        Matrix4.#validateComponent(z, 'z');

        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    /**
     * Convenience method for creating a scaling matrix.
     */
    static createScale(x, y, z)
    {
        Matrix4.#validateComponent(x, 'x');
        Matrix4.#validateComponent(y, 'y');
        Matrix4.#validateComponent(z, 'z');

        return new Matrix4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1 
        ]);
    }

    /**
     * Convenience method for creating a rotation x matrix.
     */
    static createRotateX(angle)
    {
        const radian = angle * Math.PI / 180;

        const cos = Math.cos(radian);
        const sin = Math.sin(radian);

        return new Matrix4([
            1, 0, 0, 0,
            0, cos, sin, 0,
            0, -sin, cos, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Convenience method for creating a rotation y matrix.
     */
    static createRotateY(angle)
    {
        const radian = angle * Math.PI / 180;

        const cos = Math.cos(radian);
        const sin = Math.sin(radian);

        return new Matrix4([
            cos, 0, -sin, 0,
            0, 1, 0, 0,
            sin, 0, cos, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Convenience method for creating a rotation z matrix.
     */
    static createRotateZ(angle)
    {
        const radian = angle * Math.PI / 180;

        const cos = Math.cos(radian);
        const sin = Math.sin(radian);

        return new Matrix4([
            cos, sin, 0, 0,
            -sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Convenience method for creating an orthographic projection matrix.
     */
    static createOrthographicProjection(left, right, top, bottom, near, far)
    {
        const width = 1 / (left - right);
        const height = 1 / (bottom - top);
        const depth = 1 / (near - far);

        const matrix = new Array(16);

        // First row
        matrix[0] = -2 * width;
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 0;

        // Second row
        matrix[4] = 0;
        matrix[5] = -2 * height;
        matrix[6] = 0;
        matrix[7] = 0;

        // Third row
        matrix[8] = 0;
        matrix[9] = 0;
        matrix[10] = depth;
        matrix[11] = 0;

        // Fourth row
        matrix[12] = (left + right) * width;
        matrix[13] = (top + bottom) * height;
        matrix[14] = near * depth;
        matrix[15] = 1;

        return new Matrix4(matrix);
    }

    /**
     * Convenience method for creating a perspective projection matrix.
     */
    static createPerspectiveProjection(fov, aspect, near, far)
    {
        const fovRad = fov * Math.PI / 180;
        const f = 1 / Math.tan(fovRad / 2);

        const matrix = new Array(16);

        const nf = 1 / (near - far);
        
        // First row
        matrix[0] = f / aspect;
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 0;
        // Second row
        matrix[4] = 0;
        matrix[5] = f;
        matrix[6] = 0;
        matrix[7] = 0;
        // Third row
        matrix[8] = 0;
        matrix[9] = 0;
        matrix[10] = far * nf;
        matrix[11] = -1;
        // Fourth row
        matrix[12] = 0;
        matrix[13] = 0;
        matrix[14] = far * near * nf;
        matrix[15] = 0;

        return new Matrix4(matrix);
    }

    /**
     * Convenience method for creating a look at matrix with position, target
     * and up parameters.
     */
    static createLookAt(position, target, up)
    {
        Vector3.validateInstance(position);
        Vector3.validateInstance(target);
        Vector3.validateInstance(up);

        const boundary = 0.0005;

        let z = Vector3.subtract(position, target);

        // For too small values return an identity matrix
        if (Math.abs(z.x) < boundary &&
            Math.abs(z.y) < boundary &&
            Math.abs(z.z) < boundary
        ) {
            return new Matrix4();
        }

        length = 1 / z.length();
        z.multiplyScalar(length);

        let x = Vector3.cross(up, z);
        length = x.length();

        if (length === 0) {
            x = new Vector3(0, 0, 0);
        } else {
            x.multiplyScalar(1 / length);
        }

        let y = Vector3.cross(z, x);
        length = y.length();

        if (length === 0) {
            y = new Vector3(0, 0, 0);
        } else {
            y.multiplyScalar(1 / length);
        }

        const matrix = new Array(16);

        matrix[0] = x.x, matrix[1] = y.x, matrix[2] = z.x, matrix[3] = 0;
        matrix[4] = x.y, matrix[5] = y.y, matrix[6] = z.y, matrix[7] = 0;
        matrix[8] = x.z, matrix[9] = y.z, matrix[10] = z.z, matrix[11] = 0;

        matrix[12] = -(x.x * position.x + x.y * position.y + x.z * position.z);
        matrix[13] = -(y.x * position.x + y.y * position.y + y.z * position.z);
        matrix[14] = -(z.x * position.x + z.y * position.y + z.z * position.z);
        matrix[15] = 1;

        return new Matrix4(matrix);
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
     * Validates the elements array for matrix construction.
     */
    static #validateElements(elements)
    {
        if (!Array.isArray(elements)) {
            throw new TypeError('Expected an array of 16 numbers');
        }

        if (elements.length !== 16) {
            throw new TypeError('Expected an array of exactly 16 numbers');
        }

        for (let i = 0; i < 16; i++) {
            Matrix4.#validateComponent(elements[i], `element[${i}]`);
        }
    }

    /**
     * Validates row and column indices.
     */
    static #validateRowCol(row, col)
    {
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            throw new RangeError('Row and column must be between 0 and 3');
        }
    }

    /**
     * Validates that an object is a Matrix4 instance.
     */
    static validateInstance(value)
    {
        if (!(value instanceof Matrix4)) {
            throw new TypeError('Expected an instance of Matrix4');
        }
    }

    /**
     * Multiplies two array representations of Matrix4 and returns the result
     * as an array.
     */
    static #multiplyArray(ma, mb)
    {
        const result = new Array(16);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let sum = 0;

                sum += ma[row * 4 + 0] * mb[0 * 4 + col];
                sum += ma[row * 4 + 1] * mb[1 * 4 + col];
                sum += ma[row * 4 + 2] * mb[2 * 4 + col];
                sum += ma[row * 4 + 3] * mb[3 * 4 + col];

                result[row * 4 + col] = sum;
            }
        }

        return result;
    }

    /**
     * Transposes an array representation of a matrix and returns the result
     * as an array.
     */
    static #transposeArray(m)
    {
        const r = new Array(16);

        r[0] = m[0];   r[4] = m[1];   r[8] = m[2];    r[12] = m[3];
        r[1] = m[4];   r[5] = m[5];   r[9] = m[6];    r[13] = m[7];
        r[2] = m[8];   r[6] = m[9];   r[10] = m[10];  r[14] = m[11];
        r[3] = m[12];  r[7] = m[13];  r[11] = m[14];  r[15] = m[15];

        return r;
    }

    /**
     * Calculates the determinant of the array representation of a matrix.
     */
    static #determinantArray(ma)
    {
        const a = ma[0], b = ma[1], c = ma[2], d = ma[3];
	    const e = ma[4], f = ma[5], g = ma[6], h = ma[7];
		const i = ma[8], j = ma[9], k = ma[10], l = ma[11];
        const m = ma[12], n = ma[13], o = ma[14], p = ma[15];

        const matA = new Matrix3([
            f, g, h,
            j, k, l,
            n, o, p
        ]);
        const detA = matA.determinant();

        const matB = new Matrix3([
            e, g, h,
            i, k, l,
            m, o, p
        ]);
        const detB = matB.determinant();
        
        const matC = new Matrix3([
            e, f, h,
            i, j, l,
            m, n, p
        ]);
        const detC = matC.determinant();

        const matD = new Matrix3([
            e, f, g,
            i, j, k,
            m, n, o
        ]);
        const detD = matD.determinant();

        return detA * a - detB * b + detC * c - detD * d;
    }

    /**
     * Inverts an array representation of a matrix and returns the result as
     * a new array.
     */
    static #invertArray(ma)
    {
        const determinant = Matrix4.#determinantArray(ma);

        if (determinant === 0) {
            return [
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ];
        }

        const a = ma[0], b = ma[1], c = ma[2], d = ma[3];
	    const e = ma[4], f = ma[5], g = ma[6], h = ma[7];
		const i = ma[8], j = ma[9], k = ma[10], l = ma[11];
        const m = ma[12], n = ma[13], o = ma[14], p = ma[15];

        let x0 = a * f - b * e;
        let x1 = a * g - c * e;
        let x2 = a * h - d * e;
        let x3 = b * g - c * f;
        let x4 = b * h - d * f;
        let x5 = c * h - d * g;
        let x6 = i * n - j * m;
        let x7 = i * o - k * m;
        let x8 = i * p - l * m;
        let x9 = j * o - k * n;
        let x10 = j * p - l * n;
        let x11 = k * p - l * o;

        const res = new Array(16);
        const det = 1.0 / determinant;

        res[0] = (f * x11 - g * x10 + h * x9) * det;
        res[1] = (c * x10 - b * x11 - d * x9) * det;
        res[2] = (n * x5 - o * x4 + p * x3) * det;
        res[3] = (k * x4 - j * x5 - l * x3) * det;
        res[4] = (g * x8 - e * x11 - h * x7) * det;
        res[5] = (a * x11 - c * x8 + d * x7) * det;
        res[6] = (o * x2 - m * x5 - p * x1) * det;
        res[7] = (i * x5 - k * x2 + l * x1) * det;
        res[8] = (e * x10 - f * x8 + h * x6) * det;
        res[9] = (b * x8 - a * x10 - d * x6) * det;
        res[10] = (m * x4 - n * x2 + p * x0) * det;
        res[11] = (j * x2 - i * x4 - l * x0) * det;
        res[12] = (f * x7 - e * x9 - g * x6) * det;
        res[13] = (a * x9 - b * x7 + c * x6) * det;
        res[14] = (n * x1 - m * x3 - o * x0) * det;
        res[15] = (i * x3 - j * x1 + k * x0) * det;

        return res;
    }
}

export {
    Matrix4
};