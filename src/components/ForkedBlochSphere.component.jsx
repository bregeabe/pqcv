// BlochSphere.jsx
import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import TextSprite from "@seregpie/three.text-sprite";
import GUI from "lil-gui";
import { polarCoordinatesHelper } from "../utils/qubit.utils";
import * as Qubit from "../interactive-blochsphere/Qubit";
import * as Gates from "../interactive-blochsphere/Gates";

const ARROW_HEAD_LEN = 1.0;
const ARROW_HEAD_W = 0.75;

const classes = {
    root: {
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        overflow: "hidden",
    },
    rootContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    infoContainer: {
        margin: "0 0 8px 0",
        fontSize: 16,
        lineHeight: 1.2,
    },
    sphereContainer: {
        flex: 1,
        minHeight: 1
    },
    sideBarContainer: {
        width: 150,
        minWidth: 150,
        flexShrink: 0,
    }
}

export default function BlochSphere({ className, readOnly, style, state, setInteractiveState }) {
    const rootRef = useRef(null);
    const infoRef = useRef(null);
    const controlsRef = useRef(null);
    const contentRef = useRef(null);
    const alphaFromState = state?.alpha
    const betaFromState = state?.beta

    function setPosition(object, v) {
        object.position.set(v.x, v.y, v.z);
    }

    function addTextAsChild(parent, textSprite, v) {
        const g = new THREE.Group();
        setPosition(g, v);
        g.add(textSprite);
        parent.add(g);
    }

    function getAbsoluteHeight(el) {
        if (!el) return 0;
        const styles = window.getComputedStyle(el);
        const margin =
            parseFloat(styles.marginTop || "0") + parseFloat(styles.marginBottom || "0");
        return Math.ceil(el.offsetHeight + margin);
    }

    const getTextInfo = useCallback((imagAlpha = 0, realAlpha = 1, imagBeta = 0, realBeta = 0, azimuthal = 0, polar = 0) => {
        return `${realAlpha.toFixed(4)} ${imagAlpha < 0 ? "" : "+"}${imagAlpha.toFixed(4)}i at: ${Math.round((azimuthal / Math.PI) * 180)}°||` +
            `${realBeta.toFixed(4)} ${imagBeta < 0 ? "" : "+"}${imagBeta.toFixed(4)}i at: ${Math.round((polar / Math.PI) * 180)}°`
    }, [])

    useEffect(() => {
        const rootEl = rootRef.current;
        const infoEl = infoRef.current;
        const controlsEl = controlsRef.current;
        const contentEl = contentRef.current;
        if (!rootEl || !controlsEl || !contentEl || !infoEl) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        contentEl.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(75, 1, 1, 1000);
        camera.position.set(22, 15, 30);

        const orbit = new OrbitControls(camera, renderer.domElement);

        const addLight = (pos) => {
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(pos[0], pos[1], pos[2]);
            scene.add(light);
        };
        addLight([-1, 2, 4]);
        addLight([1, -1, -2]);

        const sphereRadius = 15;
        const sphereSegments = 32;

        const mkCircle = (axis) => {
            const g = new THREE.CircleGeometry(sphereRadius, sphereSegments);
            if (axis === "x") g.rotateX(Math.PI / 2);
            if (axis === "y") g.rotateY(Math.PI / 2);
            return new THREE.LineSegments(
                new THREE.EdgesGeometry(g),
                new THREE.LineBasicMaterial({ color: 0x000000 })
            );
        };
        const lineZAxis = mkCircle("z");
        const lineXAxis = mkCircle("x");
        const lineYAxis = mkCircle("y");
        scene.add(lineZAxis, lineXAxis, lineYAxis);

        const origin = new THREE.Vector3(0, 0, 0);
        const axisLen = 18;
        const axisColor = 0x000000;

        const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, axisLen, axisColor, ARROW_HEAD_LEN, ARROW_HEAD_W);
        const arrowXNeg = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), origin, axisLen, axisColor, ARROW_HEAD_LEN, ARROW_HEAD_W);
        const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, axisLen, axisColor, ARROW_HEAD_LEN, ARROW_HEAD_W);
        const arrowYNeg = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), origin, axisLen, axisColor, ARROW_HEAD_LEN, ARROW_HEAD_W);
        const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, axisLen, axisColor, ARROW_HEAD_LEN, ARROW_HEAD_W);
        const arrowZNeg = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), origin, axisLen, axisColor, ARROW_HEAD_LEN, ARROW_HEAD_W);
        scene.add(arrowX, arrowXNeg, arrowY, arrowYNeg, arrowZ, arrowZNeg);

        const dotRadius = 0.2;
        const dotColor = 0x0000ff;
        const dotGeom = new THREE.SphereGeometry(dotRadius, 10, 10);
        const dotMat = new THREE.MeshBasicMaterial({ color: dotColor });

        const dotZero = new THREE.Mesh(dotGeom, dotMat);
        const dotOne = new THREE.Mesh(dotGeom, dotMat);
        const dotPos = new THREE.Mesh(dotGeom, dotMat);
        const dotNeg = new THREE.Mesh(dotGeom, dotMat);
        const dotIPos = new THREE.Mesh(dotGeom, dotMat);
        const dotINeg = new THREE.Mesh(dotGeom, dotMat);

        setPosition(dotZero, new THREE.Vector3(0, sphereRadius, 0));
        setPosition(dotOne, new THREE.Vector3(0, -sphereRadius, 0));
        setPosition(dotPos, new THREE.Vector3(0, 0, sphereRadius));
        setPosition(dotNeg, new THREE.Vector3(0, 0, -sphereRadius));
        setPosition(dotIPos, new THREE.Vector3(sphereRadius, 0, 0));
        setPosition(dotINeg, new THREE.Vector3(-sphereRadius, 0, 0));
        scene.add(dotZero, dotOne, dotNeg, dotPos, dotIPos, dotINeg);

        let qubit = new Qubit.Qubit();
        const qubitArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            origin,
            16,
            0xff0000,
            ARROW_HEAD_LEN,
            ARROW_HEAD_W
        );
        const qubitAnchor = new THREE.Group();
        qubitAnchor.add(qubitArrow);
        scene.add(qubitAnchor);

        const arrowTextColor = "black";
        const dotTextColor = "blue";
        const qubitTextColor = "red";
        const fontFamily = 'Times, serif, "Times New Roman"';
        const fontStyle = "italic";
        const fontSize = 2;

        addTextAsChild(
            arrowX.cone,
            new TextSprite({ color: arrowTextColor, fontFamily, fontSize, fontStyle, text: "x" }),
            new THREE.Vector3(0, -1.2, -2.4)
        );
        addTextAsChild(
            arrowY.cone,
            new TextSprite({ color: arrowTextColor, fontFamily, fontSize, fontStyle, text: "y" }),
            new THREE.Vector3(-2.4, -1.2, 0)
        );
        addTextAsChild(
            arrowZ.cone,
            new TextSprite({ color: arrowTextColor, fontFamily, fontSize, fontStyle, text: "z" }),
            new THREE.Vector3(0, 1.8, 0)
        );

        addTextAsChild(
            dotIPos,
            new TextSprite({ color: dotTextColor, fontFamily, fontSize, fontStyle, text: "|+i⟩" }),
            new THREE.Vector3(-2.4, 1.8, 0)
        );
        addTextAsChild(
            dotINeg,
            new TextSprite({ color: dotTextColor, fontFamily, fontSize, fontStyle, text: "|-i⟩" }),
            new THREE.Vector3(2.4, 1.8, 0)
        );
        addTextAsChild(
            dotPos,
            new TextSprite({ color: dotTextColor, fontFamily, fontSize, fontStyle, text: "|+⟩" }),
            new THREE.Vector3(0, 1.8, -2.4)
        );
        addTextAsChild(
            dotNeg,
            new TextSprite({ color: dotTextColor, fontFamily, fontSize, fontStyle, text: "|-⟩" }),
            new THREE.Vector3(0, 1.8, 2.4)
        );
        addTextAsChild(
            dotOne,
            new TextSprite({ color: dotTextColor, fontFamily, fontSize, fontStyle, text: "|1⟩" }),
            new THREE.Vector3(1.8, 2.4, 0)
        );
        addTextAsChild(
            dotZero,
            new TextSprite({ color: dotTextColor, fontFamily, fontSize, fontStyle, text: "|0⟩" }),
            new THREE.Vector3(1.8, -1.2, 0)
        );

        addTextAsChild(
            qubitArrow.cone,
            new TextSprite({ color: qubitTextColor, fontFamily, fontSize, fontStyle, text: "|Ψ⟩" }),
            new THREE.Vector3(1.8, 1.8, 0)
        );

        const refreshTextInfo = () => {
            const { theta: polar, phi: azimuthal } = qubit.polarCoordinates();
            const { realAlpha, imagAlpha, realBeta, imagBeta } = qubit.qubitValue();
            const { theta: polarFromHelper, phi: azimuthalFromHelper } = polarCoordinatesHelper(alphaFromState, betaFromState)
            const innerTextStr = `Alpha: ${realAlpha.toFixed(4)} ${imagAlpha < 0 ? "" : "+"
                }${imagAlpha.toFixed(4)}i${realAlpha < 0 ? "   " : "    "}φ: ${Math.round(
                    (azimuthal / Math.PI) * 180
                )}°Beta:  ${realBeta.toFixed(4)} ${imagBeta < 0 ? "" : "+"
                }${imagBeta.toFixed(4)}i${realBeta < 0 ? "   " : "    "}θ: ${Math.round(
                    (polar / Math.PI) * 180
                )}°`;
            infoEl.innerText = innerTextStr

            if (setInteractiveState) {
                setInteractiveState(getTextInfo(alphaFromState?.imag, alphaFromState?.real, betaFromState?.imag, betaFromState?.real, azimuthalFromHelper, polarFromHelper))
            }

        };

        const setArrowWithSphericalPolarCoordinates = (polar, azimuthal) => {
            qubitAnchor.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), azimuthal);
            qubitArrow.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), polar);
        };

        const refreshArrowPosition = () => {
            const { theta: polar, phi: azimuthal } = qubit.polarCoordinates();
            const { theta: polarFromHelper, phi: azimuthalFromHelper } = polarCoordinatesHelper(alphaFromState, betaFromState)
            // console.log("theta", polar, "phi", azimuthal)
            // console.log("thetaFromHelper", polarFromHelper, "phiFromHelper", azimuthalFromHelper)
            if (alphaFromState && betaFromState) {
                setArrowWithSphericalPolarCoordinates(polarFromHelper, azimuthalFromHelper);
            } else {
                setArrowWithSphericalPolarCoordinates(polar, azimuthal);
            }
            refreshTextInfo();
        };

        const gui = new GUI({ container: controlsEl, width: 150 });

        const actions = {
            State0: () => { qubit = new Qubit.Qubit(Qubit.baseState0[0], Qubit.baseState0[1]); refreshArrowPosition(); },
            State1: () => { qubit = new Qubit.Qubit(Qubit.baseState1[0], Qubit.baseState1[1]); refreshArrowPosition(); },
            StateM: () => { qubit = new Qubit.Qubit(Qubit.baseStateM[0], Qubit.baseStateM[1]); refreshArrowPosition(); },
            StateP: () => { qubit = new Qubit.Qubit(Qubit.baseStateP[0], Qubit.baseStateP[1]); refreshArrowPosition(); },
            StateMi: () => { qubit = new Qubit.Qubit(Qubit.baseStateMi[0], Qubit.baseStateMi[1]); refreshArrowPosition(); },
            StatePi: () => { qubit = new Qubit.Qubit(Qubit.baseStatePi[0], Qubit.baseStatePi[1]); refreshArrowPosition(); },

            XGate: () => { qubit.applyGate(Gates.XGate); refreshArrowPosition(); },
            YGate: () => { qubit.applyGate(Gates.YGate); refreshArrowPosition(); },
            ZGate: () => { qubit.applyGate(Gates.ZGate); refreshArrowPosition(); },
            HGate: () => { qubit.applyGate(Gates.HGate); refreshArrowPosition(); },

            SGate: () => { qubit.applyGate(Gates.SGate); refreshArrowPosition(); },
            SNegGate: () => { qubit.applyGate(Gates.SNegGate); refreshArrowPosition(); },
            YHalfGate: () => { qubit.applyGate(Gates.YHalfGate); refreshArrowPosition(); },
            YNegHalfGate: () => { qubit.applyGate(Gates.YNegHalfGate); refreshArrowPosition(); },
            XHalfGate: () => { qubit.applyGate(Gates.XHalfGate); refreshArrowPosition(); },
            XNegHalfGate: () => { qubit.applyGate(Gates.XNegHalfGate); refreshArrowPosition(); },

            TGate: () => { qubit.applyGate(Gates.TGate); refreshArrowPosition(); },
            TNegGate: () => { qubit.applyGate(Gates.TNegGate); refreshArrowPosition(); },
            YQuarterGate: () => { qubit.applyGate(Gates.YQuarterGate); refreshArrowPosition(); },
            YNegQuarterGate: () => { qubit.applyGate(Gates.YNegQuarterGate); refreshArrowPosition(); },
            XQuarterGate: () => { qubit.applyGate(Gates.XQuarterGate); refreshArrowPosition(); },
            XNegQuarterGate: () => { qubit.applyGate(Gates.XNegQuarterGate); refreshArrowPosition(); },
        };

        const setStateFolder = gui.addFolder("Set Qubit State");
        setStateFolder.add(actions, "State0").name("|0⟩");
        setStateFolder.add(actions, "State1").name("|1⟩");
        setStateFolder.add(actions, "StateM").name("|-⟩");
        setStateFolder.add(actions, "StateP").name("|+⟩");
        setStateFolder.add(actions, "StateMi").name("|-i⟩");
        setStateFolder.add(actions, "StatePi").name("|+i⟩");

        const halfTurnsFolder = gui.addFolder("Half Turn Gates");
        halfTurnsFolder.add(actions, "XGate").name("X");
        halfTurnsFolder.add(actions, "YGate").name("Y");
        halfTurnsFolder.add(actions, "ZGate").name("Z");
        halfTurnsFolder.add(actions, "HGate").name("H");

        const quarterTurnsFolder = gui.addFolder("Quarter Turn Gates");
        quarterTurnsFolder.add(actions, "SGate").name("S");
        quarterTurnsFolder.add(actions, "SNegGate").name("S^-1");
        quarterTurnsFolder.add(actions, "YHalfGate").name("Y^½");
        quarterTurnsFolder.add(actions, "YNegHalfGate").name("Y^-½");
        quarterTurnsFolder.add(actions, "XHalfGate").name("X^½");
        quarterTurnsFolder.add(actions, "XNegHalfGate").name("X^-½");

        const eighthTurnsFolder = gui.addFolder("Eighth Turn Gates");
        eighthTurnsFolder.add(actions, "TGate").name("T");
        eighthTurnsFolder.add(actions, "TNegGate").name("T^-1");
        eighthTurnsFolder.add(actions, "YQuarterGate").name("Y^¼");
        eighthTurnsFolder.add(actions, "YNegQuarterGate").name("Y^-¼");
        eighthTurnsFolder.add(actions, "XQuarterGate").name("X^¼");
        eighthTurnsFolder.add(actions, "XNegQuarterGate").name("X^-¼");

        halfTurnsFolder.open();
        quarterTurnsFolder.open();
        eighthTurnsFolder.open();

        const setSizes = () => {
            const rect = contentEl.getBoundingClientRect();
            const width = Math.max(1, Math.floor(rect.width));
            const infoH = getAbsoluteHeight(infoEl);
            const height = Math.max(1, Math.floor(rect.height - infoH));
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        };
        setSizes();

        const ro = new ResizeObserver(setSizes);
        ro.observe(contentEl);
        window.addEventListener("resize", setSizes);

        const refreshAndRender = () => {
            refreshArrowPosition();
        };
        refreshAndRender();

        let disposed = false;
        const animate = () => {
            if (disposed) return;
            requestAnimationFrame(animate);
            orbit.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            disposed = true;
            try { ro.disconnect(); } catch (e) { }
            window.removeEventListener("resize", setSizes);
            try { gui.destroy(); } catch (e) { }
            orbit.dispose();
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentElement === contentEl) {
                contentEl.removeChild(renderer.domElement);
            }
            try { dotGeom.dispose(); } catch (e) { }
            try { dotMat.dispose(); } catch (e) { }
        };
    }, [state]);

    return (
        <div
            ref={rootRef}
            className={className}
            style={{ ...classes.root, ...style }}
        >
            <div
                ref={contentRef}
                style={classes.rootContainer}
            >
                <pre ref={infoRef} style={{ ...classes.infoContainer, display: readOnly ? "none" : "block", }} />
                <div style={classes.sphereContainer} />
            </div>

            <div
                ref={controlsRef}
                style={{ ...classes.sideBarContainer, display: readOnly ? "none" : "block", }}
            />
        </div>
    );
}
