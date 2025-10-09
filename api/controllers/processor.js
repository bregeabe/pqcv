import { pow, multiply, kron, identity, zeros, log2, norm } from 'mathjs'
import { serializeGates } from '../helpers.js';

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
    let leftI = identity(leftIPow)
    let rightI = identity(rightIPow)
    let op = kron(kron(leftI, t), rightI);

    return op;
}

function generateInstructionsForRegister(register, gates) {
    let state = prepareState(1);
    const results = [];

    for (const gate of gates) {
        state = apply(gate, state, register);
        results.push(state.clone ? state.clone() : JSON.parse(JSON.stringify(state)));
    }

    return results;
}

// takes in array (data) and outputs the data in [re: x, im: y] form.
// if no imag: formattedInstructions.push({ 'alpha': { 'real': state[0], 'imag': 0 }, 'beta': { 'real': state[1], 'imag': 0 } })
function normalizeInstruction(instruction) {
    let normalizedInstruction = {};
    instruction.forEach((amplitude, i) => {
        switch (typeof amplitude) {
            case 'number':
                !i ? normalizedInstruction["alpha"] = { "real": amplitude, "imag": 0 } : normalizedInstruction["beta"] = { "real": amplitude, "imag": 0 }
                return;
            case 'object':
                !i ? normalizedInstruction["alpha"] = { "real": amplitude.re, "imag": amplitude.im } : normalizedInstruction["beta"] = { "real": amplitude.re, "imag": amplitude.im }
                return;
        }
    })
    console.log("noramilzed instruction", normalizedInstruction)
    return normalizedInstruction
}

function postProcessGateOutput(instructions) {
    try {
        return instructions.map((instruction) => normalizeInstruction(instruction.vector.data))
    } catch (error) {
        console.error(error)
    }
}

export default function getInstructions(channels) {
    const serializedRegisters = serializeGates(channels);
    const instructions = generateInstructionsForRegister(0, serializedRegisters['0'])
    const serializedInstructions = postProcessGateOutput(instructions);
    return { "message": serializedInstructions }
}