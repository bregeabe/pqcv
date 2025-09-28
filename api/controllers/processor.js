import { sqrt, complex, pow, e, pi, multiply, kron, identity, zeros, log2 } from 'mathjs'

const i = complex(0, 1);
const onesq2 = 1 / sqrt(2);
const I = identity(2);


var H = multiply(onesq2, [[1, 1], [1, -1]]),
    X = [[0, 1], [1, 0]],
    Y = [[0, -i], [i, 0]],
    Z = [[1, 0], [0, -1]],
    S = [[1, 0], [0, i]],
    T = [[1, 0], [0, pow(e, i * pi / 4)]],
    CNOT = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]],
    SWAP = [[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]],
    ZERO = [[1], [0]],
    ONE = [[0], [1]];


function prepareState(n) {
    let state = zeros(pow(2, n))
    state._data[0] = 1;
    return { vector: state._data, size: state._size[0], n }
}

function apply(gate, state, i) {
    const op = operator(gate, i, state.n);
    state.vector = multiply(op, state.vector)
    return state
}

// k = log2(t.length), i qubit index, t is gate
function operator(t, i, n) {
    const target = log2(t.length);
    const rightInt = n - i - target;
    const leftIPow = pow(2, i);
    const rightIPow = pow(2, rightInt)
    console.log("n ", n, "i ", i, "target ", target, "rightint", rightInt)
    let leftI = identity(leftIPow)
    let rightI = identity(rightIPow)
    let op = kron(kron(leftI, t), rightI);

    console.log("left:", leftI._data, "right:", rightI._data)
    console.log("op", op)
    return op;
}


let state = prepareState(2)
console.log("state", state)
state = apply(H, state, 0)
console.log("state after hadamard", state.vector._data)
state = apply(CNOT, state, 0)
console.log("state after CNOT", state.vector._data)
// state.vector = multiply(H, state.vector);
// console.log(state)
// console.log(CNOT)
// superpos = kron(superpos, CNOT)
// console.log(superpos)