
/**
 * Base class for all objects (geometries, lines and points)
 * Provides a common interface for buffer creation and data management.
 */
class Object
{
    #id = null;

    constructor() {
        this.#id = crypto.randomUUID();
    }

    /**
     * Gets the universally unique identifier of this object.
     */
    getId() {
        return this.#id;
    }

    // Topology constants
    static get TRIANGLES() {
        return 'triangle-list';
    }

    static get LINES() {
        return 'line-list';
    }

    static get POINTS() {
        return 'point-list';
    }
}

export {
    Object
};