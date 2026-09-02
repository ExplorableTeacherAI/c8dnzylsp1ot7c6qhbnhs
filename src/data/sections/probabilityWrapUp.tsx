import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineHyperlink } from "@/components/atoms";

export const probabilityWrapUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapup-heading" maxWidth="xl">
        <Block id="wrapup-heading" padding="md">
            <EditableH2 id="h2-wrapup-heading" blockId="wrapup-heading">
                Probability as a Ratio
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-insight" maxWidth="xl">
        <Block id="wrapup-insight" padding="sm">
            <EditableParagraph id="para-wrapup-insight" blockId="wrapup-insight">
                So a probability was never a feeling about a queue. It is a ratio: the number of favourable outcomes divided by the size of the sample space. Those two counts decide everything else, including the percentage the fair would rather you did not work out.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-real-example" maxWidth="xl">
        <Block id="wrapup-real-example" padding="sm">
            <EditableParagraph id="para-wrapup-real-example" blockId="wrapup-real-example">
                Chain enough independent events together and the numbers turn strange. Picking a perfect March Madness bracket means calling 63 games in a row, which news reports put at{" "}
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
                That one ratio is why a wheel with more slices is meaner than it looks, and why two outcomes are hardly ever equally likely. Next come independent events, such as two spins in a row, where the sample space grows and the{" "}
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
