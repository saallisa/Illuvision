
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
     * Transposes this matrix and returns the result as a new Matrix3 instance
     * without changing the original one.
     */
    transpose() {
        return new Matrix3(Matrix3.#transposeArray(this.#elements));
    }

    /**
     * Returns the matrix as an array.
     */
    toArray() {
        return Array.from(this.#elements);
    }

    /**
	 * Copy the upper 3x3 matrix of the given 4x4 matrix into a new Matrix3.
	 */
	static fromMatrix4(matrix)
    {
        Matrix4.validateInstance(matrix);

		const m = matrix.toArray();

		elements = [
			m[0], m[1], m[2],
			m[4], m[5], m[6],
			m[8], m[9], m[10]
        ];

		return new Matrix3(elements);
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
}

export {
    Matrix3
};