import { sqrt, complex, pow, e, pi, multiply } from 'mathjs'

const i = complex(0, 1);
const isq2 = 1 / sqrt(2);


function matrixDot (A, B) {
    var result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm*B[k][j]) ,0)
        })
    })
}


var H = multiply(isq2, [[1, 1], [1, -1]]),
    X = [[0, 1], [1, 0]],
    Y = [ [0, -i], [i, 0] ],
    Z = [[1, 0], [0, -1]],
    S = [[1, 0], [0, i]],
    T = [[1, 0], [0, pow(e, i * pi / 4)]],
    I = [[1, 0], [0, 1]],
    ZERO = [[1], [0]],
    ONE = [[0], [1]];


    console.log(matrixDot(H, ZERO))
