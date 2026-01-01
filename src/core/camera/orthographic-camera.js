
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
     * Returns the left boundary of the orthographic frustum.
     */
    getLeft() {
        return this.#left;
    }

    /**
     * Sets the left boundary of the orthographic frustum.
     */
    setLeft(left)
    {
        if (typeof left !== 'number') {
            throw new Error('Left value must be a number.');
        }

        if (left >= this.#right) {
            throw new Error(
                'Left value must be smaller than right value.'
            );
        }

        this.#left = left;
    }

    /**
     * Returns the right boundary of the orthographic frustum.
     */
    getRight() {
        return this.#right;
    }

    /**
     * Sets the right boundary of the orthographic frustum.
     */
    setRight(right)
    {
        if (typeof right !== 'number') {
            throw new Error('Right value must be a number.');
        }

        if (this.#left >= right) {
            throw new Error(
                'Right value must be larger than left value.'
            );
        }

        this.#right = right;
    }

    /**
     * Returns the top boundary of the orthographic frustum.
     */
    getTop() {
        return this.#top;
    }

    /**
     * Sets the top boundary of the orthographic frustum.
     */
    setTop(top)
    {
        if (typeof top !== 'number') {
            throw new Error('Top value must be a number.');
        }

        if (top <= this.#bottom) {
            throw new Error(
                'Top value must be larger than bottom value.'
            );
        }

        this.#top = top;
    }

    /**
     * Returns the bottom boundary of the orthographic frustum.
     */
    getBottom() {
        return this.#bottom;
    }

    /**
     * Sets the bottom boundary of the orthographic frustum.
     */
    setBottom(bottom)
    {
        if (typeof bottom !== 'number') {
            throw new Error('Bottom value must be a number.');
        }

        if (this.#top <= bottom) {
            throw new Error(
                'Bottom value must be smaller than top value.'
            );
        }

        this.#bottom = bottom;
    }

    /**
     * Returns the near boundary of the orthographic frustum.
     */
    getNear() {
        return this.#near;
    }

    /**
     * Sets the near clipping plane distance.
     */
    setNear(near)
    {
        if (typeof near !== 'number') {
            throw new Error('Near value must be a number.');
        }

        if (near >= this.#far) {
            throw new Error(
                'Near value must be smaller than far value.'
            );
        }

        this.#near = near;
    }

    /**
     * Returns the far boundary of the orthographic frustum.
     */
    getFar() {
        return this.#far;
    }

    /**
     * Sets the far clipping plane distance.
     */
    setFar(far)
    {
        if (typeof far !== 'number') {
            throw new Error('Far value must be a number.');
        }

        if (this.#near >= far) {
            throw new Error(
                'Far value must be larger than near value.'
            );
        }

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