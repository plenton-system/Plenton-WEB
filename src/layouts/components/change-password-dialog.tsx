import type { ChangePasswordDto } from 'src/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// ----------------------------------------------------------------------

export type ChangePasswordFormValues = ChangePasswordDto;

type Feedback = {
  type: 'success' | 'error';
  message: string;
};

type ChangePasswordDialogProps = {
  open: boolean;
  loading: boolean;
  feedback: Feedback | null;
  onClose: () => void;
  onSubmit: (values: ChangePasswordFormValues) => Promise<boolean>;
};

export function ChangePasswordDialog({
  open,
  loading,
  feedback,
  onClose,
  onSubmit,
}: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const validationSchema = useMemo(
    () =>
      Yup.object({
        currentPassword: Yup.string().required(t('profile.password.currentRequired')),
        newPassword: Yup.string()
          .min(6, t('profile.password.newMin'))
          .required(t('profile.password.newRequired')),
        confirmNewPassword: Yup.string()
          .oneOf([Yup.ref('newPassword')], t('profile.password.match'))
          .required(t('profile.password.confirmRequired')),
      }),
    [t]
  );

  const formik = useFormik<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    enableReinitialize: false,
    validationSchema,
    onSubmit: async (values, helpers) => {
      const ok = await onSubmit(values);
      if (ok) helpers.resetForm();
      helpers.setSubmitting(false);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('profile.password.title')}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

            <TextField
              type="password"
              label={t('profile.password.current')}
              name="currentPassword"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
              helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              disabled={loading || formik.isSubmitting}
            />

            <TextField
              type="password"
              label={t('profile.password.new')}
              name="newPassword"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword}
              disabled={loading || formik.isSubmitting}
            />

            <TextField
              type="password"
              label={t('profile.password.confirm')}
              name="confirmNewPassword"
              value={formik.values.confirmNewPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmNewPassword && Boolean(formik.errors.confirmNewPassword)}
              helperText={formik.touched.confirmNewPassword && formik.errors.confirmNewPassword}
              disabled={loading || formik.isSubmitting}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading || formik.isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={() => void formik.submitForm()}
            variant="contained"
            disabled={loading || formik.isSubmitting}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
