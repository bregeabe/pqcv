import { sqrt, complex, pow, e, pi, multiply, identity } from 'mathjs'


export const SPRITE_ORDER = [
  { name: 'H.png', gateId: 'a928dfa9-75b0-4152-8ee1-22f1dfe680b5' },
  { name: 'S.png', gateId: '06ebe310-bc30-4d57-ac2a-f272ddb26ab1' },
  { name: 'X.png', gateId: 'd43a8020-2058-4889-89c3-a7711b4b5681' },
  { name: 'Y.png', gateId: 'c4359cfd-4428-4072-b341-aba781068ab8' },
  { name: 'Z.png', gateId: '087ba4ff-1c16-43ed-ac96-cf0229f63345' },
].map((item) => ({
  ...item,
  src: `/assets/${item.name}`,
  type: 'image',
}));

export const ItemTypes = {
  SPRITE: 'sprite',
};

export const FOOTER_LINKS = [
  { title: 'My GitHub', link: 'https://github.com/abrege11' },
  { title: 'PQCV Repo', link: 'https://github.com/abrege11/pqcv' },
  { title: 'Contact', link: 'mailto:bregeabe@gmail.com' },
];

export const CELL_WIDTH = 70;

export const KET_ZERO = { "alpha": { real: 1, imag: 0 }, "beta": { real: 0, imag: 0 } };
export const KET_ONE = [{ real: 0, imag: 0 }, { real: 1, imag: 0 }];
export const KET_PLUS = `\\frac{\\ket{1} + \\ket{0}}{\\sqrt{2}}`;
export const KET_MINUS = `\\frac{\\ket{1} - \\ket{0}}{\\sqrt{2}}`;
export const KET_PLUS_TWO = `\\ket{+}`;
export const KET_MINUS_TWO = `\\ket{-}`;
export const NORM = `\\frac{1}{\\sqrt{2}}`

export const HADAMARD_MATRIX = '\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}'

export const ROW_DELIMETER = '||'

export const i = complex(0, 1);
export const onesq2 = 1 / sqrt(2);
export const I = identity(2);
export const H = multiply(onesq2, [[1, 1], [1, -1]]);
export const X = [[0, 1], [1, 0]];
export const Y = [[0, -i], [i, 0]];
export const Z = [[1, 0], [0, -1]];
export const S = [[1, 0], [0, i]];
export const T = [[1, 0], [0, pow(e, i * pi / 4)]];
export const CNOT = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]];
export const SWAP = [[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]];
export const ZERO = [[1], [0]];
export const ONE = [[0], [1]];

export const GATE_MAP = {"a928dfa9-75b0-4152-8ee1-22f1dfe680b5": H, "06ebe310-bc30-4d57-ac2a-f272ddb26ab1": S, "d43a8020-2058-4889-89c3-a7711b4b5681": X, "c4359cfd-4428-4072-b341-aba781068ab8": Y, "087ba4ff-1c16-43ed-ac96-cf0229f63345": Z}

export const HADAMARD_CONSTANT = 0.7071067811865475;

export const TWO_QUBIT_BELL_PAIR = [0.7071067811865475, 0, 0, 0.7071067811865475];