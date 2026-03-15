
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