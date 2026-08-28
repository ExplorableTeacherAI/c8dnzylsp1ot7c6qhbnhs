import React, { useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
} from "../variables";

// ── Domain model: two stalls, fixed wheels, variable prize slices ────────────

const STALL_A = { slices: 10, color: "#62D0AD", varName: "wheelAPrizes", id: "wheelA", label: "Stall A" };
const STALL_B = { slices: 6, color: "#AC8BF9", varName: "wheelBPrizes", id: "wheelB", label: "Stall B" };

const INK = "#64748B";
const INK_DARK = "#334155";
const PAPER = "#F1F5F9";

const fmtPercent = (v: number) => `${v.toFixed(1)}%`;

// ── Shared highlight helpers (the link between the two views) ────────────────

function useCompareHighlight() {
    const highlight = useVar<string>("compareHighlight", "");
    const setVar = useSetVar();
    return {
        highlight,
        fade: (id: string) => (highlight ? (highlight === id ? 1 : 0.35) : 1),
        lit: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("compareHighlight", id),
            onPointerLeave: () => setVar("compareHighlight", ""),
        }),
    };
}

const ease: React.CSSProperties = { transition: "opacity 150ms ease-out" };

// ── View 1: the two wheels ───────────────────────────────────────────────────

const WHEEL_VIEW = { w: 460, h: 300 };
const WHEEL_R = 78;
const CENTER_A = { x: 130, y: 148 };
const CENTER_B = { x: 330, y: 148 };

function slicePath(cx: number, cy: number, r: number, index: number, slices: number) {
    const step = (Math.PI * 2) / slices;
    const start = -Math.PI / 2 + index * step;
    const end = start + step;
    const x0 = cx + r * Math.cos(start);
    const y0 = cy + r * Math.sin(start);
    const x1 = cx + r * Math.cos(end);
    const y1 = cy + r * Math.sin(end);
    const largeArc = step > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1} Z`;
}

function StallWheel({
    stall,
    center,
}: {
    stall: typeof STALL_A;
    center: { x: number; y: number };
}) {
    const setVar = useSetVar();
    const prizes = useVar<number>(stall.varName, stall.varName === "wheelAPrizes" ? 3 : 2);
    const { fade, lit, hoverProps } = useCompareHighlight();
    const isLit = lit(stall.id);
    const share = prizes / stall.slices;

    return (
        <g opacity={fade(stall.id)} style={ease} {...hoverProps(stall.id)}>
            <text x={center.x} y={44} textAnchor="middle" fontSize="13" fill={INK_DARK}>
                {`${stall.label} — ${stall.slices} slices`}
            </text>
            {isLit && <circle cx={center.x} cy={center.y} r={WHEEL_R + 7} fill={stall.color} opacity={0.24} />}
            {Array.from({ length: stall.slices }, (_, i) => (
                <path
                    key={i}
                    d={slicePath(center.x, center.y, WHEEL_R, i, stall.slices)}
                    fill={i < prizes ? stall.color : PAPER}
                    stroke={INK}
                    strokeWidth={isLit ? 2.5 : 1.5}
                    strokeLinejoin="round"
                    style={{ cursor: "pointer", transition: "fill 150ms ease-out, stroke-width 150ms ease-out" }}
                    onClick={() => setVar(stall.varName, i < prizes ? i : i + 1)}
                />
            ))}
            <text
                x={center.x}
                y={264}
                textAnchor="middle"
                fontSize="13"
                fill={stall.color}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`${prizes} of ${stall.slices} = ${fmtPercent(share * 100)}`}
            </text>
        </g>
    );
}

function StallWheelsFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="compare-stall-wheels"
            onReset={() => {
                setVar("wheelAPrizes", 3);
                setVar("wheelBPrizes", 2);
                setVar("compareHighlight", "");
            }}
            caption="Click any slice to shade it as a prize, or click a shaded slice to take the prize away. Each wheel keeps its own number of slices."
        >
            <svg viewBox={`0 0 ${WHEEL_VIEW.w} ${WHEEL_VIEW.h}`} className="block w-full">
                <StallWheel stall={STALL_A} center={CENTER_A} />
                <StallWheel stall={STALL_B} center={CENTER_B} />
            </svg>
            <InteractionHintSequence
                hintKey="compare-wheel-slices"
                steps={[
                    {
                        gesture: "click",
                        label: "Click a slice to shade it as a prize",
                        position: { x: "28%", y: "38%" },
                    },
                ]}
            />
        </Figure>
    );
}

// ── View 2: the shared percentage line ───────────────────────────────────────

const LINE_VIEW = { w: 460, h: 300 };
const LINE = { x0: 60, x1: 400, y: 210 };
const ROW_A = 104;
const ROW_B = 164;
const LABEL_MIN = 88;
const LABEL_MAX = 372;

const percentToX = (percent: number) => LINE.x0 + (percent / 100) * (LINE.x1 - LINE.x0);

function StallMarker({ stall, rowY }: { stall: typeof STALL_A; rowY: number }) {
    const setVar = useSetVar();
    const prizes = useVar<number>(stall.varName, stall.varName === "wheelAPrizes" ? 3 : 2);
    const { fade, lit, hoverProps } = useCompareHighlight();
    const isLit = lit(stall.id);
    const [dragging, setDragging] = useState(false);
    const percent = (prizes / stall.slices) * 100;
    const x = useSpring(percentToX(percent), { stiffness: 220, damping: 22 });
    const labelX = clamp(x, LABEL_MIN, LABEL_MAX);

    const applyPointer = (event: React.PointerEvent<SVGCircleElement>) => {
        const svg = event.currentTarget.ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const svgX = ((event.clientX - rect.left) / rect.width) * LINE_VIEW.w;
        const raw = ((svgX - LINE.x0) / (LINE.x1 - LINE.x0)) * stall.slices;
        setVar(stall.varName, clamp(Math.round(raw), 0, stall.slices));
    };

    return (
        <g opacity={fade(stall.id)} style={ease} {...hoverProps(stall.id)}>
            <line x1={LINE.x0} y1={rowY} x2={LINE.x1} y2={rowY} stroke="#E2E8F0" strokeWidth="1.5"
                strokeLinecap="round" />
            <line x1={x} y1={rowY + 11} x2={x} y2={LINE.y} stroke={stall.color}
                strokeWidth={isLit ? 3.5 : 2} strokeDasharray="4 5" strokeLinecap="round"
                style={{ transition: "stroke-width 150ms ease-out" }} />
            {isLit && <circle cx={x} cy={rowY} r={17} fill={stall.color} opacity={0.26} />}
            <circle cx={x} cy={rowY} r={11} fill={stall.color} stroke="#FFFFFF" strokeWidth="2"
                filter="url(#marker-shadow)" />
            <circle
                cx={x}
                cy={rowY}
                r={24}
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
            <text x={labelX} y={rowY - 24} textAnchor="middle" fontSize="13" fill={stall.color}
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {`${stall.label} ${fmtPercent(percent)}`}
            </text>
        </g>
    );
}

function PercentLineDrawing() {
    const { highlight } = useCompareHighlight();
    const axisOpacity = highlight ? 0.35 : 1;
    return (
        <svg viewBox={`0 0 ${LINE_VIEW.w} ${LINE_VIEW.h}`} className="block w-full" style={{ touchAction: "none" }}>
            <defs>
                <filter id="marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>
            <g opacity={axisOpacity} style={ease}>
                <text x={230} y={44} textAnchor="middle" fontSize="12" fill={INK}>
                    0% means never, 100% means certain
                </text>
                <line x1={LINE.x0} y1={LINE.y} x2={LINE.x1} y2={LINE.y} stroke={INK} strokeWidth="2"
                    strokeLinecap="round" />
                {[0, 25, 50, 75, 100].map((tick) => (
                    <g key={tick}>
                        <line x1={percentToX(tick)} y1={LINE.y - 6} x2={percentToX(tick)} y2={LINE.y + 6}
                            stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
                        <text x={percentToX(tick)} y={LINE.y + 28} textAnchor="middle" fontSize="12" fill={INK}>
                            {`${tick}%`}
                        </text>
                    </g>
                ))}
            </g>
            <StallMarker stall={STALL_A} rowY={ROW_A} />
            <StallMarker stall={STALL_B} rowY={ROW_B} />
        </svg>
    );
}

function PercentLineFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="compare-percent-line"
            onReset={() => {
                setVar("wheelAPrizes", 3);
                setVar("wheelBPrizes", 2);
                setVar("compareHighlight", "");
            }}
            caption="Both stalls hang on one scale. Drag either marker along the line and the wheel beside it redraws to the nearest chance it can actually make."
        >
            <PercentLineDrawing />
            <InteractionHintSequence
                hintKey="compare-marker-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag a marker along the line",
                        position: { x: "35%", y: "35%" },
                        dragPath: { type: "line", startOffset: { x: -28, y: 0 }, endOffset: { x: 28, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Section blocks ───────────────────────────────────────────────────────────

export const whichChanceIsBiggerBlocks: ReactElement[] = [
    <StackLayout key="layout-compare-heading" maxWidth="xl">
        <Block id="compare-heading" padding="md">
            <EditableH2 id="h2-compare-heading" blockId="compare-heading">
                Which Chance Is Bigger?
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-compare-setup" maxWidth="xl">
        <Block id="compare-setup" padding="sm">
            <EditableParagraph id="para-compare-setup" blockId="compare-setup">
                Two stalls at the fair, two different wheels. Stall A wins on{" "}
                <InlineScrubbleNumber
                    varName="wheelAPrizes"
                    {...numberPropsFromDefinition(getVariableInfo("wheelAPrizes"))}
                />
                {" "}of its 10 slices, while Stall B wins on{" "}
                <InlineScrubbleNumber
                    varName="wheelBPrizes"
                    {...numberPropsFromDefinition(getVariableInfo("wheelBPrizes"))}
                />
                {" "}of its 6. Click slices to shade or unshade a prize, and watch that stall's marker slide along the percentage line.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-compare-visual" ratio="1:1" gap="lg" align="start">
        <Block id="compare-visual" padding="sm" hasVisualization>
            <StallWheelsFigure />
        </Block>
        <Block id="compare-percent-line" padding="sm" hasVisualization>
            <PercentLineFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-compare-insight" maxWidth="xl">
        <Block id="compare-insight" padding="sm">
            <EditableParagraph id="para-compare-insight" blockId="compare-insight">
                Percentages put both stalls on one scale, so the better bet is simply whichever marker sits further right.{" "}
                <InlineLinkedHighlight
                    id="link-compare-stall-a"
                    varName="compareHighlight"
                    highlightId="wheelA"
                    color="#3FA98A"
                    bgColor="rgba(98, 208, 173, 0.2)"
                >
                    Stall A
                </InlineLinkedHighlight>
                {" "}can hold fewer prizes than{" "}
                <InlineLinkedHighlight
                    id="link-compare-stall-b"
                    varName="compareHighlight"
                    highlightId="wheelB"
                    color="#8B6BE0"
                    bgColor="rgba(172, 139, 249, 0.2)"
                >
                    Stall B
                </InlineLinkedHighlight>
                {" "}and still win that race, because what you compare is the share of the slices, not the number of prizes.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-compare-question-percent" maxWidth="xl">
        <Block id="compare-question-percent" padding="md">
            <EditableParagraph id="para-compare-question-percent" blockId="compare-question-percent">A third stall arrives with a wheel of 25 slices, 4 of them winners. On the same scale, that stall sits at <InlineFeedback varName={"answer_compare_percent"} correctValue={["16%", "16", "16 %", "0.16"]} caseSensitive={false} position={"terminal"} successMessage={"— yes, 4 out of 25 is 16%, which lands well left of both of the other stalls"} failureMessage={"— not quite yet"} hint={"4 out of 25 is the same as 16 out of 100"} reviewBlockId={"compare-percent-line"} reviewLabel={"Look at the percentage line again"}><InlineClozeInput varName={"answer_compare_percent"} correctAnswer={"16% | 16 | 16 % | 0.16"} placeholder={"question"} color={"#8E90F5"} bgColor={"rgba(59, 130, 246, 0.35)"} caseSensitive={false} id={"cloze-1787882996277-40hkx"} /></InlineFeedback>.</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-compare-question-better" maxWidth="xl">
        <Block id="compare-question-better" padding="md">
            <EditableParagraph id="para-compare-question-better" blockId="compare-question-better">
                Stall A shades 5 of its 10 slices and Stall B shades 3 of its 6. The stall worth queueing at is{" "}
                <InlineFeedback
                    varName="answer_compare_better"
                    correctValue="They are equal"
                    position="terminal"
                    successMessage="— exactly, both wheels give half their slices away, so both markers land on 50%"
                    failureMessage="— have another look"
                    hint="Stall A has more prizes, but it also has more slices to share them between"
                    visualizationHint={{
                        blockId: "compare-visual",
                        hintKey: "compare-equal-chance-hint",
                        label: "Discover it yourself",
                        resetVars: { wheelAPrizes: 3, wheelBPrizes: 2, compareHighlight: "" },
                        steps: [
                            {
                                gesture: "click",
                                label: "Shade Stall A until 5 of its 10 slices win",
                                position: { x: "28%", y: "38%" },
                                completionVar: "wheelAPrizes",
                                completionValue: 5,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "click",
                                label: "Now shade Stall B until 3 of its 6 win — watch where the two markers land",
                                position: { x: "72%", y: "38%" },
                                completionVar: "wheelBPrizes",
                                completionValue: 3,
                                completionTolerance: 0.4,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_compare_better"
                        correctAnswer="They are equal"
                        options={["Stall A", "Stall B", "They are equal"]}
                        {...choicePropsFromDefinition(getVariableInfo("answer_compare_better"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
