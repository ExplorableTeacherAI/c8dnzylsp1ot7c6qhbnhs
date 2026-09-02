import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph, InlineTooltip } from "@/components/atoms";

export const probabilityIntroBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Theoretical Probability
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                At the school fair there is a prize wheel with eight slices, and just one of them wins the big prize. Everyone waiting in the queue has a feeling about their chances. Almost everyone in that queue is wrong.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                By the end of this lesson you will be able to calculate the{" "}
                <InlineTooltip
                    id="tooltip-intro-theoretical-probability"
                    tooltip="Theoretical probability is worked out by counting outcomes rather than by running an experiment, so it can be stated before a single spin happens."
                >
                    theoretical probability
                </InlineTooltip>
                {" "}of a single event like that spin, as a fraction and as a percentage. You already know how to write 3 out of 8 and convert it to a percentage, which is nearly all the mathematics you need. The new part is deciding which outcomes belong in the numerator and which belong in the denominator.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
