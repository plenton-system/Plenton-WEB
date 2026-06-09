import { fetchAddressByCep } from '../cep';

/**
 * Hook personalizado para buscar dados de endereço a partir de um CEP.
 * @param setFieldValue Função do Formik para definir o valor de um campo.
 */
export const useCepLookup = (
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
) => {
  const lookupCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep?.replace(/\D/g, '');

    if (cleanCep && cleanCep.length === 8) {
      try {
        const viacep = await fetchAddressByCep(cep).catch(() => null);
        
        if (viacep) {
          // Mapeia os campos do Viacep para os campos do Formik
          setFieldValue('addressDto.street', viacep.street || '');
          setFieldValue('addressDto.neighborhood', viacep.neighborhood || '');
          setFieldValue('addressDto.city', viacep.city || '');
          setFieldValue('addressDto.state', viacep.state || '');
        }
        return viacep; // Opcional: retorna os dados para manipulação adicional, se necessário.
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
    return null;
  };

  return { lookupCep };
};
