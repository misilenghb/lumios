import type { ChakraQuestionnaireAnswers, ChakraAssessmentScores } from '@/types/questionnaire';

// Defines which questions are "negative" for each chakra.
// A "negative" question means a higher user rating (e.g., 5 for "Completely Agree")
// indicates more blockage or imbalance, so the score needs to be reversed.
// Array index corresponds to question number within that chakra (0-3 for q1-q4).
const negativeChakraQuestionMap: Record<keyof ChakraQuestionnaireAnswers, boolean[]> = {
  root: [true, true, true, false],        // q1, q2, q3 are negative; q4 is positive
  sacral: [false, false, true, false],     // q3 is negative
  solarPlexus: [true, true, false, false], // q1, q2 are negative
  heart: [true, false, true, false],       // q1, q3 are negative
  throat: [true, false, true, true],       // q1, q3, q4 are negative (q3 "prefer listen" implies less expression here)
  thirdEye: [false, false, true, false],   // q3 is negative
  crown: [true, false, false, false],      // q1 is negative
};

/**
 * Checks if all Chakra questions (4 questions per 7 chakras = 28 questions) have been answered.
 * A valid answer is a number between 1 and 5.
 * @param rawAnswers The user's answers to the Chakra questionnaire.
 * @returns True if all answers are provided and valid, false otherwise.
 */
export function areChakraAnswersComplete(rawAnswers: ChakraQuestionnaireAnswers | undefined): rawAnswers is Required<ChakraQuestionnaireAnswers> {
  if (!rawAnswers) return false;
  const chakraKeys = Object.keys(rawAnswers) as Array<keyof ChakraQuestionnaireAnswers>;
  if (chakraKeys.length !== 7) return false; // Ensure all 7 chakras are present

  for (const chakraKey of chakraKeys) {
    const questions = rawAnswers[chakraKey];
    if (!questions || questions.length !== 4) return false; // Ensure 4 questions per chakra
    if (questions.some(ans => typeof ans !== 'number' || ans < 1 || ans > 5)) {
      return false; // Ensure each answer is a valid score
    }
  }
  return true;
}


/**
 * Calculates the average scores for each of the 7 chakras based on the 28-question questionnaire.
 *
 * @param rawAnswers - An object containing arrays of 4 scores (1-5) for each of the 7 chakras.
 * @returns An object containing the calculated average scores (1-5) for each chakra, or null if answers are incomplete.
 */
export function calculateChakraScores(rawAnswers: ChakraQuestionnaireAnswers): ChakraAssessmentScores | null {
  if (!areChakraAnswersComplete(rawAnswers)) {
    return null;
  }

  const calculatedScores: Partial<ChakraAssessmentScores> = {};

  (Object.keys(rawAnswers) as Array<keyof ChakraQuestionnaireAnswers>).forEach(chakraKey => {
    const questions = rawAnswers[chakraKey]; // Now guaranteed to be complete and valid
    const negativeMap = negativeChakraQuestionMap[chakraKey];
    let chakraTotalScore = 0;

    questions.forEach((answer, index) => {
      let questionScore = answer;
      if (answer !== undefined && negativeMap[index]) { 
        questionScore = 6 - answer; 
      }
      if (questionScore !== undefined) {
        chakraTotalScore += questionScore;
      }
    });
      
    const averageScore = chakraTotalScore / 4;
    const focusKey = `${chakraKey}ChakraFocus` as keyof ChakraAssessmentScores;
    calculatedScores[focusKey] = parseFloat(averageScore.toFixed(2)); 
  });

  return calculatedScores as ChakraAssessmentScores;
}

    