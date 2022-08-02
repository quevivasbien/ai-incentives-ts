import { vec, Vec } from './vec';
import { ProdFunc, Problem } from './problem';
import { solve } from './solve';

interface ValueMap {
    [key: string]: Vec;
}

const values: ValueMap = {
    a: new Vec(0, 0),
    alpha: new Vec(0, 0),
    b: new Vec(0, 0),
    beta: new Vec(0, 0),
    theta: new Vec(0, 0),
    d: new Vec(0, 0),
    r: new Vec(0, 0)
};

function setupControls(varName: string) {
    const sliders = [
        <HTMLInputElement>(document.getElementById(`${varName}1`)),
        <HTMLInputElement>(document.getElementById(`${varName}2`))
    ];
    const syncBox = <HTMLInputElement>(document.getElementById(`${varName}-sync`));
    const display = <HTMLSpanElement>(document.getElementById(`${varName}-display`));
    function update(changed: number) {
        if (syncBox.checked) {
            sliders[1-changed].value = sliders[changed].value;
        }
        values[varName][0] = parseFloat(sliders[0].value);
        values[varName][1] = parseFloat(sliders[1].value);
        display.innerHTML = values[varName].pretty();
    }
    update(0);
    sliders[0].addEventListener("input", () => update(0));
    sliders[1].addEventListener("input", () => update(1));
}

function setupAllControls() {
    for (let k in values) {
        setupControls(k);
    }
}

function run() {
    const prodFunc = new ProdFunc({
        a: values.a,
        alpha: values.alpha,
        b: values.b,
        beta: values.beta,
        theta: values.theta
    });
    const problem = new Problem({
        prodFunc: prodFunc,
        d: values.d,
        r: values.r
    });
    const res = solve(problem);
    console.log("solver success: ", res.success)

    document.getElementById("solution-xs").innerHTML = res.xs.pretty();
    document.getElementById("solution-xp").innerHTML = res.xp.pretty();
    document.getElementById("solution-s").innerHTML = res.s.pretty();
    document.getElementById("solution-p").innerHTML = res.p.pretty();

    document.getElementById("solution-total-safety").innerHTML = `${(res.total_safety * 100).toFixed(1)}%`;
    document.getElementById("solution-payoffs").innerHTML = res.payoffs.pretty();
}

const button = <HTMLButtonElement>(document.getElementById("button"));
button.addEventListener("click", run);

setupAllControls();