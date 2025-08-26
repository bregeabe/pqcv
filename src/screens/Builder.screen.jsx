import React, { useEffect, useState } from 'react';
import SideBar from '../components/SideBar.component';
import BuilderWindow from '../components/BuilderWindow.component';
import Footer from '../components/Footer.component';
import { SPRITE_ORDER, KET_ZERO, KET_ONE } from '../constants';
import Gate from '../components/Gate.component';
import { CELL_WIDTH } from '../constants';
import Timeline from '../components/Timeline.component';
import BlochSphere from '../components/ForkedBlochSphere.component';

const classes = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  bottomContainer: {
    width: "80%",
    display: 'flex',
    flexDirection: 'row',
  },
  blochSphere: {
    position: "absolute",
    right: 0,
    bottom: 40,
    width: "25vw",
    height: 300,
    border: '1px solid #ddd',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  }
};

export default function BuilderScreen() {
  const [currentState, setCurrentState] = useState(KET_ZERO)
  const [interactiveState, setInteractiveState] = useState(null)
  return (
    <div style={classes.screen}>
      <div style={classes.main}>
        <SideBar>
          {SPRITE_ORDER.map((item, i) => {
            return <Gate key={i} {...item} size={CELL_WIDTH} />
          })}
        </SideBar>
        <BuilderWindow setCurrentState={setCurrentState} />
      </div>
      <div style={classes.bottomContainer}>
        <Timeline
          alpha={currentState.alpha}
          beta={currentState.beta}
          interactiveStateValue={interactiveState}
        />
        <BlochSphere
          style={classes.blochSphere}
          readOnly
          state={currentState}
          setInteractiveState={setInteractiveState}
        />
      </div>
      <Footer />
    </div>
  );
}