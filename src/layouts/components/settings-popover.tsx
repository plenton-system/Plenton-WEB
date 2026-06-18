import type { AnamnesisListQuery } from 'src/types/domain/anamnesis';
import type { EditSystemSettingsDto } from 'src/types/domain/system-settings';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useThemeMode, type ThemeMode } from 'src/hooks/common/use-theme-mode';

import i18n from 'src/i18n';
import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

// ----------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
      {children}
    </Typography>
  );
}

function Row({
  label,
  children,
  hint,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Typography sx={{ fontSize: 15 }}>{label}</Typography>
          <Box flexShrink={0}>{children}</Box>
        </Box>
      </Paper>
      {hint ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

export function SettingsPopover({
  open = true,
  onClose,
  data,
  loading,
  onSave,
}: {
  open?: boolean;
  onClose?: () => void;
  data?: any;
  loading?: boolean;
  onSave?: (payload: EditSystemSettingsDto) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  type SectionKey = 'general' | 'anamnese' | 'appSystemSettings' | 'preference';

  const [section, setSection] = useState<SectionKey>('general');

  const NAV: { key: SectionKey; label: string; badge?: string }[] = [
    { key: 'general', label: t('settings.sections.general') },
    { key: 'anamnese', label: t('settings.sections.anamnesis') },
    { key: 'appSystemSettings', label: t('settings.sections.application') },
    { key: 'preference', label: t('settings.sections.preference') },
  ];

  const [orderBy, setOrderBy] = useState('nome');
  const { mode, setMode, resolvedMode } = useThemeMode();
  const [autoBirthday, setAutoBirthday] = useState(false);
  const [anamneseLoading, setAnamneseLoading] = useState(false);
  const [anamnesis, setAnamnesis] = useState<{ id: string, title: string }[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<{ id: string, title: string }>();

  const [showAntrop, setShowAntrop] = useState(true);
  const [showRx, setShowRx] = useState(true);

  // --- hidratação quando chegar o backend ---
  useEffect(() => {
    if (!data) return;
    setOrderBy(data.generalDto.orderBy);
    setAutoBirthday(data.generalDto.autoSendBirthdayEmail);
    setMode(data.preferenceDto.theme);
    setShowAntrop(data.appSystemSettingsDto.showAnthropometry);
    setShowRx(data.appSystemSettingsDto.showPrescriptions);
    setDefaultTemplate({
      id: data.anamnesisDto?.defaultTemplateId ?? '',
      title: data.anamnesisDto?.name ?? ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleSave = async () => {
    const payload: EditSystemSettingsDto = {
      id: data?.id,
      userId: data?.userId,
      generalDto: { orderBy, autoSendBirthdayEmail: autoBirthday },
      anamnesisDto: { defaultTemplateId: defaultTemplate?.id || null },
      appSystemSettingsDto: { showAnthropometry: showAntrop, showPrescriptions: showRx },
      // Preserva o idioma ativo (definido no LanguagePopover) para não sobrescrevê-lo aqui.
      preferenceDto: {
        theme: mode,
        preferredLanguage:
          i18n.resolvedLanguage ?? i18n.language ?? data?.preferenceDto?.preferredLanguage ?? 'pt-BR',
      },
    };
    await onSave?.(payload);
    onClose?.();
  };

  // Busca pacientes on demand
  const handleAnamnesisFocus = async () => {
    if (anamnesis.length > 0 || anamneseLoading) return;

    setAnamneseLoading(true);
    try {
      const params: AnamnesisListQuery = {
        value: '',
        pageIndex: 0,
        pageSize: 20,
        orderByField: 'title',
        order: 'asc',
      };

      const res = await anamnesisService.getAll(params);
      setAnamnesis(res.items ?? []);
    } catch {
      setAnamnesis([]);
    } finally {
      setAnamneseLoading(false);
    }
  };

  const onChangeValue = (e: any) => {
    const id = String(e.target.value);
    const selected = anamnesis.find((x) => x.id === id);

    setDefaultTemplate({ id, title: selected?.title ?? '' });
  };

  const themeLabel = (themeMode: ThemeMode | 'light' | 'dark') =>
    t(`settings.theme.${themeMode}` as 'settings.theme.light' | 'settings.theme.dark' | 'settings.theme.system');

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 6 }}>
        {t('settings.title')}
        <IconButton
          aria-label={t('actions.close')}
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Grid container>
          {/* Navegação lateral */}
          <List dense>
            {NAV.map((it) => (
              <ListItemButton
                key={it.key}
                selected={section === it.key}
                onClick={() => setSection(it.key)}
                sx={{ borderRadius: 1.5, width: '200px' }}
              >
                <ListItemText
                  primary={it.label}
                  slotProps={{ primary: { sx: { fontSize: 14 } } }}
                />
                {it.badge && <Chip size="medium" label={it.badge} variant="outlined" />}
              </ListItemButton>
            ))}
          </List>

          {/* Conteúdo principal */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ p: 3, display: 'grid', gap: 3 }}>
              {/* Meus pacientes */}
              {section === 'general' && (
                <Box>
                  <SectionTitle>{t('settings.patients')}</SectionTitle>
                  <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
                    <TextField
                      select
                      size="small"
                      label={t('settings.defaultOrder')}
                      value={orderBy}
                      onChange={(e) => setOrderBy(String(e.target.value))}
                      sx={{ minWidth: 260 }}
                    >
                      <MenuItem value="Name">{t('settings.order.name')}</MenuItem>
                      <MenuItem value="CreatedAt">{t('settings.order.createdAt')}</MenuItem>
                      <MenuItem value="LastVisit">{t('settings.order.lastVisit')}</MenuItem>
                    </TextField>

                    <Row label={t('settings.birthdayEmail')}>
                      <Switch
                        checked={autoBirthday}
                        onChange={(e) => setAutoBirthday(e.target.checked)}
                      />
                    </Row>
                  </Box>
                </Box>
              )}
              {section === 'anamnese' && (
                <Box>
                  <SectionTitle>{t('settings.sections.anamnesis')}</SectionTitle>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <TextField
                      select
                      size="small"
                      label={t('settings.defaultTemplate')}
                      value={defaultTemplate?.id ?? ''}
                      onFocus={handleAnamnesisFocus}
                      onClick={handleAnamnesisFocus}
                      onChange={(e) => onChangeValue(e)}
                      disabled={loading}
                      sx={{ minWidth: 260 }}
                    >
                      <MenuItem value="">{t('settings.select')}</MenuItem>

                      {anamneseLoading && (
                        <MenuItem value="" disabled>
                          <CircularProgress size={18} sx={{ mr: 2 }} /> {t('settings.loading')}
                        </MenuItem>
                      )}

                      {/* se veio um defaultTemplateId do backend e ele não está no pageSize atual */}
                      {!anamnesis.some((p) => p.id === defaultTemplate?.id) && defaultTemplate?.id && (
                        <MenuItem value={defaultTemplate.id}>
                          {defaultTemplate.title || t('settings.selectedTemplate')}
                        </MenuItem>
                      )}

                      {anamnesis.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              )}
              {section === 'appSystemSettings' && (
                <Box>
                  <SectionTitle>{t('settings.appPermissions')}</SectionTitle>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <Row label={t('settings.showAnthropometry')}>
                      <Switch
                        checked={showAntrop}
                        onChange={(e) => setShowAntrop(e.target.checked)}
                      />
                    </Row>
                    <Row label={t('settings.showPrescriptions')}>
                      <Switch checked={showRx} onChange={(e) => setShowRx(e.target.checked)} />
                    </Row>
                  </Box>
                </Box>
              )}
              {section === 'preference' && (
                <Box>
                  <SectionTitle>{t('settings.sections.preference')}</SectionTitle>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <TextField
                      select
                      size="small"
                      label={t('settings.defaultTheme')}
                      value={mode.toLowerCase()}
                      onChange={(e) => setMode(e.target.value as ThemeMode)}
                      sx={{ minWidth: 260 }}
                    >
                      <MenuItem value="light">{t('settings.theme.light')}</MenuItem>
                      <MenuItem value="dark">{t('settings.theme.dark')}</MenuItem>
                      <MenuItem value="system">{t('settings.theme.system')}</MenuItem>
                    </TextField>

                    {/* opcional: mostrar o que está valendo agora */}
                    <Typography variant="caption" color="text.secondary">
                      {t('settings.effectiveMode', {
                        mode:
                          mode === 'system'
                            ? t('settings.systemMode', { mode: themeLabel(resolvedMode) })
                            : themeLabel(mode),
                      })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('actions.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
