import { Vec } from './vec';
import { ProdFunc, Problem } from './problem';
import { solve } from './solve';

const slider = document.getElementById("a");
const slider_value = document.getElementById("a-value");
if (slider !== null && slider_value !== null) {
    slider_value.innerHTML = (<HTMLInputElement>slider).value;
    slider.oninput = () => {
        slider_value.innerHTML = (<HTMLInputElement>slider).value;
    };
}
    
const button = document.getElementById("button");
if (button !== null) {
    button.onclick = () => {
        const a = parseFloat((<HTMLInputElement>slider).value);
        const prodFunc = new ProdFunc({a: new Vec(a, a)});
        const problem = new Problem({prodFunc: prodFunc});
        const res = solve(problem);
        
        const solution = document.getElementById("solution");
        if (solution !== null) {
            solution.innerHTML = `${res.xs.pretty()}, ${res.xp.pretty()}`;
        }
    };
}