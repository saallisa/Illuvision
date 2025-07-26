
import { Face } from '../face.js';
import { Geometry } from './geometry.js';
import { Uv } from '../uv.js';
import { Vector3 } from '../vector3.js';

/**
 * A simple plane geometry class that creates a plane with a width and height
 * and a variable number of segments, that are triangulated by default.
 * Also the plane lies in the XY plane by default.
 */
class Plane extends Geometry
{
    #triangulate = true;

    constructor(
        width = 1,
        height = 1,
        widthSegments = 1,
        heightSegments = 1,
        triangulate = true
    ) {
        super();

        Plane.validateDimension(width, 'width');
        Plane.validateDimension(height, 'height');

        Plane.validateSegment(widthSegments, 'widthSegments');
        Plane.validateSegment(heightSegments, 'heightSegments');

        this.#triangulate = triangulate;

        this.#createPlane(width, height, widthSegments, heightSegments);
    }

    /**
     * Creates a segmented plane geometry with vertices, uvs and faces.
     */
    #createPlane(width, height, widthSegments, heightSegments)
    {
        const vertexIndices = this.#createPlaneVertices(
            width, height, widthSegments, heightSegments
        );

        this.#createPlaneUvs(
            width, height, widthSegments, heightSegments
        );

        this.#createPlaneFaces(
            vertexIndices, widthSegments, heightSegments
        );
    }

    /**
     * Create a grid of vertices for the plane.
     */
    #createPlaneVertices(width, height, widthSegments, heightSegments)
    {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // Calculate step sizes
        const widthStep = width / widthSegments;
        const heightStep = height / heightSegments;

        // Create vertices in a grid
        const vertexIndices = [];
        
        for (let row = 0; row <= heightSegments; row++)
        {
            // Create a row
            const y = -halfHeight + (row * heightStep);
            vertexIndices[row] = [];
            
            // Create all columns for the row
            for (let column = 0; column <= widthSegments; column++)
            {
                const x = -halfWidth + (column * widthStep);
                const vertex = new Vector3(x, y, 0);
                const index = this.addVertex(vertex);
                vertexIndices[row][column] = index;
            }
        }

        return vertexIndices;
    }

    /**
     * Create UV coordinates for the plane vertices.
     * UV coordinates are calculated to map the entire texture across the plane.
     */
    #createPlaneUvs(width, height, widthSegments, heightSegments)
    {
        // Calculate UV step sizes
        const uStep = 1.0 / widthSegments;
        const vStep = 1.0 / heightSegments;

        // Create UV coordinates in the same order as vertices
        for (let row = 0; row <= heightSegments; row++)
        {
            for (let column = 0; column <= widthSegments; column++)
            {
                const u = column * uStep;
                const v = row * vStep;
                
                const uv = new Uv(u, v);
                this.addUvCoordinate(uv);
            }
        }
    }

    /**
     * Create the faces of the plane.
     */
    #createPlaneFaces(vertexIndices, widthSegments, heightSegments)
    {
        for (let row = 0; row < heightSegments; row++) {
            for (let column = 0; column < widthSegments; column++)
            {
                // Get the four corners of this segment
                const bottomLeft = vertexIndices[row][column];
                const bottomRight = vertexIndices[row][column + 1];
                const topRight = vertexIndices[row + 1][column + 1];
                const topLeft = vertexIndices[row + 1][column];

                if (this.#triangulate) {
                    // Create two triangular faces per segment
                    const face1 = new Face([bottomLeft, bottomRight, topRight]);
                    this.addFace(face1);

                    const face2 = new Face([bottomLeft, topRight, topLeft]);
                    this.addFace(face2);
                } else {
                    // Create single face per segment
                    const face = new Face([
                        bottomLeft, bottomRight, topRight, topLeft
                    ]);
                    this.addFace(face);
                }
            }
        }
    }
}

export {
    Plane
};