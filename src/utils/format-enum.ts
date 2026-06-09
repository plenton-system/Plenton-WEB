
// ----------------------------------------------------------------------

/**
 * Converte valor numérico ou string de um enum para sua chave string.
 * Exemplo: Status[0] => "Scheduled"
 */
export function enumValueToString(
    enumType: Record<string | number, string | number>,
    value?: string | number
): string {
    if (typeof value === 'number' && enumType[value] !== undefined) {
        return String(enumType[value]);
    }
    if (typeof value === 'string' && Object.values(enumType).includes(value)) {
        return value;
    }
    // Retorna primeiro valor string do enum como fallback
    const firstString = Object.values(enumType).find(v => typeof v === 'string');
    return (firstString as string) ?? '';
}

// ----------------------------------------------------------------------

/**
 * Converte a chave string de um enum para o valor numérico correspondente.
 * Exemplo: "Scheduled" => 0
 */
export function enumStringToValue(
    enumType: Record<string | number, string | number>,
    key?: string
): number | undefined {
    if (!key) return undefined;
    // Busca a chave numérica correspondente ao valor string
    for (const [enumKey, enumValue] of Object.entries(enumType)) {
        if (enumValue === key && !isNaN(Number(enumKey))) {
            return Number(enumKey);
        }
    }
    // Fallback para enums reversos
    const num = (enumType as any)[key!];
    if (typeof num === "number") return num;
    return undefined;
}
