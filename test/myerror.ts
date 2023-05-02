import { Exception } from "../src";

export class MyError extends Exception {

    other: string;
    constructor(m: string, other: string) {
        super(m);
        this.other = other;

        Object.setPrototypeOf(this, MyError.prototype);
    }

    test() {
        return 12;
    }
}

Exception.register(MyError, (src) => {
    let e = new MyError(src.message, src.other);
    return e;
})