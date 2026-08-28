import React, { useEffect, useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useRafLoop, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
} from "../variables";

// ── Domain model: ten slices, one of them wins ───────────────────────────────

const SLICES = 10;
const PRIZE_SLICES = 1;
const TRUE_CHANCE = PRIZE_SLICES / SLICES;
const MAX_SPINS = 200;
const SPIN_INTERVAL = 0.07; // seconds between spins while playing

const GUESS = "#AC8BF9";
const GUESS_TEXT = "#8B6BE0";
const REAL = "#62D0AD";
const REAL_TEXT = "#3FA98A";
const INK = "#64748B";
const INK_DARK = "#334155";
const PAPER = "#F1F5F9";

const fmtPercent = (v: number) => `${v.toFixed(1)}%`;

// ── Geometry ─────────────────────────────────────────────────────────────────

const VIEW_W = 560;
const VIEW_H = 430;
const WHEEL = { x: 150, y: 150, r: 92 };
const TRACK = { x0: 60, x1: 500 };
const TRACK_W = TRACK.x1 - TRACK.x0;
const GUESS_BAR = { y: 322, h: 26 };
const REAL_BAR = { y: 386, h: 26 };

const slicePath = (index: number) => {
    const step = (Math.PI * 2) / SLICES;
    const start = -Math.PI / 2 + index * step;
    const end = start + step;
    const x0 = WHEEL.x + WHEEL.r * Math.cos(start);
    const y0 = WHEEL.y + WHEEL.r * Math.sin(start);
    const x1 = WHEEL.x + WHEEL.r * Math.cos(end);
    const y1 = WHEEL.y + WHEEL.r * Math.sin(end);
    return `M ${WHEEL.x} ${WHEEL.y} L ${x0} ${y0} A ${WHEEL.r} ${WHEEL.r} 0 0 1 ${x1} ${y1} Z`;
};

const ease: React.CSSProperties = { transition: "opacity 150ms ease-out" };

// ── The bespoke figure ───────────────────────────────────────────────────────

function PredictTheSplitDrawing({ onPredictionMoved }: { onPredictionMoved: () => void }) {
    const setVar = useSetVar();
    const prediction = useVar<number>("fiftyPrediction", 50);
    const spins = useVar<number>("fiftySpins", 0);
    const wins = useVar<number>("fiftyWins", 0);
    const playing = useVar<boolean>("fiftySpinning", false);
    const highlight = useVar<string>("fiftyHighlight", "");

    const svgRef = useRef<SVGSVGElement>(null);
    const spinsRef = useRef(spins);
    const winsRef = useRef(wins);
    const accumulator = useRef(0);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (spins === 0) {
            spinsRef.current = 0;
            winsRef.current = 0;
        }
    }, [spins]);

    useRafLoop(
        (dt) => {
            accumulator.current += dt;
            while (accumulator.current >= SPIN_INTERVAL && spinsRef.current < MAX_SPINS) {
                accumulator.current -= SPIN_INTERVAL;
                spinsRef.current += 1;
                if (Math.random() < TRUE_CHANCE) winsRef.current += 1;
            }
            setVar("fiftySpins", spinsRef.current);
            setVar("fiftyWins", winsRef.current);
            if (spinsRef.current >= MAX_SPINS) setVar("fiftySpinning", false);
        },
        { paused: !playing },
    );

    const spinOnce = () => {
        if (spinsRef.current >= MAX_SPINS) return;
        spinsRef.current += 1;
        if (Math.random() < TRUE_CHANCE) winsRef.current += 1;
        setVar("fiftySpins", spinsRef.current);
        setVar("fiftyWins", winsRef.current);
    };

    const realShare = spins > 0 ? wins / spins : 0;
    const wheelAngle = useSpring(spins * 47, { stiffness: 90, damping: 16 });
    const guessX = TRACK.x0 + (prediction / 100) * TRACK_W;
    const realWidth = useSpring(realShare * TRACK_W, { stiffness: 170, damping: 20 });

    const lit = (id: string) => highlight === id;
    const fade = (id: string) => (highlight ? (highlight === id ? 1 : 0.35) : 1);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("fiftyHighlight", id),
        onPointerLeave: () => setVar("fiftyHighlight", ""),
    });

    const applyPointer = (event: React.PointerEvent<SVGRectElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const svgX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
        const percent = ((svgX - TRACK.x0) / TRACK_W) * 100;
        setVar("fiftyPrediction", clamp(Math.round(percent), 0, 100));
        onPredictionMoved();
    };

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full"
            style={{ touchAction: "none" }}>
            <defs>
                <filter id="split-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* The wheel: ten slices, one winner */}
            <g opacity={fade("prizeSlice")} style={ease} {...hoverProps("prizeSlice")}>
                <polygon points={`${WHEEL.x - 10},40 ${WHEEL.x + 10},40 ${WHEEL.x},64`} fill={INK_DARK} />
                <g transform={`rotate(${wheelAngle} ${WHEEL.x} ${WHEEL.y})`}
                    style={{ cursor: "pointer" }} onClick={spinOnce}>
                    {Array.from({ length: SLICES }, (_, i) => {
                        const isPrize = i < PRIZE_SLICES;
                        return (
                            <g key={i}>
                                {isPrize && lit("prizeSlice") && (
                                    <path d={slicePath(i)} fill="none" stroke={REAL} strokeWidth="9"
                                        opacity={0.28} strokeLinejoin="round" />
                                )}
                                <path d={slicePath(i)} fill={isPrize ? REAL : PAPER} stroke={INK}
                                    strokeWidth={isPrize && lit("prizeSlice") ? 3.5 : 1.5} strokeLinejoin="round"
                                    style={{ transition: "stroke-width 150ms ease-out" }} />
                            </g>
                        );
                    })}
                </g>
                <text x={WHEEL.x} y={272} textAnchor="middle" fontSize="12" fill={INK}>
                    1 winning slice out of 10
                </text>
            </g>

            {/* Tally beside the wheel */}
            <g opacity={fade("")} style={ease}>
                <text x={300} y={134} fontSize="13" fill={INK_DARK}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`Spins so far: ${spins}`}
                </text>
                <text x={300} y={164} fontSize="13" fill={REAL_TEXT}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`Wins so far: ${wins}`}
                </text>
                <text x={300} y={200} fontSize="12" fill={INK}>
                    Click the wheel for one spin
                </text>
            </g>

            {/* The student's predicted split */}
            <g opacity={fade("guessBar")} style={ease} {...hoverProps("guessBar")}>
                <text x={TRACK.x0} y={312} fontSize="12" fill={GUESS_TEXT}>
                    Your guess
                </text>
                <text x={TRACK.x1} y={312} textAnchor="end" fontSize="12" fill={GUESS_TEXT}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`Win ${fmtPercent(prediction)}`}
                </text>
                <rect x={TRACK.x0} y={GUESS_BAR.y} width={TRACK_W} height={GUESS_BAR.h} rx={6} fill={PAPER} />
                <rect x={TRACK.x0} y={GUESS_BAR.y} width={guessX - TRACK.x0} height={GUESS_BAR.h} rx={6}
                    fill={GUESS} opacity={lit("guessBar") ? 1 : 0.85} />
                <line x1={guessX} y1={GUESS_BAR.y + GUESS_BAR.h} x2={guessX} y2={REAL_BAR.y + REAL_BAR.h}
                    stroke={GUESS} strokeWidth="2" strokeDasharray="4 5" opacity={0.55} />
                {lit("guessBar") && (
                    <rect x={guessX - 9} y={GUESS_BAR.y - 12} width={18} height={GUESS_BAR.h + 24} rx={9}
                        fill={GUESS} opacity={0.28} />
                )}
                <rect x={guessX - 4} y={GUESS_BAR.y - 8} width={8} height={GUESS_BAR.h + 16} rx={4}
                    fill={GUESS} stroke="#FFFFFF" strokeWidth="2" filter="url(#split-shadow)" />
                <rect
                    x={guessX - 18}
                    y={GUESS_BAR.y - 16}
                    width={36}
                    height={GUESS_BAR.h + 32}
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging(true);
                        applyPointer(event);
                    }}
                    onPointerMove={(event) => {
                        if (dragging) applyPointer(event);
                    }}
                    onPointerUp={() => setDragging(false)}
                />
            </g>

            {/* What the spins actually produced */}
            <g opacity={fade("realBar")} style={ease} {...hoverProps("realBar")}>
                <text x={TRACK.x0} y={376} fontSize="12" fill={REAL_TEXT}>
                    What actually happened
                </text>
                <text x={TRACK.x1} y={376} textAnchor="end" fontSize="12" fill={REAL_TEXT}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {spins === 0 ? "no spins yet" : `Win ${fmtPercent(realShare * 100)} of ${spins} spins`}
                </text>
                <rect x={TRACK.x0} y={REAL_BAR.y} width={TRACK_W} height={REAL_BAR.h} rx={6} fill={PAPER} />
                {lit("realBar") && (
                    <rect x={TRACK.x0 - 4} y={REAL_BAR.y - 4} width={Math.max(0, realWidth) + 8}
                        height={REAL_BAR.h + 8} rx={9} fill={REAL} opacity={0.28} />
                )}
                <rect x={TRACK.x0} y={REAL_BAR.y} width={Math.max(0, realWidth)} height={REAL_BAR.h} rx={6}
                    fill={REAL} />
            </g>
        </svg>
    );
}

function PredictTheSplitFigure() {
    const setVar = useSetVar();
    const [moved, setMoved] = useState(false);
    return (
        <Figure
            id="predict-the-split"
            playable
            playVarName="fiftySpinning"
            onReset={() => {
                setVar("fiftyPrediction", 50);
                setVar("fiftySpins", 0);
                setVar("fiftyWins", 0);
                setVar("fiftySpinning", false);
                setVar("fiftyHighlight", "");
            }}
            caption="Split the top bar where you think the win and lose chances sit, then press play to spin the wheel again and again. The lower bar fills in with what the spins actually gave."
        >
            <PredictTheSplitDrawing onPredictionMoved={() => setMoved(true)} />
            <InteractionHintSequence
                hintKey="predict-the-split"
                currentStep={moved ? 1 : 0}
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the divider to split the bar",
                        position: { x: "50%", y: "78%" },
                        dragPath: { type: "line", startOffset: { x: -34, y: 0 }, endOffset: { x: 34, y: 0 } },
                        color: GUESS,
                    },
                    {
                        gesture: "click",
                        label: "Now press play and let the wheel spin",
                        position: { x: "90%", y: "9%" },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Section blocks ───────────────────────────────────────────────────────────

export const notFiftyFiftyBlocks: ReactElement[] = [
    <StackLayout key="layout-fifty-heading" maxWidth="xl">
        <Block id="fifty-heading" padding="md">
            <EditableH2 id="h2-fifty-heading" blockId="fifty-heading">
                Not Everything Is 50-50
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fifty-setup" maxWidth="xl">
        <Block id="fifty-setup" padding="sm">
            <EditableParagraph id="para-fifty-setup" blockId="fifty-setup">
                Ask someone at the fair whether they will win, and you often hear the same answer: either you win or you don't, so it must be fifty-fifty. Before any spinning happens, drag the divider to split the bar where you think the chances really sit. Then let the wheel spin and see how close your split was.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fifty-visual" maxWidth="xl">
        <Block id="fifty-visual" padding="sm" hasVisualization>
            <PredictTheSplitFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fifty-insight" maxWidth="xl">
        <Block id="fifty-insight" padding="sm">
            <EditableParagraph id="para-fifty-insight" blockId="fifty-insight">
                Two outcomes is not the same thing as two equal chances. A win and a loss are only fifty-fifty when exactly half of the results win, and here just{" "}
                <InlineLinkedHighlight
                    id="link-fifty-prize-slice"
                    varName="fiftyHighlight"
                    highlightId="prizeSlice"
                    color="#3FA98A"
                    bgColor="rgba(98, 208, 173, 0.2)"
                >
                    one slice in ten
                </InlineLinkedHighlight>
                {" "}does, which is why{" "}
                <InlineLinkedHighlight
                    id="link-fifty-real-bar"
                    varName="fiftyHighlight"
                    highlightId="realBar"
                    color="#3FA98A"
                    bgColor="rgba(98, 208, 173, 0.2)"
                >
                    the real split
                </InlineLinkedHighlight>
                {" "}settles near a tenth of the bar however long you spin.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fifty-question-red" maxWidth="xl">
        <Block id="fifty-question-red" padding="md">
            <EditableParagraph id="para-fifty-question-red" blockId="fifty-question-red">
                A bag holds 1 red counter and 9 blue ones, and you reach in without looking. The chance of pulling out the red one is{" "}
                <InlineFeedback
                    varName="answer_fifty_red"
                    correctValue="10%"
                    position="terminal"
                    successMessage="— yes, one winner among ten counters is a tenth, or 10%"
                    failureMessage="— careful, that is the fifty-fifty trap"
                    hint="Red either comes out or it doesn't, but there are ten counters and only one of them is red"
                    visualizationHint={{
                        blockId: "fifty-visual",
                        hintKey: "fifty-fifty-discovery-hint",
                        label: "Discover it yourself",
                        resetVars: { fiftyPrediction: 50, fiftySpins: 0, fiftyWins: 0, fiftySpinning: false },
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Split the bar right down the middle, the fifty-fifty guess",
                                position: { x: "50%", y: "78%" },
                                dragPath: { type: "line", startOffset: { x: -34, y: 0 }, endOffset: { x: 34, y: 0 } },
                                completionVar: "fiftyPrediction",
                                completionValue: 50,
                                completionTolerance: 4,
                            },
                            {
                                gesture: "click",
                                label: "Now spin the wheel many times and watch where the lower bar stops",
                                position: { x: "90%", y: "9%" },
                                completionVar: "fiftySpins",
                                completionValue: 60,
                                completionTolerance: 40,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_fifty_red"
                        correctAnswer="10%"
                        options={["50%", "10%", "1%"]}
                        {...choicePropsFromDefinition(getVariableInfo("answer_fifty_red"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fifty-question-spinner" maxWidth="xl">
        <Block id="fifty-question-spinner" padding="md">
            <EditableParagraph id="para-fifty-question-spinner" blockId="fifty-question-spinner">
                A different spinner has 8 equal sections, and 2 of them win. Written as a percentage, the chance of winning one spin is{" "}
                <InlineFeedback
                    varName="answer_fifty_spinner"
                    correctValue={["25%", "25", "25 %", "0.25"]}
                    position="terminal"
                    successMessage="— exactly, 2 out of 8 is a quarter of the spinner, so 25%"
                    failureMessage="— not yet"
                    hint="Count the winning sections over all 8 sections, then turn that fraction into a percentage"
                    reviewBlockId="counting-rule"
                    reviewLabel="Look again at the rule"
                >
                    <InlineClozeInput
                        varName="answer_fifty_spinner"
                        correctAnswer={["25%", "25", "25 %", "0.25"]}
                        {...clozePropsFromDefinition(getVariableInfo("answer_fifty_spinner"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
