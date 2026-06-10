import type { Nutritionist } from "src/enums";

// ----------------------------------------------------------------------

/**
 * Retorno de um nutricionista após uma edição
 */
export interface NutritionistViewProps {

    /**
     * Identificador do nutricionista
     * @example "00000000-0000-0000-0000-000000000000"
     */
    id: string;

    /**
     * TenantId do nutricionista
     * @example "joao.silva@plenton.com.br"
     */
    tenantId: string;

    /**
     * Status do nutricionista
     * @example 1
     */
    status?: Nutritionist.Status | number | string | null;

    /**
     * Nome do nutricionista
     * @example "Maria da Silva"
     */
    name: string;

    /**
     * Telefone do nutricionista
     * @example "(11) 99999-9999"
     */
    phone: string;

    /**
     * Email do nutricionista
     * @example "maria.silva@plenton.com"
     */
    email: string;

    /**
     * Documento do nutricionista
     * @example "123.456.789-00"
     */
    document: string;

    /**
     * Conselho Regional de Nutrição do nutricionista
     * @example "12345"
     */
    crn?: string | null;

    /**
     * Data de nascimento do nutricionista
     * @example "2004-01-01"
     */
    birthDate?: string | null;

    /**
     * Foto de perfil do nutricionista
     * @example "Base64 string ou URL da imagem"
     */
    profilePhoto: string;

}
