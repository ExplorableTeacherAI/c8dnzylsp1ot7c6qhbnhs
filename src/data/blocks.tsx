import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

import { probabilityIntroBlocks } from "./sections/probabilityIntro";
import { countingOutcomesBlocks } from "./sections/countingOutcomes";
import { notFiftyFiftyBlocks } from "./sections/notFiftyFifty";
import { whichChanceIsBiggerBlocks } from "./sections/whichChanceIsBigger";
import { probabilityWrapUpBlocks } from "./sections/probabilityWrapUp";

export const blocks: ReactElement[] = [
    ...probabilityIntroBlocks,
    ...countingOutcomesBlocks,
    ...notFiftyFiftyBlocks,
    ...whichChanceIsBiggerBlocks,
    ...probabilityWrapUpBlocks,
];
