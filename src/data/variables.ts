/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // SECTION — Counting Every Outcome (counter bag)
    // ========================================
    bagRedCounters: {
        defaultValue: 1,
        type: 'number',
        label: 'Red counters in the bag',
        description: 'How many red (winning) counters the student has dropped into the bag',
        min: 0,
        max: 8,
        step: 1,
        color: '#E08A72',
    },
    bagBlueCounters: {
        defaultValue: 3,
        type: 'number',
        label: 'Blue counters in the bag',
        description: 'How many blue (losing) counters the student has dropped into the bag',
        min: 0,
        max: 16,
        step: 1,
        color: '#62CCF9',
    },
    countingHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Counter bag highlight',
        description: 'Active highlight for the counter bag figure (redCounters | allCounters)',
        color: '#E08A72',
        bgColor: 'rgba(224, 138, 114, 0.2)',
    },
    answer_counting_percent: {
        defaultValue: '',
        type: 'text',
        label: 'Wheel chance as a percentage',
        description: 'Student answer: 5 winning slices out of 20 written as a percentage',
        placeholder: '???',
        correctAnswer: ['25%', '25', '25 %', '0.25'],
        color: '#8E90F5',
    },
    // ========================================
    // SECTION — Not Everything Is 50-50 (predict the split, then spin)
    // ========================================
    fiftyPrediction: {
        defaultValue: 50,
        type: 'number',
        label: 'Predicted win share',
        description: 'Where the student splits the bar between winning and losing, as a percentage',
        unit: '%',
        min: 0,
        max: 100,
        step: 1,
        color: '#AC8BF9',
    },
    fiftySpins: {
        defaultValue: 0,
        type: 'number',
        label: 'Spins completed',
        description: 'How many times the ten-slice wheel has been spun',
        min: 0,
        max: 200,
        step: 1,
        color: '#62D0AD',
    },
    fiftyWins: {
        defaultValue: 0,
        type: 'number',
        label: 'Wins so far',
        description: 'How many of the completed spins landed on the single winning slice',
        min: 0,
        max: 200,
        step: 1,
        color: '#62D0AD',
    },
    fiftySpinning: {
        defaultValue: false,
        type: 'boolean',
        label: 'Wheel spinning',
        description: 'Whether the ten-slice wheel is spinning repeatedly',
    },
    fiftyHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Fifty-fifty figure highlight',
        description: 'Active highlight for the predict-the-split figure (prizeSlice | guessBar | realBar)',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answer_fifty_red: {
        defaultValue: '',
        type: 'select',
        label: 'Chance of drawing the single red counter',
        description: 'Student answer: 1 red counter among 9 blue',
        placeholder: '???',
        options: ['50%', '10%', '1%'],
        correctAnswer: '10%',
        color: '#8E90F5',
    },
    answer_fifty_spinner: {
        defaultValue: '',
        type: 'text',
        label: 'Chance on an eight-section spinner',
        description: 'Student answer: 2 winning sections out of 8 written as a percentage',
        placeholder: '???',
        correctAnswer: ['25%', '25', '25 %', '0.25'],
        color: '#8E90F5',
    },
    // ========================================
    // SECTION — Which Chance Is Bigger? (two stalls on one percentage line)
    // ========================================
    wheelAPrizes: {
        defaultValue: 3,
        type: 'number',
        label: 'Stall A winning slices',
        description: 'How many of Stall A\'s 10 slices are prize slices',
        min: 0,
        max: 10,
        step: 1,
        color: '#62D0AD',
    },
    wheelBPrizes: {
        defaultValue: 2,
        type: 'number',
        label: 'Stall B winning slices',
        description: 'How many of Stall B\'s 6 slices are prize slices',
        min: 0,
        max: 6,
        step: 1,
        color: '#AC8BF9',
    },
    compareHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Stall comparison highlight',
        description: 'Active highlight linking a stall wheel to its marker on the percentage line (wheelA | wheelB)',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answer_compare_percent: {
        defaultValue: '',
        type: 'text',
        label: 'Chance of 4 out of 25 as a percentage',
        description: 'Student answer: 4 winning slices out of 25 written as a percentage',
        placeholder: '???',
        correctAnswer: ['16%', '16', '16 %', '0.16'],
        color: '#8E90F5',
    },
    answer_compare_better: {
        defaultValue: '',
        type: 'select',
        label: 'Better stall',
        description: 'Student answer: which stall gives the better chance when A shades 5 of 10 and B shades 3 of 6',
        placeholder: '???',
        options: ['Stall A', 'Stall B', 'They are equal'],
        correctAnswer: 'They are equal',
        color: '#8E90F5',
    },
    answer_counting_equivalent: {
        defaultValue: '',
        type: 'text',
        label: 'Equivalent bag total',
        description: 'Student answer: total counters needed so that 4 reds give the same chance as 1 in 4',
        placeholder: '???',
        correctAnswer: '16',
        color: '#8E90F5',
    },

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
