import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";

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

    <StackLayout key="layout-wrapup-next" maxWidth="xl">
        <Block id="wrapup-next" padding="sm">
            <EditableParagraph id="para-wrapup-next" blockId="wrapup-next">
                That one fraction is why a wheel with more slices is meaner than it looks, and why "either it happens or it doesn't" hardly ever means fifty-fifty. Next comes the interesting part: events that happen one after another, such as two spins in a row, where the counting grows and the chances shrink surprisingly fast.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
