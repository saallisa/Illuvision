
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
        // x-axis
        const xLength = this.#right - this.#left;
        const xScale = 1 / xLength;
        const xDisplacement = -((this.#right + this.#left) / xLength);

        // y-axis
        const yLength = this.#top - this.#bottom;
        const yScale = 1 / yLength;
        const yDisplacement = -((this.#top + this.#bottom) / yLength);

        // z-axis
        const zLength = this.#far - this.#near;
        const zScale = 1 / zLength;
        const zDisplacement = - ((this.#far + this.#near) / zLength);

        const translation = Matrix4.createTranslation(
            xDisplacement, yDisplacement, zDisplacement
        );
        const scaling = Matrix4.createScale(
            xScale, this.getAspectRatio() * yScale, zScale
        );

        return translation.multiplyOther(scaling);
    }
}

export {
    OrthographicCamera
};