import type { FormikProps } from 'formik';
import type { PublicOpenResponse } from 'src/types';

import { useTranslation } from 'react-i18next';

import {
    Box,
    Select,
    Checkbox,
    MenuItem,
    TextField,
    Typography,
    FormControl,
    FormHelperText,
    FormControlLabel,
} from '@mui/material';

import { QuestionType } from 'src/enums/anamnesis';

import {
    asQuestionType
} from '../../utils/public-anamnesis-utils';

import type {
    PublicAnamnesisFormValues
} from '../../utils/public-anamnesis-utils';

// ----------------------------------------------------------------------

type QuestionItem = PublicOpenResponse['questions'][number];

type Props = {
    question: QuestionItem;
    formik: FormikProps<PublicAnamnesisFormValues>;
    readOnly: boolean;
};

export function PublicAnamnesisQuestion({
    question,
    formik,
    readOnly,
}: Props) {
    const { t } = useTranslation();
    const questionType = asQuestionType(question.type);
    const fieldName = String(question.id);

    const fieldValue = formik.values[fieldName];
    const fieldTouched = (formik.touched as Record<string, any>)[fieldName];
    const fieldError = (formik.errors as Record<string, any>)[fieldName];

    const showError = !!(fieldTouched && fieldError);
    const errorText = showError ? String(fieldError) : undefined;

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={600}>
                {question.label}
                {question.required && (
                    <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                        *
                    </Typography>
                )}
            </Typography>

            {!!question.helpText && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {question.helpText}
                </Typography>
            )}

            <Box sx={{ mt: 1 }}>
                {questionType === QuestionType.Text && (
                    <TextField
                        fullWidth
                        size="small"
                        name={fieldName}
                        value={fieldValue ?? ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={readOnly}
                        error={showError}
                        helperText={errorText}
                    />
                )}

                {questionType === QuestionType.Number && (
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        name={fieldName}
                        value={fieldValue ?? ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={readOnly}
                        error={showError}
                        helperText={errorText}
                        inputProps={{
                            min: question.min ?? undefined,
                            max: question.max ?? undefined,
                        }}
                    />
                )}

                {questionType === QuestionType.Boolean && (
                    <>
                        <FormControlLabel
                            sx={{ m: 0 }}
                            control={(
                                <Checkbox
                                    size="small"
                                    checked={!!fieldValue}
                                    onChange={(event) => {
                                        formik.setFieldValue(fieldName, event.target.checked);
                                    }}
                                    onBlur={formik.handleBlur}
                                    disabled={readOnly}
                                />
                            )}
                            label={t('common.yes')}
                        />

                        {showError && (
                            <FormHelperText error>{errorText}</FormHelperText>
                        )}
                    </>
                )}

                {questionType === QuestionType.Select && (
                    <FormControl fullWidth size="small" error={showError} disabled={readOnly}>
                        <Select
                            displayEmpty
                            notched={false}
                            name={fieldName}
                            value={fieldValue ?? ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            {question.options
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((option) => (
                                    <MenuItem key={option.id} value={option.text}>
                                        {option.text}
                                    </MenuItem>
                                ))}
                        </Select>

                        {showError && <FormHelperText>{errorText}</FormHelperText>}
                    </FormControl>
                )}

                {questionType === QuestionType.MultiSelect && (
                    <FormControl fullWidth size="small" error={showError} disabled={readOnly}>
                        <Select
                            multiple
                            displayEmpty
                            notched={false}
                            name={fieldName}
                            value={fieldValue ?? []}
                            onChange={(event) => {
                                formik.setFieldValue(fieldName, event.target.value);
                            }}
                            onBlur={formik.handleBlur}
                            renderValue={(selected) => (selected as string[]).join(', ')}
                        >
                            {question.options
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((option) => {
                                    const selectedValues = (fieldValue ?? []) as string[];
                                    const checked = selectedValues.includes(option.text);

                                    return (
                                        <MenuItem key={option.id} value={option.text}>
                                            <Checkbox size="small" checked={checked} />
                                            {option.text}
                                        </MenuItem>
                                    );
                                })}
                        </Select>

                        {showError && <FormHelperText>{errorText}</FormHelperText>}
                    </FormControl>
                )}
            </Box>
        </Box>
    );
}