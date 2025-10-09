import { apply, prepareState } from '../controllers/processor.js'
import { TWO_QUBIT_BELL_PAIR, H, CNOT, S, X } from '../../src/constants.js'


function createBellPair() {
    let state = prepareState(2)
    state = apply(H, state, 0)
    state = apply(CNOT, state, 0)
    const res = JSON.stringify(TWO_QUBIT_BELL_PAIR) === JSON.stringify(state.vector._data);
    return res
}

function testS() {
    let state = prepareState(1)
    state = apply(X, state, 0)
    // console.log(`state after X: ${JSON.stringify(state)}`)
    state = apply(H, state, 0)
    // console.log(`state after H: ${JSON.stringify(state)}`)
    state = apply(S, state, 0)
    // console.log(`state after S: ${JSON.stringify(state)}`)
    return state
}

function run() {
    // console.log("Bell Pair: ", createBellPair());
    testS();
}

run();