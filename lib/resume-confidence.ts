export type ParsedField<T> = {
  value: T;
  confidence: number;
  rawText?: string;
};

export interface ResumeImportReport {
  name: ParsedField<string>;
  phone: ParsedField<string>;
  email: ParsedField<string>;
  educationCount: ParsedField<number>;
  projectsCount: ParsedField<number>;
  experienceCount: ParsedField<number>;
  lowConfidenceFields: string[];
}

function clampScore(score: number) {
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

export function makeParsedField<T>(value: T, confidence: number, rawText?: string): ParsedField<T> {
  return {
    value,
    confidence: clampScore(confidence),
    rawText
  };
}

export function summarizeLowConfidence(fields: Array<{ label: string; confidence: number; hasValue: boolean }>) {
  return fields
    .filter((field) => field.hasValue && field.confidence < 0.65)
    .map((field) => `${field.label}(${Math.round(field.confidence * 100)}%)`);
}
