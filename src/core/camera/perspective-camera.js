
import { Camera } from './camera.js';
import { Matrix4 } from '../matrix4.js';

/**
 * Represents a perspective camera.
 */
class PerspectiveCamera extends Camera
{
    #fov = null;
    #near = null;
    #far = null;

    constructor(fov = 75, near = 0.1, far = 1000)
    {
        super();

        if (typeof near !== 'number' || near <= 0) {
            throw new Error(
                'Near plane must be a positive number.'
            );
        }

        this.setFov(fov);
        this.#near = near;
        this.setFar(far);
    }

    /**
     * Sets the field of view in degrees.
     */
    setFov(fov)
    {
        if (typeof fov !== 'number' || fov <= 0 || fov >= 180) {
            throw new Error(
                'Field of view must be a number between 0 and 180 degrees.'
            );
        }

        this.#fov = fov;
    }

    /**
     * Returns the field of view in degrees.
     */
    getFov() {
        return this.#fov;
    }

    /**
     * Sets the near clipping plane distance.
     */
    setNear(near)
    {
        if (typeof near !== 'number' || near <= 0) {
            throw new Error('Near plane must be a positive number.');
        }

        if (near >= this.#far) {
            throw new Error('Near plane must be smaller than far plane.');
        }

        this.#near = near;
    }

    /**
     * Returns the near clipping plane distance.
     */
    getNear() {
        return this.#near;
    }

    /**
     * Sets the far clipping plane distance.
     */
    setFar(far)
    {
        if (typeof far !== 'number' || far <= this.#near) {
            throw new Error('Far plane must be larger than near plane.');
        }

        this.#far = far;
    }

    /**
     * Returns the far clipping plane distance.
     */
    getFar() {
        return this.#far;
    }

    /**
     * Returns the projection matrix for the perspective camera.
     */
    getProjectionMatrix()
    {
        return Matrix4.createPerspectiveProjection(
            this.#fov,
            this.getAspectRatio(),
            this.#near,
            this.#far
        );
    }
}

export {
    PerspectiveCamera
};