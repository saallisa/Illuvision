
import { Camera } from './camera.js';
import { Matrix4 } from '../matrix4.js';

/**
 * Represents an orthographic camera.
 */
class OrthographicCamera extends Camera
{
    #left = null;
    #right = null;
    #top = null;
    #bottom = null;
    #near = null;
    #far = null;

    constructor(left = -5, right = 5, top = 5, bottom = -5, near = 0, far = 10)
    {
        super();

        if (left > right) {
            throw new Error(
                'The left value must be smaller than the right value!'
            );
        }

        if (bottom > top) {
            throw new Error(
                'The top value must be larger than the bottom value!'
            );
        }

        if (near > far) {
            throw new Error(
                'The far value must be larger than the near value!'
            );
        }

        this.#left = left;
        this.#right = right;
        this.#top = top;
        this.#bottom = bottom;
        this.#near = near;
        this.#far = far;
    }

    /**
     * Returns the projection matrix for the orthographic camera.
     */
    getProjectionMatrix()
    {
        const projection = Matrix4.createOrthgraphicProjection(
            this.#left, this.#right,
            this.#top, this.#bottom,
            this.#near, this.#far
        );
        
        return projection;
    }
}

export {
    OrthographicCamera
};