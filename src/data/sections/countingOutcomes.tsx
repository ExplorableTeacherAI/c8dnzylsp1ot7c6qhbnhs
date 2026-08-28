import React, { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { FormulaBlock, Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import { getVariableInfo, clozePropsFromDefinition } from "../variables";

// ── Domain model ─────────────────────────────────────────────────────────────

const TARGET_RED = 1;
const TARGET_TOTAL = 4; // the target chance: 1 red in every 4 counters
const MAX_RED = 8;
const MAX_BLUE = 16;

const RED = "#E08A72";
const BLUE = "#62CCF9";
const INK = "#64748B";
const INK_DARK = "#334155";
const ACCENT = "#62D0AD";

const fmtPercent = (v: number) => `${v.toFixed(1)}%`;

// ── Geometry ─────────────────────────────────────────────────────────────────

const VIEW_W = 560;
const VIEW_H = 360;
const BAG = { x: 250, y: 104, w: 220, h: 180 };
const COUNTER_R = 13;
const COLS = 6;
const CELL_W = 34;
const CELL_H = 33;
const GRID_X0 = 262;
const GRID_Y0 = BAG.y + BAG.h - 22;
const TRAY_RED = { x: 78, y: 168 };
const TRAY_BLUE = { x: 158, y: 168 };
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
    const red = useVar<number>("bagRedCounters", 1);
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

    const readout =
        total === 0
            ? "The bag is empty"
            : `${red} red out of ${total} counters = ${fmtPercent(share * 100)}`;

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
                <text x={360} y={44} textAnchor="middle" fontSize="13" fill={INK_DARK}>
                    Target: 1 red in every 4 counters
                </text>
                {onTarget && (
                    <text x={360} y={68} textAnchor="middle" fontSize="13" fill={ACCENT}
                        style={{ fontVariantNumeric: "tabular-nums" }}>
                        Target reached
                    </text>
                )}
            </g>

            {/* Tray of counters to drag from */}
            <g opacity={fade(false)} style={ease}>
                <text x={118} y={112} textAnchor="middle" fontSize="12" fill={INK}>
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
                <text x={TRAY_RED.x} y={214} textAnchor="middle" fontSize="12" fill={RED}>
                    Red wins
                </text>
                <text x={TRAY_BLUE.x} y={214} textAnchor="middle" fontSize="12" fill={INK}>
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
                        stroke={INK} strokeWidth="9" opacity={0.22} />
                )}
                <rect x={BAG.x} y={BAG.y} width={BAG.w} height={BAG.h} rx={12} fill="#FFFFFF"
                    stroke={INK} strokeWidth={bagLit ? 3.5 : 2} style={{ transition: "stroke-width 150ms ease-out" }} />
                <line x1={BAG.x} y1={BAG.y + 26} x2={BAG.x + BAG.w} y2={BAG.y + 26} stroke={INK}
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
                <text x={360} y={340} textAnchor="middle" fontSize="13" fill={INK_DARK}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {readout}
                </text>
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
                setVar("bagRedCounters", 1);
                setVar("bagBlueCounters", 3);
                setVar("countingHighlight", "");
            }}
            caption="Drag counters from the tray into the bag, and click a counter in the bag to take it back out. The bar shows the share of red, and the upright tick marks the target of 1 in 4."
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
        </Figure>
    );
}

// ── Section blocks ───────────────────────────────────────────────────────────

export const countingOutcomesBlocks: ReactElement[] = [
    <StackLayout key="layout-counting-heading" maxWidth="xl">
        <Block id="counting-heading" padding="md">
            <EditableH2 id="h2-counting-heading" blockId="counting-heading">
                Counting Every Outcome
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-setup" maxWidth="xl">
        <Block id="counting-setup" padding="sm">
            <EditableParagraph id="para-counting-setup" blockId="counting-setup">
                Chance begins with counting, not with guessing. Before anyone can say how likely a prize is, they need every result that could happen, and how many of those results count as a win. Drag red and blue counters from the tray into the bag until the reds make up exactly one in four, and watch the bar and the fraction move with every counter you add.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-visual" maxWidth="xl">
        <Block id="counting-visual" padding="sm" hasVisualization>
            <CounterBagFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-rule" maxWidth="xl">
        <Block id="counting-rule" padding="lg">
            <FormulaBlock latex="P(\text{win}) = \frac{\text{number of winning results}}{\text{number of possible results}}" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-insight" maxWidth="xl">
        <Block id="counting-insight" padding="sm">
            <EditableParagraph id="para-counting-insight" blockId="counting-insight">
                The chance of drawing red is a fraction: the{" "}
                <InlineLinkedHighlight
                    id="link-counting-red"
                    varName="countingHighlight"
                    highlightId="redCounters"
                    color="#E08A72"
                    bgColor="rgba(224, 138, 114, 0.2)"
                >
                    winning counters
                </InlineLinkedHighlight>
                {" "}on top, and{" "}
                <InlineLinkedHighlight
                    id="link-counting-all"
                    varName="countingHighlight"
                    highlightId="allCounters"
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.2)"
                >
                    every counter in the bag
                </InlineLinkedHighlight>
                {" "}underneath. That is why 1 red out of 4 and 4 reds out of 16 both sit on the target: the share is what counts, not the size of the pile.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-question-percent" maxWidth="xl">
        <Block id="counting-question-percent" padding="md">
            <EditableParagraph id="para-counting-question-percent" blockId="counting-question-percent">
                A prize wheel at another stall is cut into 20 equal slices, and 5 of them win. Written as a percentage, the chance of winning one spin is{" "}
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
                A bag with 1 red counter out of 4 gives exactly the same chance as a bag of 4 red counters, provided the total number of counters in it is{" "}
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
