import type { ClinicalDocument, ClinicalDocumentType } from 'src/types';
import type { WorkspaceClinicalDocumentKind } from 'src/hooks/workspace/use-workspace-clinical-documents';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  useWorkspaceClinicalDocuments,
} from 'src/hooks/workspace/use-workspace-clinical-documents';

import { fDateTimeLocale } from 'src/utils/format-time';

import { RowActionsMenu } from 'src/components/table/row-actions-menu';

// ----------------------------------------------------------------------

type Props = {
  patientId?: string;
  kind: WorkspaceClinicalDocumentKind;
};

type EditorState = {
  id?: string;
  title: string;
  content: string;
  type: ClinicalDocumentType;
};

const DEFAULT_EXAM_TYPE: ClinicalDocumentType = 'ExamRequest';
const DEFAULT_PRESCRIPTION_TYPE: Extract<ClinicalDocumentType, 'Medication' | 'Compounded'> = 'Medication';

const createEmptyEditor = (type: ClinicalDocumentType): EditorState => ({
  type,
  title: '',
  content: '',
});

const toEditorState = (document: ClinicalDocument): EditorState => ({
  id: document.id,
  type: document.type,
  title: document.title,
  content: document.content,
});

// ----------------------------------------------------------------------

export function WorkspaceClinicalDocumentTab({ kind, patientId }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentType = kind === 'exams' ? DEFAULT_EXAM_TYPE : DEFAULT_PRESCRIPTION_TYPE;
  const [editor, setEditor] = useState<EditorState>(() => createEmptyEditor(currentType));

  const {
    error,
    items,
    loading,
    success,
    mutating,
    validation,
    setError,
    setSuccess,
    setSelected,
    setValidation,
    saveDocument,
  } = useWorkspaceClinicalDocuments({
    kind,
    search,
    patientId,
  });

  useEffect(() => {
    if (!dialogOpen) {
      setValidation({});
      setEditor(createEmptyEditor(currentType));
    }
  }, [currentType, dialogOpen, setValidation]);

  const isEditing = Boolean(editor.id);
  const pageTitle = kind === 'exams'
    ? t('workspace.clinicalDocuments.exams.title')
    : t('workspace.clinicalDocuments.prescriptions.title');
  const emptyText = kind === 'exams'
    ? t('workspace.clinicalDocuments.exams.empty')
    : t('workspace.clinicalDocuments.prescriptions.empty');
  const searchPlaceholder = kind === 'exams'
    ? t('workspace.clinicalDocuments.exams.search')
    : t('workspace.clinicalDocuments.prescriptions.search');
  const dialogTitle = kind === 'exams'
    ? t(
        isEditing
          ? 'workspace.clinicalDocuments.exams.editTitle'
          : 'workspace.clinicalDocuments.exams.newTitle'
      )
    : t(
        isEditing
          ? 'workspace.clinicalDocuments.prescriptions.editTitle'
          : 'workspace.clinicalDocuments.prescriptions.newTitle'
      );

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const dateA = a.updatedAt ?? a.createdAt ?? '';
        const dateB = b.updatedAt ?? b.createdAt ?? '';
        return dateB.localeCompare(dateA);
      }),
    [items]
  );

  const canUsePatientActions = Boolean(patientId);

  const updateEditor = (patch: Partial<EditorState>) => {
    setValidation({});
    setEditor((current) => ({ ...current, ...patch }));
  };

  const handleOpenNew = () => {
    setSelected(null);
    setValidation({});
    setEditor(createEmptyEditor(currentType));
    setDialogOpen(true);
  };

  const handleOpenEdit = (document: ClinicalDocument) => {
    setSelected(document);
    setValidation({});
    setEditor(toEditorState(document));
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (mutating) return;

    setDialogOpen(false);
    setSelected(null);
    setValidation({});
  };

  const handleSave = async () => {
    const saved = await saveDocument(editor);
    if (saved) {
      setDialogOpen(false);
    }
  };

  const handlePrint = (document: ClinicalDocument) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${document.title || t('workspace.clinicalDocuments.untitled')}</title>
          <style>
            body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
            h1 { font-size: 22px; margin: 0 0 24px; }
            .content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${document.title || t('workspace.clinicalDocuments.untitled')}</h1>
          <div class="content">${document.content}</div>
          <script>
            window.onload = function () {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (value?: string | null) => (value ? fDateTimeLocale(value) || '-' : '-');

  const renderList = () => {
    if (loading) {
      return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 3 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            {t('common.loading')}
          </Typography>
        </Stack>
      );
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('workspace.clinicalDocuments.columns.title')}</TableCell>
            <TableCell>{t('workspace.clinicalDocuments.columns.type')}</TableCell>
            <TableCell>{t('workspace.clinicalDocuments.columns.updatedAt')}</TableCell>
            <TableCell align="center">{t('workspace.clinicalDocuments.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ minWidth: 240 }}>
                <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                  {item.title || t('workspace.clinicalDocuments.untitled')}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip size="small" variant="outlined" label={t(`workspace.clinicalDocuments.types.${item.type}`)} />
              </TableCell>
              <TableCell>{formatDate(item.updatedAt ?? item.createdAt)}</TableCell>
              <TableCell align="center">
                <RowActionsMenu
                  menuWidth={160}
                  actions={[
                    {
                      label: t('actions.edit'),
                      icon: 'solar:pen-bold',
                      disabled: mutating,
                      onClick: () => handleOpenEdit(item),
                    },
                    {
                      label: t('workspace.clinicalDocuments.actions.print'),
                      icon: 'solar:file-download-bold',
                      disabled: mutating,
                      onClick: () => handlePrint(item),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}

          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  {emptyText}
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6">{pageTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('workspace.clinicalDocuments.subtitle')}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!canUsePatientActions}
            onClick={handleOpenNew}
          >
            {t('actions.new')}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!canUsePatientActions && (
          <Alert severity="warning">{t('workspace.clinicalDocuments.validation.patient')}</Alert>
        )}

        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              value={search}
              placeholder={searchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
            />

            {renderList()}
          </Stack>
        </Card>
      </Stack>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('workspace.clinicalDocuments.fields.title')}
              value={editor.title}
              disabled={mutating}
              error={Boolean(validation.title)}
              helperText={validation.title}
              onChange={(event) => updateEditor({ title: event.target.value })}
            />

            {kind === 'prescriptions' && (
              <ToggleButtonGroup
                exclusive
                size="small"
                value={editor.type}
                disabled={mutating}
                onChange={(_, value: ClinicalDocumentType | null) => {
                  if (value === 'Medication' || value === 'Compounded') {
                    updateEditor({ type: value });
                  }
                }}
              >
                <ToggleButton value="Medication">
                  {t('workspace.clinicalDocuments.types.Medication')}
                </ToggleButton>
                <ToggleButton value="Compounded">
                  {t('workspace.clinicalDocuments.types.Compounded')}
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {validation.type && <Alert severity="warning">{validation.type}</Alert>}
            {validation.patientId && <Alert severity="warning">{validation.patientId}</Alert>}

            <TextField
              fullWidth
              multiline
              minRows={10}
              label={t('workspace.clinicalDocuments.fields.content')}
              value={editor.content}
              disabled={mutating}
              error={Boolean(validation.content)}
              helperText={validation.content}
              onChange={(event) => updateEditor({ content: event.target.value })}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={mutating}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={mutating}
            onClick={handleSave}
          >
            {mutating ? t('workspace.clinicalDocuments.actions.saving') : t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3500}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {success ? (
          <Alert severity="success" variant="filled" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
            {success}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
