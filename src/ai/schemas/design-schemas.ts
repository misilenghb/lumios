
import { z } from 'zod';

export const CompositionalAestheticsSchema = z.object({
    style: z.string().optional().describe('The arrangement style of the design components, e.g., symmetrical, asymmetrical.'),
    overallStructure: z.string().optional().describe('The overall physical structure of the jewelry piece, e.g., single strand, multi-strand, pendant focus.'),
    beadworkDensity: z.string().optional().describe('The density of the beadwork, e.g., compact or spaced out.'),
    focalPoint: z.string().optional().describe('What part of the design is emphasized as the focal point, e.g., central stone or an asymmetrical accent.')
});

export const ColorSystemSchema = z.object({
    mainHue: z.string().optional().describe('The dominant color tone or family for the design, e.g., warm tones, cool tones, earthy tones.'),
    colorHarmony: z.string().optional().describe('The harmony between colors, e.g., similar or contrasting.'),
    colorProgression: z.string().optional().describe('How colors are arranged or transition, e.g., in a gradient or in blocks.')
});

export const DesignSuggestionsInputSchema = z.object({
  designCategory: z
    .string()
    .describe('The category of the design, e.g., bracelet, necklace.'),
  overallDesignStyle: z
    .string()
    .describe('The overall style of the design, e.g., minimalist, bohemian, cyberpunk.'),
  imageStyle: z
    .string()
    .optional()
    .describe('The desired artistic style for the design image preview, e.g., colored pencil, oil painting, photo.'),
  mainStones: z
    .string()
    .describe('A description of the main stones used in the design, including type, shape, clarity, surface treatment, selected inclusions, and optionally color if specified per stone. Example: Rose Quartz (Shape: Round, Clarity: Transparent, Treatment: Polished, Inclusions: Rutile, Bubbles); Amethyst (Shape: Oval, ...). Overall color direction is primarily influenced by the colorSystem. Per-stone color is a secondary detail.'),
  compositionalAesthetics: CompositionalAestheticsSchema.describe('Describes the principles of arrangement and visual composition.'),
  colorSystem: ColorSystemSchema.describe('Defines the overall color palette, harmony, and transitions for the design, complementing individual stone colors if specified.'),
  accessories: z
    .string()
    .optional()
    .describe('A description of the accessories used in the design, like spacer beads, styling components, charms.'),
  photographySettings: z
    .string()
    .optional()
    .describe('The desired photography settings for showcasing the design, including resolution, lighting, background, etc.'),
  userIntent: z
    .string()
    .optional()
    .describe('The intended use or purpose of the design, e.g., personal talisman, fashion statement.'),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response (en for English, zh for Chinese). Defaults to English if not provided.')
});

export type DesignSuggestionsInput = z.infer<typeof DesignSuggestionsInputSchema>;

export const DesignSchemeSchema = z.object({
  schemeTitle: z.string().describe('The title or name of this specific design scheme (e.g., "Scheme 1: Lunar Glow", "方案一：月华流光"). This title itself should be concise and act as a heading for the scheme.'),
  mainStoneDescription: z.string().describe('Detailed description of the main stone(s) for this scheme, their role, and characteristics. Use \\n\\n for paragraphs.'),
  auxiliaryStonesDescription: z.string().optional().describe('Description of any auxiliary stones for this scheme and their purpose. Use \\n\\n for paragraphs if needed.'),
  chainOrStructureDescription: z.string().optional().describe('Suggestions for the chain or overall structure of the piece for this scheme. Use \\n\\n for paragraphs if needed.'),
  otherDetails: z.string().optional().describe('Any other relevant details or unique features for this specific scheme. Use \\n\\n for paragraphs if needed.')
});
export type DesignScheme = z.infer<typeof DesignSchemeSchema>;

export const DesignSuggestionsOutputSchema = z.object({
  personalizedIntroduction: z.string().optional().describe("A brief, personalized introductory sentence based on the user's selections. E.g., 'Based on your preferences for a [Main Crystal Type] [Design Category] design...'. Use \\n\\n for paragraphs. Ensure translation to the requested language."),
  designConcept: z.string().describe('A paragraph describing the core theme or idea behind the overall design suggestions. This should be a general introduction to the design approach. Use \\n\\n for new paragraphs. Ensure this text is directly usable for display and translated to the requested language.'),
  designSchemes: z.array(DesignSchemeSchema)
    .min(1).max(3)
    .describe('An array of 1 to 3 distinct design schemes. Each scheme should provide a complete set of suggestions for a jewelry piece.'),
  accessorySuggestions: z.string().describe('General suggestions for accessories that complement the designs (e.g., metal types, earring backs, clasp styles). Format as a paragraph or bulleted list using standard hyphens (-) or asterisks (*) for bullets. Use \\n\\n for new paragraphs or between distinct list items. Ensure this text is directly usable for display and translated to the requested language.'),
  photographySettingSuggestions: z.string().describe('General suggestions for photography settings to showcase the designed jewelry (e.g., background, lighting, angles). Format as a paragraph or bulleted list using standard hyphens (-) or asterisks (*) for bullets. Use \\n\\n for new paragraphs or between distinct list items. Ensure this text is directly usable for display and translated to the requested language.'),
  concludingRemarks: z.string().optional().describe('A polite concluding sentence or brief paragraph for the overall suggestions. Use \\n\\n for paragraphs. Ensure translation to the requested language.')
});
export type DesignSuggestionsOutput = z.infer<typeof DesignSuggestionsOutputSchema>;
