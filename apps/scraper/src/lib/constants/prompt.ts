import { EditImageQueuePayload } from "../../worker/types";
import { getAspectRatioInstruction } from "../enum/aspect-ratio";
import { ArticleRequest } from "../schema/article";
import { ImageRequest } from "../schema/image";
import { imagePlaceholder, imagePromptGenerator } from "../tone";

export const promptContent = (artData: ArticleRequest, toneGuideline: string) => `
Write a comprehensive, long-form article about "${artData.topic}". 

### CORE CONTENT PARAMETERS
- Topic: ${artData.topic}
- Keywords to Integrate: ${artData.keywords?.join(', ') || 'None'}
- Category: ${artData.category || 'General'}
- Tone Requirement: ${toneGuideline}

### STRUCTURAL CONSTRAINTS (MANDATORY)
1. **Paragraph Density:** Every paragraph must be substantial, containing a minimum of 400 characters. Avoid brief, choppy sentences; instead, develop complex ideas and detailed explanations to ensure depth.
2. **Heading Flow:** Never place a subheading immediately after a primary heading. You must provide at least one full paragraph of context or introduction following every heading before moving into a sub-section.
3. **List Limitation:** To maintain a sophisticated narrative flow, you are permitted a maximum of only two bulleted or numbered lists in the entire article. Use standard prose for all other points.

### VISUAL ASSETS & DATA
${(artData.imageCount || 0) > 0
    ? `Required Images: ${artData.imageCount}
${imagePlaceholder.replace('{{IMAGE_COUNT}}', (artData.imageCount || 0).toString())}
${imagePromptGenerator}`
    : 'No images or placeholders required.'}

### FINAL OUTPUT INSTRUCTION
Ensure a seamless transition between the narrative body and the JSON image prompts. Use the specified delimiters strictly. The article must feel like a continuous, expert-level deep dive rather than a quick summary.'
`.trim();

export const promptImage = (imgData: ImageRequest, toneGuideline: string) => `
        Generative Image Prompt Structure
        ---------------------------------

        [SUBJECT / CONTENT]
        ${imgData.prompt.trim()}

        [ARTISTIC STYLE & TONE]
        ${toneGuideline.trim()}

        [COMPOSITION & DIMENSIONS]
        Target Aspect Ratio: ${imgData.aspectRatio}
        Framing Guideline: ${getAspectRatioInstruction(imgData.aspectRatio)}
        Ensure the subject is framed correctly according to this ratio (e.g., don't crop heads in vertical, fill sides in horizontal).

        [OUTPUT CONSTRAINTS]
        CRITICAL: Generate exactly ONE single image frame. Do not create a grid, collage, split-screen, or multiple panels. The final output must be a singular, cohesive composition.

        [SYNTHESIS INSTRUCTIONS]
        Combine the subject content with the artistic tone and composition guidelines seamlessly.
        `.trim();

export const promptEditImage = (imgData: EditImageQueuePayload, toneGuideline: string) => `
        Image Editing & Transformation Prompt
        -------------------------------------

        [INPUT CONTEXT]
        A reference image has been provided. Your task is to modify, transform, or restyle this specific input image based strictly on the instructions below. Do not generate a random image from scratch; anchor your generation to the visual structure of the provided image.

        [USER EDITING INSTRUCTION]
        ${imgData.prompt.trim()}
        (Directly apply this instruction to the provided image. If this describes a subject, ensure the result matches the description while respecting the input image's composition.)

        [ARTISTIC STYLE & TONE APPLICATION]
        ${toneGuideline.trim()}
        (Apply this aesthetic style to the final result.)

        [COMPOSITION & FORMATTING]
        Target Aspect Ratio: ${imgData.aspectRatio || 'Maintain Original'}
        Framing Guideline: ${imgData.aspectRatio ? getAspectRatioInstruction(imgData.aspectRatio) : 'Preserve the original framing and composition.'}

        [EXECUTION CONSTRAINTS]
        1. REFERENCE PRIORITY: Use the provided image as the primary source of truth for composition and subject placement unless strictly told to move/remove them.
        2. NO COLLAGES: Generate exactly ONE single cohesive image. Do NOT create grids, split-screens, or "before and after" comparisons.
        3. SEAMLESS BLEND: Ensure the edited elements blend naturally with the unaffected parts of the image (lighting, shadows, and texture consistency).
        `.trim();