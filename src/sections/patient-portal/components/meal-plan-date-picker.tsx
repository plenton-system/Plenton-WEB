import type { MouseEvent } from 'react';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarTodayOutlined';

type Props = { value: string; valid: boolean; onChange: (value: string) => void };

const parseDate = (value: string) => new Date(`${value}T12:00:00`);
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function MealPlanDatePicker({ value, valid, onChange }: Props) {
  const { t, i18n } = useTranslation();
  const selected = useMemo(() => (valid ? parseDate(value) : new Date()), [valid, value]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [month, setMonth] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1)
  );
  const today = dateKey(new Date());
  const label = useMemo(() => {
    const formatted = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      day: '2-digit',
      month: 'short',
    })
      .format(selected)
      .replace('.', '');
    return value === today ? t('patientPortal.mealPlan.todayDate', { date: formatted }) : formatted;
  }, [i18n.resolvedLanguage, selected, t, today, value]);
  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);
  const weekdays = useMemo(() => {
    const sunday = new Date(2026, 7, 2);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + index);
      return new Intl.DateTimeFormat(i18n.resolvedLanguage, { weekday: 'narrow' }).format(date);
    });
  }, [i18n.resolvedLanguage]);
  const shiftDay = (amount: number) => {
    const date = new Date(selected);
    date.setDate(date.getDate() + amount);
    onChange(dateKey(date));
  };
  const open = (event: MouseEvent<HTMLElement>) => {
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setAnchor(event.currentTarget);
  };
  const choose = (date: Date) => {
    onChange(dateKey(date));
    setAnchor(null);
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          display: 'grid',
          gridTemplateColumns: '40px minmax(144px, 1fr) 40px',
          alignItems: 'center',
          alignSelf: { xs: 'stretch', sm: 'center' },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: '100%',
          minWidth: { sm: 240 },
          p: 0.25,
          borderRadius: 999,
          bgcolor: 'background.neutral',
        }}
      >
        <IconButton
          size="small"
          aria-label={t('patientPortal.mealPlan.previousDay')}
          onClick={() => shiftDay(-1)}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <ButtonBase
          aria-label={t('patientPortal.mealPlan.openCalendar')}
          onClick={open}
          sx={{ justifyContent: 'center', gap: 1, minHeight: 40, borderRadius: 999 }}
        >
          <CalendarTodayIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2">{label}</Typography>
        </ButtonBase>
        <IconButton
          size="small"
          aria-label={t('patientPortal.mealPlan.nextDay')}
          onClick={() => shiftDay(1)}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Paper>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              position: 'fixed',
              mt: 1,
              p: 2,
              width: 320,
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: 2.5,
            },
          },
        }}
      >
        <Box role="dialog" aria-label={t('patientPortal.mealPlan.calendar')}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 40px',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <IconButton
              aria-label={t('patientPortal.mealPlan.previousMonth')}
              onClick={() =>
                setMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
              }
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="subtitle1" textAlign="center" sx={{ textTransform: 'capitalize' }}>
              {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                month: 'long',
                year: 'numeric',
              }).format(month)}
            </Typography>
            <IconButton
              aria-label={t('patientPortal.mealPlan.nextMonth')}
              onClick={() =>
                setMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
              }
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {weekdays.map((day, index) => (
              <Typography
                key={`${day}-${index}`}
                variant="caption"
                color="text.secondary"
                textAlign="center"
                fontWeight={700}
              >
                {day}
              </Typography>
            ))}
            {days.map((date) => {
              const key = dateKey(date);
              const active = key === value;
              return (
                <ButtonBase
                  key={key}
                  aria-label={new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                    dateStyle: 'full',
                  }).format(date)}
                  aria-pressed={active}
                  onClick={() => choose(date)}
                  sx={{
                    width: 36,
                    height: 36,
                    mx: 'auto',
                    borderRadius: '50%',
                    color: date.getMonth() === month.getMonth() ? 'text.primary' : 'text.disabled',
                    bgcolor: active ? 'primary.main' : 'transparent',
                    fontWeight: key === today || active ? 700 : 400,
                    outline: key === today && !active ? 1 : 0,
                    outlineColor: 'primary.main',
                    '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                  }}
                >
                  {date.getDate()}
                </ButtonBase>
              );
            })}
          </Box>
          <Button fullWidth size="small" sx={{ mt: 1.5 }} onClick={() => choose(new Date())}>
            {t('patientPortal.mealPlan.today')}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
