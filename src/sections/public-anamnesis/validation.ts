import type { PublicOpenResponse } from 'src/types';

import * as Yup from 'yup';

import { QuestionType } from 'src/enums/anamnesis';

import { asQuestionType } from './utils/public-anamnesis-utils';

// ----------------------------------------------------------------------

export function buildValidation(open: PublicOpenResponse) {
    const shape: Record<string, any> = {};

    for (const question of open.questions) {
        const questionType = asQuestionType(question.type);

        switch (questionType) {
            case QuestionType.Text: {
                let validator = Yup.string();

                if (question.required) {
                    validator = validator.trim().required('Obrigatório');
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.Number: {
                let validator = Yup.number()
                    .transform((value, originalValue) =>
                        originalValue === '' || originalValue === null ? undefined : value
                    )
                    .typeError('Informe um número válido');

                if (question.min != null) {
                    validator = validator.min(question.min, `Mínimo: ${question.min}`);
                }

                if (question.max != null) {
                    validator = validator.max(question.max, `Máximo: ${question.max}`);
                }

                if (question.required) {
                    validator = validator.required('Obrigatório');
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.Select: {
                let validator = Yup.string();

                if (question.required) {
                    validator = validator.required('Obrigatório');
                }

                shape[question.id] = validator;
                break;
            }

            case QuestionType.MultiSelect: {
                let validator = Yup.array().of(Yup.string());

                if (question.required) {
                    validator = validator.min(1, 'Selecione ao menos 1 opção');
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