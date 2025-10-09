import { GATE_MAP } from "../src/constants.js";

function getGateById(gateId) {
  return GATE_MAP[gateId];
}

export function serializeGates(gatesByRegister) {
  const newObj = {};

  for (const [reg, gates] of Object.entries(gatesByRegister)) {
    const temp = [];
    for (const gate of gates) {
      temp.push(getGateById(gate));
    }
    newObj[reg] = temp;
  }

  return newObj;
}