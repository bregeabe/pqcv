import React, { useCallback, useEffect, useState, useRef } from 'react';
import Channel from './Channel.component';
import Gate from './Gate.component';
import { theme } from '../theme';
import { CELL_WIDTH, KET_ZERO } from '../constants';
import { Button } from './form/Button.component';
import { generateInstructions } from '../services/channel.service';

const classes = {
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: theme.color.white,
    paddingTop: 120,
    boxSizing: 'border-box',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  buttonContainer: {
    display: 'flex', gap: 10
  },
};

const BuilderWindow = ({ setCurrentState }) => {
  const [channels, setChannels] = useState([{ sprites: {} }]);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [currentInstructionsIdx, setCurrentInstructionsIdx] = useState(0);
  const [instructions, setInstructions] = useState([]);
  const channelResetFns = useRef([]);
  const channelStepForwardFns = useRef([]);
  const channelStepBackwardFns = useRef([]);
  const channelCompileFns = useRef([]);

  const onSubmit = useCallback(async () => {
    const channelGatesById = channels.reduce((acc, channel, index) => {
      const gateIds = Object.values(channel.sprites).map(sprite => sprite.gateId);
      acc[index] = gateIds;
      return acc;
    }, {});

    try {
      const res = await generateInstructions(channelGatesById);
      setInstructions([KET_ZERO, ...res]);
      setHasCompiled(true);

      channelCompileFns.current.forEach(fn => typeof fn === 'function' && fn());
    } catch (error) {
      console.error('Error generating instructions:', error);
    }
  }, [channels, channelCompileFns]);

  const onStepForward = useCallback(() => {
    setCurrentInstructionsIdx(prev => {
      if (prev < instructions.length - 1) {
        channelStepForwardFns.current.forEach(fn => typeof fn === 'function' && fn());
        return prev + 1;
      } else {
        return prev;
      }
    });
  }, [instructions, channelStepForwardFns]);

  const onStepBackward = useCallback(() => {
    setCurrentInstructionsIdx(prev => {
      if (prev > 0) {
        channelStepBackwardFns.current.forEach(fn => typeof fn === 'function' && fn());
        return prev - 1;
      } else {
        return prev;
      }
    });
  }, [instructions, channelStepBackwardFns]);

  useEffect(() => {
    if (!instructions || instructions.length === 0) return;
    setCurrentState(instructions[currentInstructionsIdx]);
  }, [currentInstructionsIdx, instructions]);

  const handleDropSprite = (channelIndex, col, sprite, originChannel = null, originCol = null) => {
    setChannels(prev =>
      prev.map((channel, i) => {
        const newSprites = { ...channel.sprites };

        if (i === originChannel && originCol !== null) {
          delete newSprites[originCol];
        }

        if (i === channelIndex) {
          newSprites[col] = {
            ...sprite,
            height: sprite.type === 'image' ? 160 : CELL_WIDTH,
            isMultiQubit: sprite.type === 'image' && sprite.height === 160,
          };
        }

        setHasCompiled(false);
        return { ...channel, sprites: newSprites };
      })
    );
  };

  return (
    <div style={classes.root}>
      <div style={{ ...classes.contentContainer, position: 'relative' }}>
        {channels.map((channel, i) => (
          <Channel
            key={`channel-${i}`}
            channelIndex={i}
            sprites={channel.sprites}
            onDropSprite={handleDropSprite}
            instructions={instructions}
            currentInstructionsIdx={currentInstructionsIdx}
            onResetKet={(resetFn) => {
              channelResetFns.current[i] = resetFn;
            }}
            onStepForward={(forwardFn) => {
              channelStepForwardFns.current[i] = forwardFn;
            }}
            onStepBackward={(backwardFn) => {
              channelStepBackwardFns.current[i] = backwardFn;
            }}
            onCompile={(compileFn) => {
              channelCompileFns.current[i] = compileFn;
            }}
          />
        ))}

        {channels.map((channel, i) =>
          Object.entries(channel.sprites).map(([col, sprite]) => {
            const spriteHeight = sprite.height ?? CELL_WIDTH;
            if (!sprite.isMultiQubit) return null;

            const top = i * (CELL_WIDTH + 20) - (spriteHeight - CELL_WIDTH) / 2;

            return (
              <div
                key={`multi-${i}-${col}`}
                style={{
                  position: 'absolute',
                  top,
                  left: parseInt(col) * CELL_WIDTH + 20,
                  width: CELL_WIDTH,
                  height: spriteHeight,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                <Gate
                  index={sprite.index}
                  type={sprite.type}
                  src={sprite.src}
                  size={CELL_WIDTH}
                  height={spriteHeight}
                  originChannel={i}
                  originCol={parseInt(col)}
                />
              </div>
            );
          })
        )}

        <div style={classes.buttonContainer}>
          <Button onPress={onSubmit} title="Compile" />
          <Button
            onPress={() => {
              channelResetFns.current.forEach(reset => typeof reset === 'function' && reset());
              setChannels(prev =>
                prev.map(channel => ({
                  ...channel,
                  sprites: {},
                }))
              );
              setHasCompiled(false);
              setCurrentInstructionsIdx(0);
              setInstructions([]);
            }}
            title="Reset"
          />
          <Button onPress={onStepBackward} title="<- Step Backward" disabled={!hasCompiled} />
          <Button onPress={onStepForward} title="Step Forward ->" disabled={!hasCompiled} />
        </div>
      </div>
    </div>
  );
};

export default BuilderWindow;
