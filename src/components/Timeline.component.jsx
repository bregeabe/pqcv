import React, { useMemo } from 'react';
import { theme } from '../theme';
import { FOOTER_LINKS, ROW_DELIMETER, KET_PLUS, KET_MINUS, KET_PLUS_TWO, KET_MINUS_TWO } from '../constants';
import { Text } from './form/Text.componen';

const classes = {
  container: {
    position: "absolute",
    bottom: 40,
    left: "21.5vw",
    width: "55vw",
    height: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.color.lightGrey}`,
    borderRight: `1px solid ${theme.color.lightGrey}`,
    backgroundColor: theme.color.background,
    gap: 30,
  },
  link: {
    fontSize: 13,
    color: theme.color.darkGrey,
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: 0.8,
  },
  infoWrapper: {
    marginLeft: 10,
    display: "flex",
    flexDirection: "row",
  },
  textContainer: {
    padding: 10,
  },
  latexContainer: {
    fontSize: 20,
  },
  hadamardOutputContainer: {
    paddingTop: 5
  },
};


export default function Timeline({ alpha, beta, interactiveStateValue = "" }) {
  const isBase = (alpha.real.toFixed(2) == 1 || alpha.real.toFixed(2) == 0);
  const isHadamard = useMemo(() => alpha.real !== 1 && alpha.real !== 0);
  const ketPlusOrMinus = useMemo(() => Math.sign(beta.real) == 1 ? KET_PLUS : KET_MINUS, [alpha, beta]);
  const ketPlusOrMinusTwo = useMemo(() => Math.sign(beta.real) == 1 ? KET_PLUS_TWO : KET_MINUS_TWO, [alpha, beta]);
  const valAlphaThree = interactiveStateValue?.split(ROW_DELIMETER)[0]
  const valBetaThree = interactiveStateValue?.split(ROW_DELIMETER)[1]

  return (
    <div>
      <div style={classes.infoWrapper}>
        {isBase ? (
          <Text displayMode latex={`
        \\left[ \\begin{array}{c}
        ${Math.round(alpha.real)} \\\\
        ${Math.round(beta.real)}
        \\end{array} \\right]
        `}
          />
        ) : (
          <Text displayMode latex={ketPlusOrMinus}
          />
        )}

        <Text style={classes.textContainer}>=</Text>
        {isBase ? (
          <Text style={classes.latexContainer} displayMode latex={`
            \\ket{${Math.round(beta.real)}}
            `}
          />
        ) : (
          <div style={classes.hadamardOutputContainer}>
            {isHadamard && (<Text style={{ ...classes.latexContainer, paddingTop: 15 }} latex={ketPlusOrMinusTwo}></Text>)}
          </div>
        )
        }
        <Text style={classes.textContainer}>=</Text>
        <div>
          <Text>{valAlphaThree}</Text>
          <Text>{valBetaThree}</Text>
        </div>
      </div>
      <div style={classes.container}>
      </div>
    </div>

  );
}
