
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
        Matrix4.#validateInstance(other);

        this.#elements = Matrix4.#multiplyArray(
            this.#elements, other.toArray()
        );
    }

    /**
     * Multiply this matrix with another and return the result as a
     * new matrix.
     */
    multiplyOther(other) {
        Matrix4.#validateInstance(other);

        const result = Matrix4.#multiplyArray(
            this.#elements, other.toArray()
        );

        return new Matrix4(result);
    }

    /**
     * Returns the matrix as an array.
     */
    toArray() {
        return Array.from(this.#elements);
    }

    /**
     * Multiplies two Matrix4 instances.
     */
    static multiply(matrixA, matrixB)
    {
        Matrix4.#validateInstance(matrixA);
        Matrix4.#validateInstance(matrixB);

        const ma = matrixA.toArray();
        const mb = matrixB.toArray();

        return new Matrix4(
            Matrix4.#multiplyArray(ma, mb)
        );
    }

    /**
     * Convenience method for creating a translation matrix.
     */
    static createTranslation(x, y, z)
    {
        this.#validateComponent(x, 'x');
        this.#validateComponent(y, 'y');
        this.#validateComponent(z, 'z');

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
        this.#validateComponent(x, 'x');
        this.#validateComponent(y, 'y');
        this.#validateComponent(z, 'z');

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
     * Convenience method for creating a rotation x matrix.
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
}

export {
    Matrix4
};