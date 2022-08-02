export class Vec extends Array<number> {

    // constructor(x: Array<number>) {
    //     this.x = x;
    //     this.length = x.length;
    // }

    // get(i: number): number {
    //     return this[i];
    // }

    constructor(...items: Array<number>) {
        super(...items);
    }

    sum(): number {
        let out = 0;
        for (let i = 0; i < this.length; i++) {
            out += this[i];
        }
        return out;
    }

    prod(): number {
        let out = 1;
        for (let i = 0; i < this.length; i++) {
            out *= this[i];
        }
        return out;
    }

    plus(y: Vec): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] + y[i]);
        }
        return out;
    }

    scalarPlus(y: number): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] + y);
        }
        return out;
    }

    sub(y: Vec): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] - y[i]);
        }
        return out;
    }

    times(y: Vec): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] * y[i]);
        }
        return out;
    }

    scalarTimes(y: number): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] * y);
        }
        return out;
    }

    div(y: Vec): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] / y[i]);
        }
        return out;
    }

    scalarDiv(y: number): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(this[i] / y);
        }
        return out;
    }

    pow(y: Vec): Vec {
        let out = new Vec();
        for (let i = 0; i < this.length; i++) {
            out.push(Math.pow(this[i], y[i]));
        }
        return out;
    }
}

export function vec(v: Array<number>): Vec {
    return new Vec(...v);
}
