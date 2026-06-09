import type { FormikProps } from 'formik';

// ----------------------------------------------------------------------

export function getNestedFieldError<T extends object>(
    formik: FormikProps<any>,
    parentKey: keyof T,
    field: keyof NonNullable<T[keyof T]>
): string | undefined {
    const touchedParent = formik.touched[parentKey];
    const errorsParent = formik.errors[parentKey];

    if (touchedParent && (touchedParent as any)[field] && typeof errorsParent === 'object' && errorsParent !== null) {
        return (errorsParent as any)[field] as string | undefined;
    }

    return undefined;
}
