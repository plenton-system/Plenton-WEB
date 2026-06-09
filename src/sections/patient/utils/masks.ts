// ----------------------------------------------------------------------

export function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCpfCnpjLive(value: string): string {
  let v = (value || '').replace(/\D/g, '');

  if (v.length <= 11) {
    // CPF progressivo
    v = v.replace(/^(\d{3})(\d)/, '$1.$2');
    v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
    return v;
  } else {
    // limita a 14 para CNPJ
    v = v.slice(0, 14);

    // CNPJ progressivo
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
    return v;
  }
}

/**
 * Aplica a máscara (XX) XXXX-XXXX ou (XX) XXXXX-XXXX a uma string de telefone.
 *
 * @param value A string de entrada (apenas números ou formatada).
 * @returns A string formatada.
 */
export const maskPhoneNumber = (value: string): string => {
  if (!value) {
    return '';
  }

  // 1. Remove tudo que não for dígito
  const cleanValue = value.replace(/\D/g, '');

  // 2. Limita o tamanho para no máximo 11 dígitos (DD + 9 dígitos)
  const limitedValue = cleanValue.substring(0, 11);

  // 3. Aplica a máscara base: (XX)
  let formattedValue = `(${limitedValue.substring(0, 2)}`;

  // Se tem pelo menos 3 dígitos (já tem o DDD)
  if (limitedValue.length > 2) {
    // 4. Se for celular (11 dígitos no total), usa o formato (XX) XXXXX-
    if (limitedValue.length === 11) {
      formattedValue += `) ${limitedValue.substring(2, 7)}`;
      
      // 5. Adiciona o hífen se tiver mais que 7 dígitos no total (o 9º do celular)
      if (limitedValue.length > 7) {
        formattedValue += `-${limitedValue.substring(7, 11)}`;
      }
    }
    // 6. Se for telefone fixo ou 8 dígitos, usa o formato (XX) XXXX-
    else {
      formattedValue += `) ${limitedValue.substring(2, 6)}`;
      
      // 7. Adiciona o hífen se tiver mais que 6 dígitos no total
      if (limitedValue.length > 6) {
        formattedValue += `-${limitedValue.substring(6, 10)}`;
      }
    }
  } else {
      // Se não tem nem o DDD completo, fecha o parêntese para manter o formato parcial
      formattedValue += `)`;
  }

  return formattedValue;
};