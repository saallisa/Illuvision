
import { Camera } from './camera.js';
import { Matrix4 } from '../matrix4.js';

/**
 * Represents an orthographic camera.
 */
class OrthographicCamera extends Camera
{
    /**
     * Returns the projection matrix for the camera.
     * This is a placeholder method and should be implemented in subclasses.
     */
    getProjectionMatrix() {
        return Matrix4.createScale(1, this.getAspectRatio(), 1);
    }
}

export {
    OrthographicCamera
};