import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

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
                Chance begins with counting, not with guessing. Before anyone can say how likely the big prize is, they have to know every single result the wheel could land on, and how many of those results count as a win. So how many results are there, and how many of them win?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <Block key="counting-visual" id="counting-visual">
        <VisualOptionCards
            blockId="counting-visual"
            cards={[
                {
                    id: "build-the-wheel",
                    title: "A prize wheel students build slice by slice, with the winning slices shaded",
                    looks: "Imagine an empty circle next to a small pile of identical slices. Every slice students add divides the wheel more finely, and tapping a slice shades it as a prize slice, while a fraction under the wheel counts the shaded slices over the total.",
                    manipulate: "Add or remove slices, and tap slices to turn them into prize slices",
                    reveals: "The chance is simply the shaded count over the total count, and it moves the moment either number changes.",
                    paradigm: "constructivist",
                    recommended: true,
                },
                {
                    id: "wheel-and-outcome-row",
                    title: "A prize wheel beside a row showing every result it can land on",
                    looks: "Imagine a wheel of coloured slices on the left, with a row of small squares beside it, one square for each slice the wheel has. Dragging the wheel's pointer lights up the square belonging to the slice it points at, and the winning squares stay marked.",
                    manipulate: "Drag the pointer around the wheel and watch which square in the row lights up",
                    reveals: "Every spin lands on exactly one result from a fixed list, and the winners are a countable part of that list.",
                    paradigm: "comparison",
                    secondView: {
                        shows: "The full list of possible results as a row of squares, with the winning ones marked",
                        role: "complementary",
                        syncedBy: "the pointer angle and the prize-slice set, plus a shared hover highlight linking each slice to its square",
                    },
                },
                {
                    id: "counter-bag-target",
                    title: "A bag students fill with red and blue counters to hit a target chance",
                    looks: "Imagine an open bag with a target written above it, such as one in four, and a tray of red and blue counters beside it. Counters students drop in stack up inside the bag, and the fraction printed on the bag updates with every counter added.",
                    manipulate: "Drop red and blue counters into the bag until the fraction matches the target chance",
                    reveals: "Very different bags can give exactly the same chance, because only the share of red counters matters, not how many there are.",
                    paradigm: "goal",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-counting-rule" maxWidth="xl">
        <Block id="counting-rule" padding="lg">
            <FormulaBlock latex="P(\text{win}) = \frac{\text{number of winning results}}{\text{number of possible results}}" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-counting-worked-example" maxWidth="xl">
        <Block id="counting-worked-example" padding="sm">
            <EditableParagraph id="para-counting-worked-example" blockId="counting-worked-example">
                Once every result is listed, the chance of an event is a fraction: winning results on top, all possible results underneath. On a fair wheel of eight equal slices with one prize slice, that is 1 out of 8, which is 0.125, or 12.5%.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
