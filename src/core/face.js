
/**
 * Represents a face in a 3D geometry by storing indices that reference
 * vertex indices in a vertex array.
 */
class Face
{
    #indices = null;

    constructor(indices)
    {
        Face.#validateIndices(indices);

        // As arrays are passed as a reference, create a copy to be safe.
        this.#indices = Array.from(indices);
    }

    /**
     * Gets the vertex indices for this face.
     */
    getIndices() {
        return Array.from(this.#indices);
    }

    /**
     * Gets the number of vertices in this face.
     */
    getVertexCount() {
        return this.#indices.length;
    }

    /**
     * Returns a copy of this face.
     */
    clone() {
        return new Face(this.#indices);
    }

    /**
     * Validates that indices is a proper array of non-negative integers.
     */
    static #validateIndices(indices)
    {
        if (!Array.isArray(indices)) {
            throw new TypeError('Indices must be an array.');
        }

        if (indices.length < 3) {
            throw new TypeError('Face must have at least 3 vertex indices.');
        }

        // Validate each index
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            
            if (typeof index !== 'number') {
                throw new TypeError(
                    `Index at position ${i} must be a number.`
                );
            }
            
            if (!Number.isInteger(index)) {
                throw new TypeError(
                    `Index at position ${i} must be an integer.`
                );
            }
            
            if (index < 0) {
                throw new TypeError(
                    `Index at position ${i} must be non-negative.`
                );
            }
        }

        // Check for duplicate indices (would create degenerate face)
        const uniqueIndices = new Set(indices);
        if (uniqueIndices.size !== indices.length) {
            throw new TypeError('Face cannot have duplicate vertex indices.');
        }
    }
}

export {
    Face
};