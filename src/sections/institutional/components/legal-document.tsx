import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type LegalBlock =
  | { type: 'paragraph'; text: ReactNode }
  | { type: 'bullets'; items: ReactNode[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

type Props = {
  lastUpdated: string;
  disclaimer?: ReactNode;
  intro?: ReactNode;
  sections: LegalSection[];
};

export function LegalDocument({ lastUpdated, disclaimer, intro, sections }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {t('institutional.common.lastUpdated', { date: lastUpdated })}
      </Typography>

      {disclaimer && (
        <Alert severity="info" variant="outlined">
          {disclaimer}
        </Alert>
      )}

      {intro && (
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
          {intro}
        </Typography>
      )}

      <Box
        component="nav"
        aria-label={t('institutional.common.summaryLabel')}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          {t('institutional.common.content')}
        </Typography>
        <Stack component="ol" spacing={1} sx={{ m: 0, pl: 2.5 }}>
          {sections.map((section) => (
            <Box component="li" key={section.id}>
              <Link
                href={`#${section.id}`}
                underline="hover"
                sx={{
                  color: 'text.secondary',
                  fontSize: 14,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {section.heading}
              </Link>
            </Box>
          ))}
        </Stack>
      </Box>

      <Stack spacing={4} divider={<Divider flexItem />}>
        {sections.map((section, sectionIndex) => (
          <Stack key={section.id} id={section.id} spacing={2} sx={{ scrollMarginTop: 88 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {sectionIndex + 1}. {section.heading}
            </Typography>

            {section.blocks.map((block, blockIndex) =>
              block.type === 'paragraph' ? (
                <Typography
                  key={blockIndex}
                  variant="body1"
                  sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                >
                  {block.text}
                </Typography>
              ) : (
                <Stack key={blockIndex} component="ul" spacing={1} sx={{ m: 0, pl: 3 }}>
                  {block.items.map((item, itemIndex) => (
                    <Typography
                      key={itemIndex}
                      component="li"
                      variant="body1"
                      sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              )
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
