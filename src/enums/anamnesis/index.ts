
// ----------------------------------------------------------------------

/**
 * Tipos de pergunta suportados.
 * Os valores são os mesmos strings serializados pelo backend
 * (JsonStringEnumConverter global), evitando conversões num lookup ↔ JSON.
 */
export enum QuestionType {
    /** Resposta em texto livre */
    Text = 'Text',
    /** Resposta numérica */
    Number = 'Number',
    /** Resposta verdadeiro/falso */
    Boolean = 'Boolean',
    /** Seleção única entre opções */
    Select = 'Select',
    /** Seleção múltipla entre opções */
    MultiSelect = 'MultiSelect',
}