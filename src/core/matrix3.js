
import { Matrix4 } from './matrix4.js';

/**
 * This class provides comprehensive 3x3 matrix operations for three
 * dimensional graphics programming and transformations.
 */
class Matrix3
{
    #elements;

    constructor(elements = null)
    {
        if (elements === null) {
            this.#elements = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ];
        } else {
            Matrix3.#validateElements(elements);
            this.#elements = Array.from(elements);
        }
    }

    /**
     * Get element at row and column.
     */
    get(row, col)
    {
        Matrix3.#validateComponent(row, 'row');
        Matrix3.#validateComponent(col, 'col');

        Matrix3.#validateRowCol(row, col);

        return this.#elements[row * 3 + col];
    }

    /**
     * Set element at row and column.
     */
    set(row, col, value)
    {
        Matrix3.#validateComponent(row, 'row');
        Matrix3.#validateComponent(col, 'col');
        Matrix3.#validateComponent(value, 'value');

        Matrix3.#validateRowCol(row, col);

        this.#elements[row * 3 + col] = value;
    }

    /**
     * Transposes this matrix directly.
     */
    transposeSelf() {
        this.#elements = Matrix3.#transposeArray(this.toArray());
    }

    /**
     * Transposes this matrix and returns the result as a new Matrix3 instance
     * without changing the original one.
     */
    transpose() {
        return new Matrix3(Matrix3.#transposeArray(this.#elements));
    }

    /**
     * Calculate the determinant of this matrix using the leibnitz formula.
     */
    determinant() {
		return Matrix3.#determinantArray(this.#elements);
    }

    /**
     * Inverts this matrix directly.
     */
    invertSelf() {
        this.#elements = Matrix3.#invertArray(this.toArray());
    }

    /**
     * Inverts this matrix and returns the result as a new Matrix3 instance
     * without changing the original one.
     */
    invert() {
        return new Matrix3(Matrix3.#invertArray(this.#elements));
    }

    /**
     * Returns the matrix as an array.
     */
    toArray() {
        return Array.from(this.#elements);
    }

    /**
     * Returns the matrix as an aligned array.
     */
    toBufferArray()
    {
        const m = this.#elements;

        return [
            m[0], m[1], m[2], 0,
			m[3], m[4], m[5], 0,
			m[6], m[7], m[8], 0
        ];
    }

    /**
	 * Copy the upper 3x3 matrix of the given 4x4 matrix into a new Matrix3.
	 */
	static fromMatrix4(matrix)
    {
        Matrix4.validateInstance(matrix);

		const m = matrix.toArray();

		return new Matrix3([
			m[0], m[1], m[2],
			m[4], m[5], m[6],
			m[8], m[9], m[10]
        ]);
	}

    /**
     * Transposes a Matrix3 instance.
     */
    static transpose(matrix)
    {
        Matrix3.validateInstance(matrix);

        return new Matrix3(Matrix3.#transposeArray(matrix.toArray()));
    }

    /**
     * Inverts a Matrix3 instance.
     */
    static invert(matrix)
    {
        Matrix3.validateInstance(matrix);

        return new Matrix3(Matrix3.#invertArray(matrix.toArray()));
    }

    /**
     * Validates that an object is a Matrix3 instance.
     */
    static validateInstance(value)
    {
        if (!(value instanceof Matrix3)) {
            throw new TypeError('Expected an instance of Matrix3');
        }
    }

    /**
     * Validates the elements array for matrix construction.
     */
    static #validateElements(elements)
    {
        if (!Array.isArray(elements)) {
            throw new TypeError('Expected an array of 9 numbers');
        }

        if (elements.length !== 9) {
            throw new TypeError('Expected an array of exactly 9 numbers');
        }

        for (let i = 0; i < 9; i++) {
            Matrix3.#validateComponent(elements[i], `element[${i}]`);
        }
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
     * Validates row and column indices.
     */
    static #validateRowCol(row, col)
    {
        if (row < 0 || row >= 3 || col < 0 || col >= 3) {
            throw new RangeError('Row and column must be between 0 and 2');
        }
    }

    /**
     * Transposes an array representation of a matrix and returns the result
     * as an array.
     */
    static #transposeArray(m)
    {
        const r = new Array(9);

        r[0] = m[0]; r[3] = m[1]; r[6] = m[2];
        r[1] = m[3]; r[4] = m[4]; r[7] = m[5];
        r[2] = m[6]; r[5] = m[7]; r[8] = m[8];

        return r;
    }

    /**
     * Calculates the determinant of the array representation of a matrix.
     */
    static #determinantArray(m)
    {
        const a = m[0], b = m[1], c = m[2];
	    const d = m[3], e = m[4], f = m[5];
		const g = m[6], h = m[7], i = m[8];

		let determinant = (a * e * i) + (b * f * g) + (c * d * h);
        determinant = determinant - (c * e * g) - (b * d * i) - (a * f * h);
        return determinant;
    }

    /**
     * Inverts an array representation of a matrix and returns the result as
     * a new array.
     */
    static #invertArray(m)
    {
        const determinant = Matrix3.#determinantArray(m);

        if (determinant === 0) {
            return [
                0, 0, 0,
                0, 0, 0,
                0, 0, 0
            ];
        }

        const invDet = 1 / determinant;
        const i = new Array(9);

		i[0] = (m[8] * m[4] - m[5] * m[7]) * invDet;
		i[1] = (m[2] * m[7] - m[8] * m[1]) * invDet;
		i[2] = (m[5] * m[1] - m[2] * m[4]) * invDet;

		i[3] = (m[5] * m[6] - m[8] * m[3]) * invDet;
		i[4] = (m[8] * m[0] - m[2] * m[6]) * invDet;
		i[5] = (m[2] * m[3] - m[5] * m[0]) * invDet;

		i[6] = (m[7] * m[3] - m[4] * m[6]) * invDet;
		i[7] = (m[1] * m[6] - m[7] * m[0]) * invDet;
		i[8] = (m[4] * m[0] - m[1] * m[3]) * invDet;

        return i;
    }
}

export {
    Matrix3
};