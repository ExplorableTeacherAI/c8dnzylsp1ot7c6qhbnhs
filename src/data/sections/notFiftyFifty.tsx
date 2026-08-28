import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const notFiftyFiftyBlocks: ReactElement[] = [
    <StackLayout key="layout-fifty-heading" maxWidth="xl">
        <Block id="fifty-heading" padding="md">
            <EditableH2 id="h2-fifty-heading" blockId="fifty-heading">
                Not Everything Is 50-50
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fifty-setup" maxWidth="xl">
        <Block id="fifty-setup" padding="sm">
            <EditableParagraph id="para-fifty-setup" blockId="fifty-setup">
                Ask someone at the fair whether they will win, and you often hear the same answer: either you win or you don't, so it must be fifty-fifty. That reasoning would turn every question in the world into a coin flip. Two outcomes is not the same thing as two equal chances.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <Block key="fifty-visual" id="fifty-visual">
        <VisualOptionCards
            blockId="fifty-visual"
            cards={[
                {
                    id: "predict-the-split",
                    title: "A ten-slice wheel with one winner, above a bar students split themselves",
                    looks: "Imagine a wheel of ten slices where only one wins, and beneath it a single long bar with a divider students can slide, one side marked win and the other marked lose. After the wheel is spun many times, the real split fills in as a second stripe under their guess.",
                    manipulate: "Slide the divider to where they think the win and lose chances sit, then set the wheel spinning",
                    reveals: "Two outcomes almost never means two equal chances, and the real split sits nowhere near the middle.",
                    targetsMisconception: "Students think anything either happens or it does not, so every chance is 50-50",
                    paradigm: "prediction",
                    recommended: true,
                },
                {
                    id: "coin-versus-wheel",
                    title: "A coin and a ten-slice wheel side by side, each with its own chance bar",
                    looks: "Imagine a coin on the left and a wheel of ten slices on the right, each with a bar beneath showing how much of it counts as a win. The coin's bar sits exactly halfway, while the wheel's bar grows a step at a time as more of its slices are shaded.",
                    manipulate: "Shade winning slices on the wheel until its bar lines up with the coin's halfway bar",
                    reveals: "A wheel is only fifty-fifty when exactly half of its slices win, which takes five of the ten.",
                    paradigm: "comparison",
                },
                {
                    id: "set-the-chance-first",
                    title: "A chance bar students set first, with the wheel rebuilding itself to match",
                    looks: "Imagine an empty wheel sitting above a bar marked from no chance at all to certain. Wherever students drag the marker on that bar, the wheel redraws itself with just enough winning slices to match, and the fraction and percentage appear beside it.",
                    manipulate: "Drag the marker along the chance bar and watch the wheel rebuild to match",
                    reveals: "Every chance between impossible and certain matches a real split of slices, and only one point on the whole bar is truly fifty-fifty.",
                    paradigm: "inversion",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-fifty-insight" maxWidth="xl">
        <Block id="fifty-insight" padding="sm">
            <EditableParagraph id="para-fifty-insight" blockId="fifty-insight">
                Equal chances need equal shares of the outcomes. A win and a loss are only fifty-fifty when exactly half of the possible results are wins, and most wheels at most fairs are nowhere near half.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
