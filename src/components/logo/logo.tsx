import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = false,
  ...other
}: LogoProps) {
  const theme = useTheme();

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Plenton"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          gap: 1,
          alignItems: 'center',
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ width: 36, height: 36, flexShrink: 0 }}>
        <Box
          component="img"
          src="/assets/brand/plenton-icon.svg"
          alt="Plenton"
          sx={{ width: 1, height: 1, ...theme.applyStyles('dark', { display: 'none' }) }}
        />
        <Box
          component="img"
          src="/assets/brand/plenton-icon-dark.svg"
          alt="Plenton"
          sx={{ width: 1, height: 1, display: 'none', ...theme.applyStyles('dark', { display: 'block' }) }}
        />
      </Box>

      {!isSingle && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Plenton
        </Typography>
      )}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
