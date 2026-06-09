import type {
    PublicOpenResponse,
    PublicAnamnesisSaveDraftRequestDto,
} from 'src/types';

import { QuestionType } from 'src/enums/anamnesis';

// ----------------------------------------------------------------------

export type PublicAnamnesisFormValues = Record<string, any>;

export function safeParseValueJson(valueJson?: string | null) {
    if (!valueJson) return undefined;

    try {
        return JSON.parse(valueJson);
    } catch {
        return undefined;
    }
}

export function asQuestionType(type: unknown): QuestionType {
    const map: Record<string, QuestionType> = {
        Text: QuestionType.Text,
        Number: QuestionType.Number,
        Boolean: QuestionType.Boolean,
        Select: QuestionType.Select,
        MultiSelect: QuestionType.MultiSelect,
    };

    return map[String(type)] ?? QuestionType.Text;
}

export function buildInitialValues(open: PublicOpenResponse): PublicAnamnesisFormValues {
    const values: PublicAnamnesisFormValues = {};

    for (const q of open.questions) {
        const questionType = asQuestionType(q.type);

        if (questionType === QuestionType.MultiSelect) {
            values[q.id] = [];
        } else if (questionType === QuestionType.Boolean) {
            values[q.id] = false;
        } else {
            values[q.id] = '';
        }
    }

    for (const answer of open.answers ?? []) {
        const parsed = safeParseValueJson(answer.valueJson);

        if (parsed !== undefined) {
            values[answer.questionId] = parsed;
        }
    }

    return values;
}

/**
 * IMPORTANTÍSSIMO:
 * Não enviar JSON.stringify('') para campos vazios,
 * porque isso vira "\"\"" e o backend pode rejeitar.
 *
 * Quando estiver sem resposta, enviar string vazia.
 */
export function toValueJson(questionType: QuestionType, value: unknown): string {
    if (value === null || value === undefined) return '';

    switch (questionType) {
        case QuestionType.Text:
        case QuestionType.Select: {
            const stringValue = String(value ?? '').trim();

            if (!stringValue) return '';

            return JSON.stringify(stringValue);
        }

        case QuestionType.Number: {
            if (value === '') return '';

            const numericValue = typeof value === 'number' ? value : Number(value);

            if (Number.isNaN(numericValue)) return '';

            return JSON.stringify(numericValue);
        }

        case QuestionType.MultiSelect: {
            const arrayValue = Array.isArray(value) ? value : [];

            if (arrayValue.length === 0) return '';

            return JSON.stringify(arrayValue);
        }

        case QuestionType.Boolean:
        default:
            return JSON.stringify(!!value);
    }
}

export function buildPayload(
    open: PublicOpenResponse,
    values: PublicAnamnesisFormValues
): PublicAnamnesisSaveDraftRequestDto {
    return {
        answers: open.questions.map((question) => ({
            questionId: question.id,
            valueJson: toValueJson(asQuestionType(question.type), values[question.id]),
        })),
    };
}