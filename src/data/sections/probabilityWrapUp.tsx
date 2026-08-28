import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineHyperlink } from "@/components/atoms";

export const probabilityWrapUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapup-heading" maxWidth="xl">
        <Block id="wrapup-heading" padding="md">
            <EditableH2 id="h2-wrapup-heading" blockId="wrapup-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-insight" maxWidth="xl">
        <Block id="wrapup-insight" padding="sm">
            <EditableParagraph id="para-wrapup-insight" blockId="wrapup-insight">
                So a chance was never a feeling about a queue. It is a count: how many results win, divided by how many results there are in total. Those two numbers decide everything else, including the percentage the fair would rather you did not work out.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-real-example" maxWidth="xl">
        <Block id="wrapup-real-example" padding="sm">
            <EditableParagraph id="para-wrapup-real-example" blockId="wrapup-real-example">
                Chain enough of these events together and the numbers turn strange. Picking a perfect March Madness bracket means calling 63 games in a row, which news reports put at{" "}
                <InlineHyperlink
                    id="link-wrapup-perfect-bracket"
                    href="https://www.cbsnews.com/news/perfect-bracket-march-madness/"
                    showHint={false}
                >
                    roughly 1 in 9.2 quintillion
                </InlineHyperlink>
                , and no one has ever managed it.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-next" maxWidth="xl">
        <Block id="wrapup-next" padding="sm">
            <EditableParagraph id="para-wrapup-next" blockId="wrapup-next">
                That one fraction is why a wheel with more slices is meaner than it looks, and why "either it happens or it doesn't" hardly ever means fifty-fifty. Next comes the interesting part: events that happen one after another, such as two spins in a row, where the counting grows and the{" "}
                <InlineHyperlink
                    id="link-wrapup-two-events"
                    href="https://www.mathsisfun.com/data/probability-events-independent.html"
                >
                    chances shrink surprisingly fast
                </InlineHyperlink>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
