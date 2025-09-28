import { pow, multiply, kron, identity, zeros, log2 } from 'mathjs'

export function prepareState(n) {
    let state = zeros(pow(2, n))
    state._data[0] = 1;
    return { vector: state._data, size: state._size[0], n }
}

export function apply(gate, state, i) {
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
    // console.log("n ", n, "i ", i, "target ", target, "rightint", rightInt)
    let leftI = identity(leftIPow)
    let rightI = identity(rightIPow)
    let op = kron(kron(leftI, t), rightI);

    // console.log("left:", leftI._data, "right:", rightI._data)
    // console.log("op", op)
    return op;
}