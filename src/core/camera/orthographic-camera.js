
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
        let adjustedLeft = this.#left;
        let adjustedRight = this.#right;
        let adjustedTop = this.#top;
        let adjustedBottom = this.#bottom;

        if (this.getAspectRatio() > 1.0) {
            // Widescreen format
            const halfWidth = (this.#right - this.#left) * 0.5;
            const center = (this.#left + this.#right) * 0.5;
            const newHalfWidth = halfWidth * this.getAspectRatio();
            
            adjustedLeft = center - newHalfWidth;
            adjustedRight = center + newHalfWidth;
        } else {
            // Portrait format
            const halfHeight = (this.#top - this.#bottom) * 0.5;
            const center = (this.#top + this.#bottom) * 0.5;
            const newHalfHeight = halfHeight / this.getAspectRatio();

            adjustedTop = center + newHalfHeight;
            adjustedBottom = center - newHalfHeight;
        }

        return Matrix4.createOrthographicProjection(
            adjustedLeft, adjustedRight,
            adjustedTop, adjustedBottom,
            this.#near, this.#far
        );
    }
}

export {
    OrthographicCamera
};