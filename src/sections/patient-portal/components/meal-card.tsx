import type { PatientMeal, PatientMealItem } from 'src/types/domain/patient-portal';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

import { MacroSummary } from './macro-summary';

function itemDescription(item: PatientMealItem) {
  return item.food?.description ?? item.portionLabel ?? '';
}

export function formatMealItemAmount(item: PatientMealItem): string {
  const portionLabel = item.portionLabel?.trim();
  if (portionLabel) return portionLabel;

  const measure = item.detailsHomemadeMeasure?.description?.trim();
  if (item.quantity != null && measure) return `${item.quantity} ${measure}`;
  if (item.quantityInGrams != null) return `${item.quantityInGrams} g`;
  if (item.quantity != null) return String(item.quantity);
  return '';
}

function MealItem({ item }: { item: PatientMealItem }) {
  const { t } = useTranslation();
  const quantity = formatMealItemAmount(item);
  const description = item.food?.description?.trim() ?? '';
  const label = [quantity, description || (!quantity ? itemDescription(item) : '')]
    .filter(Boolean)
    .join(' ');

  return (
    <Box
      component="li"
      sx={{
        py: 0.75,
        pl: 0.5,
        '&::marker': { color: 'primary.main', fontSize: '0.85em' },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        gap={2}
        alignItems="flex-start"
        sx={{ minWidth: 0 }}
      >
        <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {label}
          </Typography>
          {item.notes && (
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {item.notes}
            </Typography>
          )}
        </Box>
        {item.isOptional && <Chip label={t('patientPortal.mealPlan.optional')} size="small" />}
      </Stack>
      {!!item.equivalents?.length && (
        <Accordion disableGutters elevation={0} sx={{ mt: 1, bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">{t('patientPortal.mealPlan.equivalents')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'disc' }}>
              {item.equivalents.map((equivalent) => (
                <MealItem key={equivalent.id} item={{ ...equivalent, equivalents: null }} />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}

function SubstituteMeal({ meal }: { meal: PatientMeal }) {
  return (
    <Box>
      <Typography variant="subtitle2">{meal.name}</Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'disc' }}>
        {[...(meal.items ?? [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => (
            <MealItem key={item.id} item={item} />
          ))}
      </Box>
    </Box>
  );
}

export function MealCard({ meal }: { meal: PatientMeal }) {
  const { t } = useTranslation();
  const items = [...(meal.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <Card component="article" sx={{ minWidth: 0, maxWidth: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" gap={2} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <RestaurantMenuIcon color="primary" fontSize="small" aria-hidden="true" />
            <Typography variant="h6" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              {meal.name}
            </Typography>
          </Stack>
          {meal.time && <Typography color="text.secondary">{meal.time.slice(0, 5)}</Typography>}
        </Stack>
        {meal.description && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {meal.description}
          </Typography>
        )}
        <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5, listStyle: 'disc' }}>
          {items.map((item) => (
            <MealItem key={item.id} item={item} />
          ))}
        </Box>
        {!!meal.substitute?.length && (
          <Accordion
            disableGutters
            elevation={0}
            square
            sx={{ mt: 1, bgcolor: 'transparent', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon fontSize="small" />}
              sx={{
                px: 0,
                minHeight: 36,
                width: 'fit-content',
                '&.Mui-expanded': { minHeight: 36 },
                '& .MuiAccordionSummary-content': { my: 0.5 },
                '& .MuiAccordionSummary-content.Mui-expanded': { my: 0.5 },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <SwapHorizIcon color="primary" fontSize="small" aria-hidden="true" />
                <Typography variant="body2" fontWeight={600}>
                  {t('patientPortal.mealPlan.substitutes')}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pl: { xs: 2, sm: 3 }, pr: 0, pt: 1, pb: 0 }}>
              <Stack spacing={2}>
                {meal.substitute.map((substitute) => (
                  <SubstituteMeal key={substitute.id} meal={substitute} />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
        <MacroSummary
          values={meal.summary?.macros}
          title={t('patientPortal.mealPlan.mealSummary')}
        />
      </CardContent>
    </Card>
  );
}
