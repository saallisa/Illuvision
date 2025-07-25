
import { Camera } from './camera.js';
import { Matrix4 } from '../matrix4.js';

/**
 * Represents an orthographic camera.
 */
class OrthographicCamera extends Camera
{
    #near = null;
    #far = null;

    constructor(near = 0, far = 1000)
    {
        super();

        if (near > far) {
            throw new Error(
                'The far value must be larger than the near value!'
            );
        }

        this.#near = near;
        this.#far = far;
    }

    /**
     * Returns the projection matrix for the orthographic camera.
     */
    getProjectionMatrix()
    {
        const zLength = this.#far - this.#near;
        const zScale = 1 / zLength;
        const zDisplacement = - ((this.#far + this.#near) / zLength);

        const translation = Matrix4.createTranslation(0, 0, zDisplacement);
        const scaling = Matrix4.createScale(1, this.getAspectRatio(), zScale);

        return translation.multiplyOther(scaling);
    }
}

export {
    OrthographicCamera
};