
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
     * Returns the matrix as an array.
     */
    toArray() {
        return Array.from(this.#elements);
    }

    /**
     * Convenience method for creating a scaling matrix.
     */
    static createScale(x, y, z)
    {
        return new Matrix4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1 
        );
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
    static #validateInstance(value)
    {
        if (!(value instanceof Matrix4)) {
            throw new TypeError('Expected an instance of Matrix4');
        }
    }
}

export {
    Matrix4
};