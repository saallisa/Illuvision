
/**
 * A class representing an angle, which can be created from either degrees or
 * radians.
 */
class Angle
{
    #angleInDegrees = null;

    constructor(unit, angle)
    {
        switch (unit) {
            case Angle.DEGREES: 
                this.degrees = angle;
                break;
            case Angle.RADIANS:
                this.radians = angle;
                break;
            default: throw new Error('Invalid unit of measurement');
        }
    }

    /**
     * Returns the angle in degrees.
     */
    get degrees() {
        return this.#angleInDegrees;
    }

    /**
     * Sets the angle in degrees.
     */
    set degrees(degrees)
    {
        Angle.#validateAngle(degrees);
        this.#angleInDegrees = degrees;
    }

    /**
     * Sets the angle in radians.
     */
    set radians(radians)
    {
        Angle.#validateAngle(radians);
        this.#angleInDegrees = Angle.radiansToDegrees(radians);
    }

    /**
     * Returns the angle in radians.
     */
    get radians() {
        return Angle.degreesToRadians(this.#angleInDegrees);
    }

    /**
     * Normalizes this angle directly.
     */
    normalize() {
        this.#angleInDegrees = Angle.normalizeDegrees(this.#angleInDegrees);
    }

    /**
     * Add another Angle to this angle.
     */
    add(angle)
    {
        Angle.#validateAngle(angle);

        this.#angleInDegrees += angle.degrees;
    }

    /**
     * Add another angle in degrees to this angle.
     */
    addDegrees(angle)
    {
        Angle.#validateAngle(angle);

        this.#angleInDegrees += angle;
    }

    /**
     * Add another angle in radians to this angle.
     */
    addRadians(angle)
    {
        Angle.#validateAngle(angle);

        this.#angleInDegrees += Angle.radiansToDegrees(angle);
    }

    /**
     * Subtract another angle from this angle.
     */
    subtract(angle)
    {
        Angle.#validateAngle(angle);

        this.#angleInDegrees -= angle.degrees;
    }

    /**
     * Subtract another angle in degrees from this angle.
     */
    subtractDegrees(angle)
    {
        Angle.#validateAngle(angle);

        this.#angleInDegrees -= angle;
    }

    /**
     * Subtract another angle in radians from this angle.
     */
    subtractRadians(angle)
    {
        Angle.#validateAngle(angle);

        this.#angleInDegrees -= Angle.radiansToDegrees(angle);
    }

    /**
     * Scale this angle by a factor.
     */
    scale(factor)
    {
        if (typeof factor !== 'number' || !isFinite(factor)) {
            throw new Error('Scaling factor must be a finite number');
        }

        this.#angleInDegrees *= factor;
    }

    /**
     * Creates a new instance of Angle from degrees.
     */
    static fromDegrees(degrees) {
        return new Angle(Angle.DEGREES, degrees);
    }

    /**
     * Creates a new instance of Angle from radians.
     */
    static fromRadians(radians) {
        return new Angle(Angle.RADIANS, radians);
    }

    /**
     * Converts degrees to radians.
     */
    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Converts radians to degrees.
     */
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Normalizes degrees to range 0 to 360.
     */
    static normalizeDegrees(angle) {
        return ((angle % 360) + 360) % 360;
    }

    /**
     * Normalizes radians to range 0 to 2 * Pi.
     */
    static normalizeRadians(angle)
    {
        const turn = 2 * Math.PI;
        return ((angle % turn) + turn) % turn;
    }

    /**
     * Linearly interpolates between two angles, taking the shortest path.
     */
    static lerp(angle1, angle2, t)
    {
        Angle.validateInstance(angle1);
        Angle.validateInstance(angle2);
        Angle.#validateTFactor(t);

        const result = Angle.#lerpDegreesRaw(angle1.degrees, angle2.degrees, t);
        return Angle.fromDegrees(result);
    }

    /**
     * Linearly interpolates between two angles in degrees, taking the shortest path.
     */
    static lerpDegrees(angle1, angle2, t)
    {
        Angle.#validateAngle(angle1);
        Angle.#validateAngle(angle2);
        Angle.#validateTFactor(t);

        return Angle.#lerpDegreesRaw(angle1, angle2, t);
    }

    /**
     * Linearly interpolates between two angles in radians, taking the shortest path.
     */
    static lerpRadians(angle1, angle2, t)
    {
        Angle.#validateAngle(angle1);
        Angle.#validateAngle(angle2);
        Angle.#validateTFactor(t);

        let start = Angle.normalizeRadians(angle1);
        let end = Angle.normalizeRadians(angle2);

        const difference = Math.abs(end - start);

        if (difference > Math.PI) {
            if (end > start) {
                start += 2 * Math.PI;
            } else {
                end += 2 * Math.PI;
            }
        }

        const result = start + (end - start) * t;
        return Angle.normalizeRadians(result);
    }

    /**
     * Validates that a value is a valid Angle.
     */
    static validateInstance(value)
    {
        if (!(value instanceof Angle)) {
            throw new TypeError('Value must be an instance of Angle.');
        }
    }

    /**
     * Validates that a value is a finite number, which is necessary for angles.
     */
    static #validateAngle(angle)
    {
        if (typeof angle !== 'number' || !isFinite(angle)) {
            throw new Error('Angle must be a finite number');
        }
    }

    /**
     * Validates that the interpolation factor t is a number between 0 and 1.
     */
    static #validateTFactor(t)
    {
        if (typeof t !== 'number' || !isFinite(t)) {
            throw new Error('Interpolation factor t must be a finite number');
        }

        if (t < 0 || t > 1) {
            throw new RangeError(
                'Invalid interpolation factor t: must be between 0 and 1'
            );
        }
    }

    /**
     * Linearly interpolates between two angles in degrees, taking the shortest path.
     */
    static #lerpDegreesRaw(angle1, angle2, t)
    {
        // Get normalized angles in degrees
        let start = Angle.normalizeDegrees(angle1);
        let end = Angle.normalizeDegrees(angle2);

        const difference = Math.abs(end - start);

        if (difference > 180) {
            if (end > start) {
                start += 360;
            } else {
                end += 360;
            }
        }

        const result = start + (end - start) * t;
        return Angle.normalizeDegrees(result);
    }

    // Fake constants returning valid angle units of measurement

    static get RADIANS() {
        return 'radians';
    }

    static get DEGREES() {
        return 'degrees';
    }
}

export {
    Angle
};