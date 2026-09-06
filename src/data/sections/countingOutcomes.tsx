import React, { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineSpotColor,
    InlineTooltip,
    InteractionHintSequence,
    TriggeredHintOverlay,
} from "@/components/atoms";
import { FormulaBlock, Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import { getVariableInfo, clozePropsFromDefinition, scrubVarsFromDefinitions, spotColorPropsFromDefinition } from "../variables";

// ── Domain model ─────────────────────────────────────────────────────────────

const TARGET_RED = 1;
const TARGET_TOTAL = 4; // the target chance: 1 red in every 4 counters
const MAX_RED = 8;
const MAX_BLUE = 16;

const RED = "#E0524A";
const RED_TEXT = "#C93B32";
const BLUE = "#62CCF9";
const BLUE_TEXT = "#2E9BD1";
const INK = "#64748B";
const INK_DARK = "#334155";
const SAMPLE = "#8B5CF6"; // the sample space: the bag, n(S), and the prose that names it
const ACCENT = "#62D0AD";

const fmtPercent = (v: number) => `${v.toFixed(1)}%`;

// ── Geometry ─────────────────────────────────────────────────────────────────

const VIEW_W = 560;
const VIEW_H = 356; // the readout row (y 336) is the lowest ink
const BAG = { x: 250, y: 104, w: 220, h: 180 };
const COUNTER_R = 13;
const COLS = 6;
const CELL_W = 34;
const CELL_H = 33;
const GRID_X0 = 262;
const GRID_Y0 = BAG.y + BAG.h - 22;
const TRAY_RED = { x: 78, y: 168 };
const TRAY_BLUE = { x: 170, y: 168 };
const BAR = { x: 250, y: 298, w: 220, h: 12 };

const counterPosition = (index: number) => ({
    x: GRID_X0 + (index % COLS) * CELL_W + 17,
    y: GRID_Y0 - Math.floor(index / COLS) * CELL_H,
});

const insideBag = (x: number, y: number) =>
    x > BAG.x - 20 && x < BAG.x + BAG.w + 20 && y > BAG.y - 20 && y < BAG.y + BAG.h + 20;

// ── The bespoke figure ───────────────────────────────────────────────────────

function CounterBagDrawing() {
    const setVar = useSetVar();
    const red = useVar<number>("bagRedCounters", 0);
    const blue = useVar<number>("bagBlueCounters", 3);
    const highlight = useVar<string>("countingHighlight", "");
    const svgRef = useRef<SVGSVGElement>(null);
    const [drag, setDrag] = useState<{ color: "red" | "blue"; x: number; y: number } | null>(null);

    const total = red + blue;
    const share = total > 0 ? red / total : 0;
    const onTarget = total > 0 && red * TARGET_TOTAL === total * TARGET_RED;
    const barWidth = useSpring(share * BAR.w, { stiffness: 160, damping: 18 });

    const redsLit = highlight === "redCounters" || highlight === "allCounters";
    const bluesLit = highlight === "allCounters";
    const bagLit = highlight === "allCounters";
    const fade = (lit: boolean) => (highlight ? (lit ? 1 : 0.35) : 1);
    const ease = { transition: "opacity 150ms ease-out" } as React.CSSProperties;

    const toSvg = (event: React.PointerEvent): { x: number; y: number } => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
        };
    };

    const startDrag = (color: "red" | "blue") => (event: React.PointerEvent<SVGGElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = toSvg(event);
        setDrag({ color, ...point });
    };

    const moveDrag = (event: React.PointerEvent<SVGGElement>) => {
        if (!drag) return;
        const point = toSvg(event);
        setDrag({ ...drag, ...point });
    };

    const endDrag = (event: React.PointerEvent<SVGGElement>) => {
        if (!drag) return;
        const point = toSvg(event);
        if (insideBag(point.x, point.y)) {
            if (drag.color === "red") setVar("bagRedCounters", clamp(red + 1, 0, MAX_RED));
            else setVar("bagBlueCounters", clamp(blue + 1, 0, MAX_BLUE));
        }
        setDrag(null);
    };

    const removeCounter = (color: "red" | "blue") => () => {
        if (color === "red") setVar("bagRedCounters", clamp(red - 1, 0, MAX_RED));
        else setVar("bagBlueCounters", clamp(blue - 1, 0, MAX_BLUE));
    };


    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full"
            style={{ touchAction: "none" }}
        >
            <defs>
                <filter id="counter-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Target, stated once at the top */}
            <g opacity={fade(false)} style={ease}>
                <text x={360} y={44} textAnchor="middle" fontSize="16" fill={INK_DARK}>
                    Target: 1 <tspan fill={RED_TEXT}>red</tspan> in every 4 counters
                </text>
                {onTarget && (
                    <text x={360} y={70} textAnchor="middle" fontSize="16" fill={ACCENT}
                        style={{ fontVariantNumeric: "tabular-nums" }}>
                        Target reached
                    </text>
                )}
            </g>

            {/* Tray of counters to drag from */}
            <g opacity={fade(false)} style={ease}>
                <text x={124} y={112} textAnchor="middle" fontSize="15" fill={INK}>
                    Counter tray
                </text>
                {[TRAY_RED, TRAY_BLUE].map((spot, i) => (
                    <g key={i}>
                        <circle cx={spot.x} cy={spot.y + 12} r={COUNTER_R} fill="#F1F5F9" stroke={INK} strokeWidth="1.5" />
                        <circle cx={spot.x} cy={spot.y + 6} r={COUNTER_R} fill="#F1F5F9" stroke={INK} strokeWidth="1.5" />
                    </g>
                ))}
                <g
                    style={{ cursor: "grab", touchAction: "none" }}
                    onPointerDown={startDrag("red")}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                >
                    <circle cx={TRAY_RED.x} cy={TRAY_RED.y} r={COUNTER_R} fill={RED} stroke={INK} strokeWidth="1.5"
                        filter="url(#counter-shadow)" />
                    <circle cx={TRAY_RED.x} cy={TRAY_RED.y} r={26} fill="transparent" />
                </g>
                <g
                    style={{ cursor: "grab", touchAction: "none" }}
                    onPointerDown={startDrag("blue")}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                >
                    <circle cx={TRAY_BLUE.x} cy={TRAY_BLUE.y} r={COUNTER_R} fill={BLUE} stroke={INK} strokeWidth="1.5"
                        filter="url(#counter-shadow)" />
                    <circle cx={TRAY_BLUE.x} cy={TRAY_BLUE.y} r={26} fill="transparent" />
                </g>
                <text x={TRAY_RED.x} y={216} textAnchor="middle" fontSize="15" fill={RED_TEXT}>
                    Red wins
                </text>
                <text x={TRAY_BLUE.x} y={216} textAnchor="middle" fontSize="15" fill={BLUE_TEXT}>
                    Blue loses
                </text>
            </g>

            {/* The bag */}
            <g
                opacity={fade(bagLit)}
                style={ease}
                onPointerEnter={() => setVar("countingHighlight", "allCounters")}
                onPointerLeave={() => setVar("countingHighlight", "")}
            >
                {bagLit && (
                    <rect x={BAG.x} y={BAG.y} width={BAG.w} height={BAG.h} rx={12} fill="none"
                        stroke={SAMPLE} strokeWidth="9" opacity={0.22} />
                )}
                <rect x={BAG.x} y={BAG.y} width={BAG.w} height={BAG.h} rx={12} fill="#FFFFFF"
                    stroke={SAMPLE} strokeWidth={bagLit ? 3.5 : 2} style={{ transition: "stroke-width 150ms ease-out" }} />
                <line x1={BAG.x} y1={BAG.y + 26} x2={BAG.x + BAG.w} y2={BAG.y + 26} stroke={SAMPLE}
                    strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
            </g>

            {/* Counters inside the bag — red first, then blue */}
            <g
                opacity={fade(redsLit)}
                style={{ ...ease, cursor: "pointer" }}
                onPointerEnter={() => setVar("countingHighlight", "redCounters")}
                onPointerLeave={() => setVar("countingHighlight", "")}
                onClick={removeCounter("red")}
            >
                {Array.from({ length: red }, (_, i) => {
                    const pos = counterPosition(i);
                    return (
                        <g key={`red-${i}`}>
                            {redsLit && <circle cx={pos.x} cy={pos.y} r={COUNTER_R + 6} fill={RED} opacity={0.28} />}
                            <circle cx={pos.x} cy={pos.y} r={redsLit ? COUNTER_R + 2 : COUNTER_R} fill={RED}
                                stroke={INK} strokeWidth={redsLit ? 2.5 : 1.5}
                                style={{ transition: "r 150ms ease-out, stroke-width 150ms ease-out" }} />
                        </g>
                    );
                })}
            </g>
            <g opacity={fade(bluesLit)} style={{ ...ease, cursor: "pointer" }} onClick={removeCounter("blue")}>
                {Array.from({ length: blue }, (_, i) => {
                    const pos = counterPosition(red + i);
                    return (
                        <circle key={`blue-${i}`} cx={pos.x} cy={pos.y} r={COUNTER_R} fill={BLUE}
                            stroke={INK} strokeWidth="1.5" />
                    );
                })}
            </g>

            {/* Share bar with the target tick */}
            <g opacity={fade(false)} style={ease}>
                <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={6} fill="#F1F5F9" />
                <rect x={BAR.x} y={BAR.y} width={Math.max(0, barWidth)} height={BAR.h} rx={6} fill={RED} />
                <line x1={BAR.x + BAR.w * 0.25} y1={BAR.y - 7} x2={BAR.x + BAR.w * 0.25} y2={BAR.y + BAR.h + 7}
                    stroke={INK_DARK} strokeWidth="2" strokeLinecap="round" />
                <text x={360} y={336} textAnchor="middle" fontSize="16" fill={INK_DARK}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {total === 0 ? (
                        "The bag is empty"
                    ) : (
                        <>
                            {`${red} `}
                            <tspan fill={RED_TEXT}>red</tspan>
                            {` out of ${total} counters`}
                        </>
                    )}
                </text>
                {/* the fraction sits in the open space under the tray, level with the bar */}
                {total > 0 && (
                    <g style={{ fontVariantNumeric: "tabular-nums" }}>
                        <text x={92} y={309} textAnchor="end" fontSize="15" fill={RED_TEXT}>
                            n(A)
                        </text>
                        <text x={92} y={337} textAnchor="end" fontSize="15" fill={SAMPLE}>
                            n(S)
                        </text>
                        <text x={124} y={309} textAnchor="middle" fontSize="20" fill={RED_TEXT}>
                            {red}
                        </text>
                        <line x1={104} y1={314} x2={144} y2={314} stroke={INK_DARK} strokeWidth="2"
                            strokeLinecap="round" />
                        <text x={124} y={337} textAnchor="middle" fontSize="20" fill={INK_DARK}>
                            {total}
                        </text>
                        <text x={158} y={324} textAnchor="start" fontSize="19" fill={INK_DARK}>
                            {`= ${fmtPercent(share * 100)}`}
                        </text>
                    </g>
                )}
            </g>

            {/* The counter being dragged */}
            {drag && (
                <circle cx={drag.x} cy={drag.y} r={COUNTER_R} fill={drag.color === "red" ? RED : BLUE}
                    stroke={INK} strokeWidth="1.5" filter="url(#counter-shadow)" opacity={0.9} />
            )}
        </svg>
    );
}

function CounterBagFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="counter-bag"
            onReset={() => {
                // three blues and no red: one red short of the target, so the
                // first drag the hint asks for is the one that reaches it
                setVar("bagRedCounters", 0);
                setVar("bagBlueCounters", 3);
                setVar("countingHighlight", "");
            }}
            caption="Drag counters into the bag, or click one to take it out. The tick on the bar marks the target of 1 in 4."
        >
            <CounterBagDrawing />
            <InteractionHintSequence
                hintKey="counter-bag-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag a red counter into the bag",
                        position: { x: "14%", y: "47%" },
                        dragPath: { type: "line", startOffset: { x: -12, y: 0 }, endOffset: { x: 46, y: -14 } },
                    },
                ]}
            />
            {/* listens for the equivalence question's "Discover it yourself" journey */}
            <TriggeredHintOverlay hintKey="counting-bag-equivalent-hint" />
        </Figure>
    );
}

// ── Section blocks ───────────────────────────────────────────────────────────

export const countingOutcomesBlocks: ReactElement[] = [
    <StackLayout key="layout-counting-heading" maxWidth="xl">
        <Block id="counting-heading" padding="md">
            <EditableH2 id="h2-counting-heading" blockId="counting-heading">
                Sample Space and Favourable Outcomes
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-setup" maxWidth="xl">
        <Block id="counting-setup" padding="sm">
            <EditableParagraph id="para-counting-setup" blockId="counting-setup">Probability begins with counting, not with guessing. It needs the <InlineTooltip tooltip={"The sample space, written S, is the complete set of outcomes that could happen. Here it is every counter in the bag."} color={"#8B5CF6"} bgColor={"rgba(139, 92, 246, 0.15)"} position={"auto"} maxWidth={400} id={"tooltip-counting-sample-space"}>sample space</InlineTooltip>, every outcome that could happen, and the <InlineTooltip tooltip={"A favourable outcome is one that counts as a success for the event being measured, here drawing a red counter."} color={"#C93B32"} bgColor={"rgba(224, 82, 74, 0.15)"} position={"auto"} maxWidth={400} id={"tooltip-counting-favourable"}>favourable outcomes</InlineTooltip> inside it. Drag <InlineSpotColor id="spot-counting-red" varName="termRedCounter" {...spotColorPropsFromDefinition(getVariableInfo('termRedCounter'))}>red</InlineSpotColor> and <InlineSpotColor id="spot-counting-blue" varName="termBlueCounter" {...spotColorPropsFromDefinition(getVariableInfo('termBlueCounter'))}>blue</InlineSpotColor> counters from the tray into the bag until the <InlineSpotColor id="spot-counting-reds" varName="termRedCounter" {...spotColorPropsFromDefinition(getVariableInfo('termRedCounter'))}>reds</InlineSpotColor> make up exactly one in four, and watch the ratio move with every counter you add.</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-visual" maxWidth="xl">
        <Block id="counting-visual" padding="sm" hasVisualization>
            <CounterBagFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-rule" maxWidth="xl">
        <Block id="counting-rule" padding="lg">
            <FormulaBlock
                latex="P(A) = \frac{\textcolor{#C93B32}{n(A)}}{\textcolor{#8B5CF6}{n(S)}} = \frac{\scrub{bagRedCounters}}{\scrub{bagRedCounters} + \scrub{bagBlueCounters}}"
                variables={scrubVarsFromDefinitions(["bagRedCounters", "bagBlueCounters"])}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-insight" maxWidth="xl">
        <Block id="counting-insight" padding="sm">
            <EditableParagraph id="para-counting-insight" blockId="counting-insight">
                Probability is a ratio: the{" "}
                <InlineLinkedHighlight
                    id="link-counting-red"
                    varName="countingHighlight"
                    highlightId="redCounters"
                    color="#C93B32"
                    bgColor="rgba(224, 82, 74, 0.2)"
                >
                    favourable outcomes
                </InlineLinkedHighlight>
                {" "}n(A) over the{" "}
                <InlineLinkedHighlight
                    id="link-counting-all"
                    varName="countingHighlight"
                    highlightId="allCounters"
                    color="#8B5CF6"
                    bgColor="rgba(139, 92, 246, 0.2)"
                >
                    whole sample space
                </InlineLinkedHighlight>
                {" "}n(S). That is why 1{" "}
                <InlineSpotColor id="spot-counting-red-in-four" varName="termRedCounter" {...spotColorPropsFromDefinition(getVariableInfo('termRedCounter'))}>
                    red
                </InlineSpotColor>
                {" "}in 4 and 4{" "}
                <InlineSpotColor id="spot-counting-reds-in-sixteen" varName="termRedCounter" {...spotColorPropsFromDefinition(getVariableInfo('termRedCounter'))}>
                    reds
                </InlineSpotColor>
                {" "}in 16 give the same answer. So for the eight-slice wheel with one winning slice, the fraction fills in like this.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-fair-wheel-fraction" maxWidth="xl">
        <Block id="counting-fair-wheel-fraction" padding="lg">
            <FormulaBlock
                latex="P(W) = \frac{n(W)}{n(S)} = \frac{\choice{answer_fair_wheel_numerator}}{\choice{answer_fair_wheel_denominator}}"
                clozeChoices={{
                    answer_fair_wheel_numerator: {
                        correctAnswer: "1",
                        options: ["1", "7", "8"],
                        placeholder: "?",
                        color: "#C93B32",
                        bgColor: "rgba(224, 82, 74, 0.18)",
                    },
                    answer_fair_wheel_denominator: {
                        correctAnswer: "8",
                        options: ["1", "7", "8"],
                        placeholder: "?",
                        color: "#8B5CF6",
                        bgColor: "rgba(139, 92, 246, 0.18)",
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-question-percent" maxWidth="xl">
        <Block id="counting-question-percent" padding="md">
            <EditableParagraph id="para-counting-question-percent" blockId="counting-question-percent">
                A prize wheel at another stall is cut into 20 equally likely slices, and 5 of them win. Written as a percentage, the probability of winning one spin is{" "}
                <InlineFeedback
                    varName="answer_counting_percent"
                    correctValue={["25%", "25", "25 %", "0.25"]}
                    position="terminal"
                    successMessage="— exactly, 5 out of 20 is one quarter of the wheel, which is 25%"
                    failureMessage="— not quite yet"
                    hint="Write the chance as 5 out of 20 first, then turn that fraction into a percentage"
                    reviewBlockId="counting-rule"
                    reviewLabel="Look again at the rule"
                >
                    <InlineClozeInput
                        varName="answer_counting_percent"
                        correctAnswer={["25%", "25", "25 %", "0.25"]}
                        {...clozePropsFromDefinition(getVariableInfo("answer_counting_percent"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-question-equivalent" maxWidth="xl">
        <Block id="counting-question-equivalent" padding="md">
            <EditableParagraph id="para-counting-question-equivalent" blockId="counting-question-equivalent">
                A bag with 1 red counter out of 4 gives exactly the same probability as a bag of 4 red counters, provided the size of its sample space is{" "}
                <InlineFeedback
                    varName="answer_counting_equivalent"
                    correctValue="16"
                    position="terminal"
                    successMessage="— right, 4 out of 16 is the same share as 1 out of 4"
                    failureMessage="— almost"
                    hint="Four times as many reds needs four times as many counters altogether"
                    visualizationHint={{
                        blockId: "counting-visual",
                        hintKey: "counting-bag-equivalent-hint",
                        label: "Discover it yourself",
                        resetVars: { bagRedCounters: 1, bagBlueCounters: 3, countingHighlight: "" },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag red counters in until there are 4 reds — the bar climbs past the target tick",
                                position: { x: "14%", y: "47%" },
                                dragPath: { type: "line", startOffset: { x: -12, y: 0 }, endOffset: { x: 46, y: -14 } },
                                completionVar: "bagRedCounters",
                                completionValue: 4,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "drag",
                                label: "Now add blue counters until the bar drops back onto the target — count what is in the bag",
                                position: { x: "28%", y: "47%" },
                                dragPath: { type: "line", startOffset: { x: -12, y: 0 }, endOffset: { x: 46, y: -14 } },
                                completionVar: "bagBlueCounters",
                                completionValue: 12,
                                completionTolerance: 0.4,
                            },
                        ],
                    }}
                >
                    <InlineClozeInput
                        varName="answer_counting_equivalent"
                        correctAnswer="16"
                        {...clozePropsFromDefinition(getVariableInfo("answer_counting_equivalent"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
