import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                Two stalls at the fair, two different wheels. One has 3 winning slices out of 10, the other has 2 out of 6. The fractions look nothing alike, so which queue is worth joining?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <Block key="compare-visual" id="compare-visual">
        <VisualOptionCards
            blockId="compare-visual"
            cards={[
                {
                    id: "two-stalls",
                    title: "Two fair wheels side by side, each with its own chance bar underneath",
                    looks: "Imagine two wheels standing on one bench, each with its own number of slices and its own shaded prize slices. Under each wheel a bar fills to show its chance, and both bars are drawn on the same scale so the longer one is obvious at a glance.",
                    manipulate: "Shade or unshade prize slices on either wheel and watch its bar move against the other",
                    reveals: "The wheel with more prizes is not always the better bet, because what counts is the share of slices, not how many prizes there are.",
                    paradigm: "comparison",
                    recommended: true,
                },
                {
                    id: "beat-the-target",
                    title: "One wheel and a fixed target line drawn across its chance bar",
                    looks: "Imagine a wheel with a bar beneath it and a target line drawn across that bar at one third. Students change how many slices the wheel is cut into and how many of them win, and the bar slides toward or past the target as they work.",
                    manipulate: "Change the number of slices and prize slices to push the bar past the target line",
                    reveals: "Many different wheels give the same chance, and adding prizes only helps if the total number of slices does not grow faster.",
                    paradigm: "goal",
                },
                {
                    id: "percent-line-pair",
                    title: "Two wheels hanging their chances on one shared 0% to 100% line",
                    looks: "Imagine two small wheels above a long line marked from 0% to 100%, each wheel with a marker hanging below it on that line. Shading slices on a wheel slides its marker along the line, and dragging a marker instead redraws the wheel above it.",
                    manipulate: "Shade slices on either wheel, or drag either marker along the percentage line",
                    reveals: "Once both chances are percentages they sit on one scale, and the bigger chance is simply the one further to the right.",
                    paradigm: "inversion",
                    secondView: {
                        shows: "A shared percentage line carrying a marker for each wheel",
                        role: "constraining",
                        syncedBy: "each wheel's prize and slice counts, plus a shared hover highlight linking a wheel to its marker",
                    },
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-compare-insight" maxWidth="xl">
        <Block id="compare-insight" padding="sm">
            <EditableParagraph id="para-compare-insight" blockId="compare-insight">
                Turning both chances into percentages settles the argument: 3 out of 10 is 30%, while 2 out of 6 is about 33%. The stall with fewer prizes is the better bet, which is exactly why the fraction, and not the number of prizes, is what you compare.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
