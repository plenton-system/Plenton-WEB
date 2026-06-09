import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

// ----------------------------------------------------------------------

const FAQS = [
  {
    q: 'Preciso instalar algum programa?',
    a: 'Não. O Plenton funciona 100% no navegador, em qualquer dispositivo com internet.',
  },
  {
    q: 'Como funciona o período gratuito?',
    a: 'Você tem 14 dias para usar a plataforma sem custo e sem precisar cadastrar cartão de crédito. Ao fim do período, você decide se quer assinar.',
  },
  {
    q: 'Meus dados e os dos meus pacientes ficam seguros?',
    a: 'Sim. Todos os dados são isolados por conta (multi-tenant), criptografados em trânsito e armazenados em infraestrutura segura.',
  },
  {
    q: 'O paciente também tem acesso?',
    a: 'O paciente pode receber links públicos (como anamneses) sem precisar de conta. Em breve teremos também um aplicativo dedicado para o paciente.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Não há fidelidade. O cancelamento é feito direto pela plataforma e mantém o acesso até o fim do ciclo já pago.',
  },
  {
    q: 'O Plenton tem o catálogo TACO?',
    a: 'Sim, a base oficial brasileira de composição de alimentos já vem importada e disponível para uso nos planos alimentares.',
  },
];

export function LandingFaq() {
  const theme = useTheme();

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 8, md: 12 },
        scrollMarginTop: 80,
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
            FAQ
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            Perguntas frequentes
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {FAQS.map((item) => (
            <Accordion
              key={item.q}
              disableGutters
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { borderColor: 'primary.main' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{ px: 2.5, py: 1 }}
              >
                <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
