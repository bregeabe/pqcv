import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes, CELL_WIDTH } from '../constants';
import Gate from './Gate.component';
import { theme } from '../theme';
import ketzero from '../../assets/ketzero.png';
import ketone from '../../assets/ketone.png';
import ketplus from '../../assets/ketplus.png';
import ketminus from '../../assets/ketminus.png';
import { animate } from 'motion';

const classes = {
  wire: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 2,
    backgroundColor: theme.color.black,
    transform: 'translateY(-1px)',
  },
  gateContainer: {
    backgroundColor: '#ffffff',
    zIndex: 11,
  },
  wireContentContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 30,
    width: '100%',
    paddingLeft: '30px',
    position: 'relative',
  },
};

const Channel = ({
  sprites,
  onDropSprite,
  channelIndex,
  onResetKet,
  onStepForward,
  onStepBackward,
  onCompile,
  instructions,
  currentInstructionsIdx
}) => {
  const dropRef = useRef(null);
  const imgRef = useRef(null);
  const currentInstruction = useMemo(() => instructions[currentInstructionsIdx], [instructions, currentInstructionsIdx])
  const [markerXs, setMarkerXs] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [y, setY] = useState(0);

  const isBase = useMemo(() => !currentInstruction || Math.abs(currentInstruction?.alpha.real.toFixed(2)) == 1 || Math.abs(currentInstruction?.alpha.real.toFixed(2)) == 0, [currentInstruction]);
  const isHadamard = useMemo(() => currentInstruction?.alpha.real !== 1 && currentInstruction?.alpha.real !== 0, [currentInstruction]);

  const measureMarkers = useCallback(() => {
    const track = dropRef.current;
    if (!track) {
      return;
    }
    const trackLeft = track.getBoundingClientRect().left;

    const nodeList = track.querySelectorAll('[data-marker="true"]');
    const xs = Array.from(nodeList).map((node) => {
      const box = node.getBoundingClientRect();
      return (box.left - trackLeft) + 82;
    });

    setMarkerXs(xs);
  }, []);

  useEffect(() => {
    measureMarkers();
    const onResize = () => measureMarkers();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sprites, measureMarkers]);

  const animateTo = useCallback((x, y) => {
    if (!imgRef.current) return;
    animate(
      imgRef.current,
      { transform: `translate(${x}px, ${y}px)` },
      { duration: 0.35, easing: 'ease-in-out' }
    );
  }, []);

  const handleSrc = useMemo(() => {
    if (isBase) {
      return (currentInstruction?.beta.real === 0 || !currentInstruction) ? ketzero : ketone;
    }
    if (isHadamard) {
      return Math.sign(currentInstruction?.beta.real) == 1 ? ketplus : ketminus
    }
  }, [currentInstruction])

  const goToStep = useCallback((nextIdx) => {
    if (!markerXs.length) return;
    setStepIndex(nextIdx);
    animateTo(markerXs[nextIdx], y);
  }, [markerXs, y, animateTo]);

  const resetKetPosition = useCallback(() => {
    setY(0);
    setStepIndex(0);
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(0px, 0px)`;
    }
    setMarkerXs(0);
  }, []);

  const handleCompile = useCallback(() => {
    const liftY = -CELL_WIDTH;
    const firstMarkerX = markerXs[0] ?? 0;

    animateTo(firstMarkerX, liftY);

    setY(liftY);
    setStepIndex(0);
  }, [markerXs, animateTo]);


  const handleStepForward = useCallback(() => {
    if (!markerXs.length) return;
    goToStep(stepIndex + 1);
  }, [markerXs, stepIndex, goToStep]);

  const handleStepBackward = useCallback(() => {
    if (!markerXs.length) return;
    goToStep(stepIndex - 1);
  }, [markerXs, stepIndex, goToStep]);


  useEffect(() => {
    if (typeof onResetKet === 'function') onResetKet(resetKetPosition);
    if (typeof onStepForward === 'function') onStepForward(handleStepForward);
    if (typeof onStepBackward === 'function') onStepBackward(handleStepBackward);
    if (typeof onCompile === 'function') onCompile(handleCompile);
  }, [onResetKet, onStepForward, onStepBackward, onCompile, resetKetPosition, handleStepForward, handleStepBackward, handleCompile]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.SPRITE,
    drop: (item, monitor) => {
      const clientOffset = monitor.getSourceClientOffset();
      const boundingRect = dropRef.current?.getBoundingClientRect();
      if (!clientOffset || !boundingRect) return;

      const localX = clientOffset.x - boundingRect.left;
      const snappedCol = Math.floor(localX / CELL_WIDTH);

      if (snappedCol >= 0) {
        onDropSprite(
          channelIndex,
          snappedCol,
          {
            index: item.index,
            type: item.type,
            height: item.height,
            src: item.src,
            gateId: item.gateId,
          },
          item.originChannel,
          item.originCol
        );
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const stateClasses = useMemo(() => ({
    outerRow: {
      display: 'flex',
      width: '100%',
      gap: 20,
      left: 100,
      alignItems: 'center',
      position: 'relative',
    },
    trackCol: {
      position: 'relative',
      width: '100%',
      right: 0,
      minHeight: CELL_WIDTH,
    },
    channelContainer: {
      position: 'relative',
      minHeight: CELL_WIDTH,
      width: '100%',
      backgroundColor: isOver ? '#f0f0f0' : 'transparent',
      boxSizing: 'border-box',
    },
    gateWrapper: {
      width: CELL_WIDTH,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    animatedKet: {
      position: 'absolute',
      left: -100,
      height: CELL_WIDTH,
      width: CELL_WIDTH,
      pointerEvents: 'none',
      zIndex: 12,
      transform: 'translate(0px, 0px)',
    },
  }), [isOver]);

  return (
    <div style={stateClasses.outerRow}>
      <div
        style={stateClasses.trackCol}
        ref={(node) => {
          drop(node);
          dropRef.current = node;
        }}
      >
        <img ref={imgRef} src={handleSrc} style={stateClasses.animatedKet} />

        <div style={stateClasses.channelContainer}>
          <div style={classes.wire} />
          <div style={classes.wireContentContainer}>
            <div data-marker="true" style={{ width: 1, height: 1 }} />
            {Object.entries(sprites)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([col, sprite]) => {
                const spriteHeight = sprite.height ?? CELL_WIDTH;
                return (
                  <div
                    key={`${col}-${channelIndex}`}
                    className="gate-wrapper"
                    style={{ ...stateClasses.gateWrapper, height: spriteHeight }}
                  >
                    <div style={classes.gateContainer}>
                      <Gate
                        {...sprite}
                        size={CELL_WIDTH}
                        originChannel={channelIndex}
                        originCol={parseInt(col)}
                      />
                    </div>
                    <div data-marker="true" style={{ width: 1, height: 1 }} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Channel;
