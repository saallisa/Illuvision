
import { Face } from '../face.js';
import { Uv } from '../uv.js';
import { Vector3 } from '../vector3.js';

/**
 * A minimal yet extensible Geometry class that stores vertices, faces and
 * uv-coordinates. Supports automatic normal calculation
 */
class Geometry
{
    #vertices = [];
    #faces = [];
    #uvs = [];
    #vertexNormals = [];
    #faceNormals = [];

    /**
     * Gets a copy of all vertices.
     */
    getVertices() {
        return Array.from(this.#vertices);
    }

    /**
     * Gets a copy of all faces.
     */
    getFaces() {
        return Array.from(this.#faces);
    }

    /**
     * Gets a copy of all uv-coordinates.
     */
    getUvs() {
        return Array.from(this.#uvs);
    }

    /**
     * Gets a copy of all vertex normals.
     */
    getVertexNormals() {
        return Array.from(this.#vertexNormals);
    }

    /**
     * Gets a copy of all face normals.
     */
    getFaceNormals() {
        return Array.from(this.#faceNormals);
    }

    /**
     * Gets the number of vertices in the geometry.
     */
    getVertexCount() {
        return this.#vertices.length;
    }

    /**
     * Gets the number of faces in the geometry.
     */
    getFaceCount() {
        return this.#faces.length;
    }

    /**
     * Gets the number of UV coordinates in the geometry.
     */
    getUvCount() {
        return this.#uvs.length;
    }

    /**
     * Adds a vertex to the geometry and return its index.
     */
    addVertex(vertex)
    {
        if (!(vertex instanceof Vector3)) {
            throw new TypeError('Expected a Vector3 instance.');
        }

        this.#vertices.push(vertex.clone());

        // Return the index of the newly added vertex
        return this.#vertices.length - 1;
    }

    /**
     * Adds a vertex normal to the geometry.
     */
    addVertexNormal(vertexNormal)
    {
        if (!(vertexNormal instanceof Vector3)) {
            throw new TypeError('Vertex normal must be a Vector3 instance.');
        }

        this.#vertexNormals.push(vertexNormal.clone());
    }

    /**
     * Adds a face normal to the geometry.
     */
    addFaceNormal(faceNormal)
    {
        if (!(faceNormal instanceof Vector3)) {
            throw new TypeError('Face normal must be a Vector3 instance.');
        }

        this.#faceNormals.push(faceNormal.clone());
    }

    /**
     * Adds a face to the geometry.
     */
    addFace(face)
    {
        if (!(face instanceof Face)) {
            throw new TypeError('Expected a Face instance.');
        }

        if (face.getIndices().length < 3) {
            throw new Error('Face must have at least 3 vertices.');
        }

        this.#validateFaceIndices(face);

        this.#faces.push(face.clone());
    }

    /**
     * Adds a uv coordinate to the geometry.
     */
    addUvCoordinate(uv)
    {
        if (!(uv instanceof Uv)) {
            throw new TypeError('Expected a Uv instance.');
        }

        this.#uvs.push(uv.clone());
    }

    /**
     * Calculates and stores vertex normals based on face normals.
     * Each vertex normal is computed by averaging all face normals 
     * of faces that contain that vertex.
     * This will overwrite any existing vertex normals.
     */
    calculateVertexNormals()
    {
        // Ensure that the face normals are calculated
        if (this.#faceNormals.length === 0) {
            this.calculateFaceNormals();
        }

        this.#vertexNormals = [];

        // Initialize vertex normals array with zero vectors
        for (let i = 0; i < this.#vertices.length; i++) {
            this.#vertexNormals.push(new Vector3(0, 0, 0));
        }

        // Loop through all faces.
        for (let faceIndex = 0; faceIndex < this.#faces.length; faceIndex++)
        {
            const face = this.#faces[faceIndex];

            // Get the faces indices and the face's normal
            const vertices = face.getIndices();
            const normal = this.#faceNormals[faceIndex];
            
            // Add the face's normal to each vertex referenced by the face
            for (const vertex of vertices) {
                this.#vertexNormals[vertex].add(normal);
            }
        }

        // Normalize all vertex normals
        for (let i = 0; i < this.#vertexNormals.length; i++) {
            this.#vertexNormals[i].normalize();
        }
    }

    /**
     * Calculates and stores face normals for all faces in the geometry.
     * This will overwrite any existing face normals.
     */
    calculateFaceNormals()
    {
        this.#faceNormals = [];

        for (const face of this.#faces) {
            const normal = this.#calculateFaceNormal(face);
            this.#faceNormals.push(normal);
        }
    }

    /**
     * Splits all faces with more than three vertices into triangular faces.
     * Always call triangulate before calculateVertexNormals!
     */
    triangulate(method = Geometry.FAN)
    {
        this.#validateTriangulationMethod(method);

        const triangulatedFaces = [];

        for (const face of this.#faces)
        {
            if (face.getVertexCount() === 3) {
                // Do nothing with triangular face
                triangulatedFaces.push(face);
            } else {
                // Triangulate complex faces
                const triangles = this.#triangulateFace(face, method);
                triangulatedFaces.push(...triangles);
            }
        }

        this.#faces = triangulatedFaces;
    }

    /**
     * Converts vertices to a flat Float32Array for GPU vertex buffer.
     * Returns an array in the format: [x1, y1, z1, x2, y2, z2, ...]
     */
    flattenVertices()
    {
        const flatVertices = new Float32Array(this.#vertices.length * 3);

        for (let i = 0; i < this.#vertices.length; i++)
        {
            const vertex = this.#vertices[i];
            const offset = i * 3;

            flatVertices[offset] = vertex.x;
            flatVertices[offset + 1] = vertex.y;
            flatVertices[offset + 2] = vertex.z;
        }

        return flatVertices;
    }

    /**
     * Converts faces to a flat index array for GPU element buffer.
     * Returns an Uint16Array or Uint32Array depending on vertex count.
     */
    flattenIndices()
    {
        const indices = [];

        for (const face of this.#faces) {
            const faceIndices = face.getIndices();
            indices.push(...faceIndices);
        }

        // Use Uint16Array for smaller geometries, Uint32Array for larger ones
        if (this.#vertices.length <= 65535) {
            return new Uint16Array(indices);
        }

        return new Uint32Array(indices);
    }

    /**
     * Converts UV coordinates to a flat Float32Array for GPU texture buffer.
     * Returns an array in the format: [u1, v1, u2, v2, u3, v3, ...]
     */
    flattenUvs()
    {
        const flatUvs = new Float32Array(this.#uvs.length * 2);

        for (let i = 0; i < this.#uvs.length; i++) {
            const uv = this.#uvs[i];
            const offset = i * 2;
            
            flatUvs[offset] = uv.u;
            flatUvs[offset + 1] = uv.v;
        }

        return flatUvs;
    }

    /**
     * Converts vertex normals to a flat Float32Array for GPU.
     * Returns the array in the format: [nx1, ny1, nz1, nx2, ny2, nz2, ...]
     * If no vertex normals exist, calculates them first.
     */
    flattenVertexNormals()
    {
        if (this.#vertexNormals.length === 0) {
            this.calculateVertexNormals();
        }

        const flatNormals = new Float32Array(this.#vertexNormals.length * 3);

        for (let i = 0; i < this.#vertexNormals.length; i++) {
            const normal = this.#vertexNormals[i];
            const offset = i * 3;
            
            flatNormals[offset] = normal.x;
            flatNormals[offset + 1] = normal.y;
            flatNormals[offset + 2] = normal.z;
        }

        return flatNormals;
    }

    /**
     * Creates combined vertex data of positions and normals.
     * Format: [x1, y1, z1, nx1, ny1, nz1, x2, y2, z2, nx2, ny2, nz2, ...]
     */
    flattenCombinedVertexData()
    {
        if (this.#vertexNormals.length === 0) {
            this.calculateVertexNormals();
        }

        const combinedData = new Float32Array(this.#vertices.length * 6);

        for (let i = 0; i < this.#vertices.length; i++) {
            const vertex = this.#vertices[i];
            const normal = this.#vertexNormals[i];
            const offset = i * 6;

            combinedData[offset] = vertex.x;
            combinedData[offset + 1] = vertex.y;
            combinedData[offset + 2] = vertex.z;
            
            combinedData[offset + 3] = normal.x;
            combinedData[offset + 4] = normal.y;
            combinedData[offset + 5] = normal.z;
        }

        return combinedData;
    }

    /**
     * Creates combined vertex data of positions and UVs (without normals).
     * Format: [x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, ...]
     * Note: Requires UV coordinates to be present and match vertex count.
     */
    flattenCombinedVertexDataWithUvsOnly()
    {
        if (this.#uvs.length !== this.#vertices.length) {
            throw new Error(
                `UV coordinate count must match vertex count.`
            );
        }

        const combinedData = new Float32Array(this.#vertices.length * 5);

        for (let i = 0; i < this.#vertices.length; i++)
        {
            const vertex = this.#vertices[i];
            const uv = this.#uvs[i];
            const offset = i * 5;

            combinedData[offset] = vertex.x;
            combinedData[offset + 1] = vertex.y;
            combinedData[offset + 2] = vertex.z;

            combinedData[offset + 3] = uv.u;
            combinedData[offset + 4] = uv.v;
        }

        return combinedData;
    }

    /**
     * Creates combined vertex data of positions, normals and uvs.
     * Format: [x1, y1, z1, nx1, ny1, nz1, u1, v1, x2, y2, z2, nx2, ny2,
     * nz2, u2, v2, ...]
     */
    flattenCombinedVertexDataWithUvs()
    {
        if (this.#vertexNormals.length === 0) {
            this.calculateVertexNormals();
        }

        if (this.#uvs.length !== this.#vertices.length) {
            throw new Error(
                `UV coordinate count must match vertex count.`
            );
        }

        const combinedData = new Float32Array(this.#vertices.length * 8);

        for (let i = 0; i < this.#vertices.length; i++)
        {
            const vertex = this.#vertices[i];
            const normal = this.#vertexNormals[i];
            const uv = this.#uvs[i];

            const offset = i * 8;

            combinedData[offset] = vertex.x;
            combinedData[offset + 1] = vertex.y;
            combinedData[offset + 2] = vertex.z;
            
            combinedData[offset + 3] = normal.x;
            combinedData[offset + 4] = normal.y;
            combinedData[offset + 5] = normal.z;

            combinedData[offset + 6] = uv.u;
            combinedData[offset + 7] = uv.v;
        }

        return combinedData;
    }

    /**
     * Calculates the face normal.
     */
    #calculateFaceNormal(face)
    {
        const indices = face.getIndices();

        const vertex1 = this.#vertices[indices[0]];
        const vertex2 = this.#vertices[indices[1]];
        const vertex3 = this.#vertices[indices[2]];

        const edge1 = vertex2.subtractOther(vertex1);
        const edge2 = vertex3.subtractOther(vertex1);

        return Vector3.normalize(edge1.crossOther(edge2));
    }

    /**
     * Validates that all face indices reference existing vertices.
     */
    #validateFaceIndices(face)
    {
        const indices = face.getIndices();
        const maxValidIndex = this.#vertices.length - 1;
        
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            
            if (index > maxValidIndex) {
                throw new RangeError(
                    `Face index ${index} at position ${i} references ` +
                    'non-existent vertex.'
                );
            }
        }
    }

    /**
     * Validates a triangulation method.
     */
    #validateTriangulationMethod(method)
    {
        const validMethods = [
            Geometry.FAN,
            Geometry.EARCLIPPING
        ];

        if (!validMethods.includes(method)) {
            throw new Error(
                `Invalid triangulation method: ${method}.`
            );
        }
    }

    /**
     * Triangulates a single face using the specified method.
     */
    #triangulateFace(face, method)
    {
        switch (method)
        {
            case Geometry.FAN:
                return this.#triangulateFan(face);

            case Geometry.EARCLIPPING:
                return this.#triangulateEarclipping(face);

            default:
                throw new Error(`Unknown triangulation method: ${method}.`);
        }
    }

    /**
     * Triangulate a face using the fan method.
     */
    #triangulateFan(face)
    {
        const indices = face.getIndices();
        const triangles = [];
        
        // Connect all other vertices with the first vertex
        for (let i = 1; i < indices.length - 1; i++)
        {
            const triangleIndices = [
                indices[0],
                indices[i],
                indices[i + 1]
            ];
            
            triangles.push(new Face(triangleIndices));
        }
        
        return triangles;
    }

    /**
     * Triangulate a face using the earclipping method.
     */
    #triangulateEarclipping(face)
    {
        // Add code here
        // Try not to lose your mind while doing it, please
    }

    // Some fake constants containing valid triangulation methods.

    static get FAN() {
        return 'fan';
    }

    static get EARCLIPPING() {
        return 'earclipping';
    }
}

export {
    Geometry
};