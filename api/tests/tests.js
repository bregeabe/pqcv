import { apply, prepareState } from '../controllers/processor.js'
import { TWO_QUBIT_BELL_PAIR, H, CNOT } from '../../src/constants.js'


function createBellPair() {
    let state = prepareState(2)
    state = apply(H, state, 0)
    state = apply(CNOT, state, 0)
    const res = JSON.stringify(TWO_QUBIT_BELL_PAIR) === JSON.stringify(state.vector._data);
    return res
}

function run() {
    console.log("Bell Pair: ", createBellPair());
}

run();