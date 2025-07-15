
import { Color } from '../color.js';
import { Face } from '../face.js';
import { GeometryBuffer } from '../buffer/geometry-buffer.js';
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
    #vertexColors = [];

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
     * Gets a copy of all vertex colors.
     */
    getVertexColors() {
        return Array.from(this.#vertexColors);
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
     * Adds a vertex color to the geometry.
     */
    addVertexColor(vertexColor)
    {
        if (!(vertexColor instanceof Color)) {
            throw new TypeError('Vertex color must be a Color instance.');
        }

        this.#vertexColors.push(vertexColor.clone());
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
        for (const normal of this.#vertexNormals) {
            normal.normalize();
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
     * Flattens geometry data into an interleaved vertex buffer based on
     * the specified layout and returns a GeometryBuffer instance.
     */
    createBuffer(layout)
    {
        Geometry.validateBufferLayout(layout);

        const componentInfo = this.#buildComponentInfo(layout);
        const stride = this.#calculateStride(componentInfo);
        const offsets = this.#calculateByteOffsets(componentInfo);

        this.#prepareGeometryData(layout);
        const buffer = this.#writeGeometryData(componentInfo, stride);

        return new GeometryBuffer(
            buffer,
            Array.from(layout),
            stride,
            offsets,
            this.#vertices.length
        );
    }

    /**
     * Validates a component.
     */
    static validateComponent(component)
    {
        const validComponents = [
            Geometry.VERTEX,
            Geometry.NORMAL,
            Geometry.UV,
            Geometry.COLOR
        ];

        if (!validComponents.includes(component)) {
            throw new Error(
                `Invalid geometry component: ${component}.`
            );
        }
    }

    /**
     * Gets the size (number of floats) for a specific component type.
     */
    static getComponentSize(component)
    {
        switch (component) {
            case Geometry.VERTEX:
            case Geometry.NORMAL:
                return 3;
            case Geometry.UV:
                return 2;
            case Geometry.COLOR:
                return 4;
            default:
                throw new Error(`Unknown layout component: ${component}`);
        }
    }
    
    /**
     * Validates the vertex buffer layout.
     */
    static validateBufferLayout(layout)
    {
        if (!Array.isArray(layout) || layout.length === 0) {
            throw new TypeError(
                'Layout must be a non-empty array of layout components.'
            );
        }

        const uniqueComponents = new Set(layout);

        if (uniqueComponents.size !== layout.length) {
            throw new Error('Layout contains duplicate components');
        }
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
        // Throw an error until feature is implemented
        throw new Error('Ear clipping triangulation not yet implemented');
        
        // Add code here
        // Try not to lose your mind while doing it, please
    }

    /**
     * Builds component information including size and offset for each
     * layout component.
     */
    #buildComponentInfo(layout)
    {
        const info = new Map();
        let stride = 0;

        for (const component of layout) {
            const size = Geometry.getComponentSize(component);
            info.set(component, {
                size: size,
                offset: stride
            });
            stride += size;
        }
        
        return info;
    }

    /**
     * Calculates the total stride from component information.
     */
    #calculateStride(info)
    {
        let stride = 0;

        for (const componentInfo of info.values()) {
            stride += componentInfo.size;
        }

        return stride;
    }

    /**
     * Calculates byte offsets for each component.
     */
    #calculateByteOffsets(componentInfo)
    {
        const offsets = {};
        let byteOffset = 0;
        
        for (const [component, info] of componentInfo) {
            offsets[component] = byteOffset;
            byteOffset += info.size * 4;
        }
        
        return offsets;
    }

    /**
     * Prepares geometry data by ensuring required data is available and valid.
     */
    #prepareGeometryData(layout)
    {
        for (const component of layout) {
            switch (component) {
                case Geometry.NORMAL: 
                    this.#ensureNormalsExist();
                    break;
                case Geometry.UV:
                    this.#validateUvCount();
                    break;
                case Geometry.COLOR:
                    this.#validateColorCount();
            }
        }
    }

    /**
     * Ensures vertex normals exist by calculating them if necessary.
     */
    #ensureNormalsExist()
    {
        if (this.#vertexNormals.length === 0) {
            this.calculateVertexNormals();
        }
    }

    /**
     * Validates that UV coordinates match vertex count.
     */
    #validateUvCount()
    {
        if (this.#uvs.length !== this.#vertices.length) {
            throw new Error('UV coordinate count must match vertex count.');
        }
    }

    /**
     * Validates that vertex colors match vertex count.
     */
    #validateColorCount()
    {
        if (this.#vertexColors.length !== this.#vertices.length) {
            throw new Error('Vertex color count must match vertex count.');
        }
    }

    /**
     * Write interleaved buffer data.
     */
    #writeGeometryData(componentInfo, stride)
    {
        const bufferSize = this.#vertices.length * stride;
        const buffer = new Float32Array(bufferSize);
        
        for (let index = 0; index < this.#vertices.length; index++) {
            this.#writeGeometryBuffer(buffer, index, stride, componentInfo);
        }
        
        return buffer;
    }

    /**
     * Fills buffer data for a single vertex.
    */
    #writeGeometryBuffer(buffer, index, stride, componentInfo)
    {
        const baseOffset = index * stride;
        
        for (const [component, info] of componentInfo) {
            const offset = baseOffset + info.offset;
            
            switch (component) {
                case Geometry.VERTEX:
                    this.#writeVertexData(buffer, offset, index);
                    break;
                case Geometry.NORMAL:
                    this.#writeNormalData(buffer, offset, index);
                    break;
                case Geometry.UV:
                    this.#writeUvData(buffer, offset, index);
                    break;
                case Geometry.COLOR:
                    this.#writeColorData(buffer, offset, index);
                    break;
            }
        }
    }

    /**
     * Writes vertex position data to buffer.
     */
    #writeVertexData(buffer, offset, vertexIndex)
    {
        const vertex = this.#vertices[vertexIndex];

        buffer[offset] = vertex.x;
        buffer[offset + 1] = vertex.y;
        buffer[offset + 2] = vertex.z;
    }

    /**
     * Writes normal data to buffer.
     */
    #writeNormalData(buffer, offset, vertexIndex)
    {
        const normal = this.#vertexNormals[vertexIndex];

        buffer[offset] = normal.x;
        buffer[offset + 1] = normal.y;
        buffer[offset + 2] = normal.z;
    }

    /**
     * Writes UV coordinate data to buffer.
     */
    #writeUvData(buffer, offset, vertexIndex)
    {
        const uv = this.#uvs[vertexIndex];

        buffer[offset] = uv.u;
        buffer[offset + 1] = uv.v;
    }

    /**
     * Writes color data to buffer.
     */
    #writeColorData(buffer, offset, vertexIndex)
    {
        const color = this.#vertexColors[vertexIndex];

        buffer[offset] = color.red;
        buffer[offset + 1] = color.green;
        buffer[offset + 2] = color.blue;
        buffer[offset + 3] = color.alpha;
    }

    // Some fake constants containing valid triangulation methods.

    static get FAN() {
        return 'fan';
    }

    static get EARCLIPPING() {
        return 'earclipping';
    }

    // Some more fake constants for interleaved geometry flattening.

    static get VERTEX() {
        return 'vertex';
    }

    static get NORMAL() {
        return 'normal';
    }

    static get UV() {
        return 'uv';
    }

    static get COLOR() {
        return 'color';
    }
}

export {
    Geometry
};