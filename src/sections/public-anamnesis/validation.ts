import type { TFunction } from 'i18next';
import type { PublicOpenResponse } from 'src/types';

import * as Yup from 'yup';

import { QuestionType } from 'src/enums/anamnesis';

import { asQuestionType } from './utils/public-anamnesis-utils';

// ----------------------------------------------------------------------

export function buildValidation(open: PublicOpenResponse, t: TFunction) {
    const shape: Record<string, any> = {};

    for (const question of open.questions) {
        const questionType = asQuestionType(question.type);

        switch (questionType) {
            case QuestionType.Text: {
                let validator = Yup.string();

                if (question.required) {
                    validator = validator.trim().required(t('publicAnamnesis.validation.required'));
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.Number: {
                let validator = Yup.number()
                    .transform((value, originalValue) =>
                        originalValue === '' || originalValue === null ? undefined : value
                    )
                    .typeError(t('publicAnamnesis.validation.numberInvalid'));

                if (question.min != null) {
                    validator = validator.min(question.min, t('publicAnamnesis.validation.min', { min: question.min }));
                }

                if (question.max != null) {
                    validator = validator.max(question.max, t('publicAnamnesis.validation.max', { max: question.max }));
                }

                if (question.required) {
                    validator = validator.required(t('publicAnamnesis.validation.required'));
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.Select: {
                let validator = Yup.string();

                if (question.required) {
                    validator = validator.required(t('publicAnamnesis.validation.required'));
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.MultiSelect: {
                let validator = Yup.array().of(Yup.string());

                if (question.required) {
                    validator = validator.min(1, t('publicAnamnesis.validation.minOne'));
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.Boolean:
            default:
                shape[question.id] = Yup.boolean();
                break;
        }
    }

    return Yup.object().shape(shape);
}