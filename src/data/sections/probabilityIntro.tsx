import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const probabilityIntroBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Probability
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
                By the end of this lesson you will be able to work out the exact chance of a spin like that, written as a fraction. You already know how to write 3 out of 8 and turn it into a percentage, which is nearly all the maths you need. The new part is deciding what belongs on top and what belongs underneath.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
