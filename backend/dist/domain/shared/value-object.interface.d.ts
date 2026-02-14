export interface IValueObject {
    equals(other: IValueObject): boolean;
    toString(): string;
}
export declare abstract class ValueObject implements IValueObject {
    abstract equals(other: ValueObject): boolean;
    abstract toString(): string;
}
