import 'dayjs/locale/es';
import 'dayjs/locale/pt-br';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import i18n from 'src/i18n';

// ----------------------------------------------------------------------

/**
 * Docs: https://day.js.org/docs/en/display/format
 * Default timezones: https://day.js.org/docs/en/timezone/set-default-timezone#docsNav
 */

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);

// ----------------------------------------------------------------------

/**
 * Tipos aceitos pelos métodos utilitários de data/hora.
 */
export type DatePickerFormat = Dayjs | Date | string | number | null | undefined;

/**
 * Padrões de formatação usados pelos métodos utilitários.
 */
export const formatPatterns = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'DD MMM YYYY', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

/**
 * Checa se o valor recebido é uma data válida.
 */
const isValidDate = (date: DatePickerFormat) =>
  date !== null && date !== undefined && dayjs(date).isValid();

export const getCurrentLocale = () => i18n.resolvedLanguage ?? i18n.language ?? 'pt-BR';

// ----------------------------------------------------------------------

/**
 * Formata uma data/hora completa para exibição amigável.
 * @param date - Data a ser formatada
 * @param template - String de formatação (opcional)
 * @returns Ex: '17 Apr 2022 12:00 am' ou 'Invalid date'
 */
export function fDateTime(date: DatePickerFormat, template?: string): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}

// ----------------------------------------------------------------------

/**
 * Formata a data/hora para pt-BR com relógio 24h.
 * @param date - Data a ser formatada
 * @returns Ex: '17/04/2022 14:00' ou string vazia para data inválida
 */
export function fDateTimePtBr(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return '';
  }

  return new Intl.DateTimeFormat(getCurrentLocale(), {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dayjs(date).toDate());
}

export const fDateTimeLocale = fDateTimePtBr;

export function fDateLocale(date: DatePickerFormat): string {
  if (!isValidDate(date)) return '';
  return new Intl.DateTimeFormat(getCurrentLocale()).format(dayjs(date).toDate());
}

// ----------------------------------------------------------------------

/**
 * Formata apenas a data para exibição amigável.
 * @param date - Data a ser formatada
 * @param template - String de formatação (opcional)
 * @returns Ex: '17 Apr 2022' ou 'Invalid date'
 */
export function fDate(date: DatePickerFormat, template?: string): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}

// ----------------------------------------------------------------------

/**
 * Retorna o tempo relativo até agora (apenas valor, ex: 'a few seconds', '2 years')
 * @param date - Data a ser comparada
 * @returns Valor textual do tempo ou 'Invalid date'
 */
export function fToNow(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const locale = i18n.resolvedLanguage === 'pt-BR'
    ? 'pt-br'
    : i18n.resolvedLanguage === 'es'
      ? 'es'
      : 'en';

  return dayjs(date).locale(locale).toNow(true);
}

// ----------------------------------------------------------------------

/**
 * Formata a data para o formato aceito por <input type="date">
 * @param date - Data a ser formatada
 * @returns Ex: '2025-08-06' ou string vazia para data inválida
 */
export function fDateInput(date: DatePickerFormat): string {
  if (!isValidDate(date)) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

// ----------------------------------------------------------------------

/**
 * Formata a data/hora para o formato aceito por <input type="datetime-local">
 * @param date - Data a ser formatada
 * @returns Ex: '2025-08-06T14:00' ou string vazia para data inválida
 */
export function fDateTimeInput(date: DatePickerFormat): string {
  if (!isValidDate(date)) return '';
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
}

// ----------------------------------------------------------------------

/**
 * Converte uma data/hora local para UTC ISO completo (recomendado para backend).
 * @param date - Data a ser convertida
 * @returns Ex: '2025-08-06T14:00:00.000Z' ou string vazia para data inválida
 */
export function fDateTimeUtcIso(date: DatePickerFormat): string {
  if (!isValidDate(date)) return '';
  return dayjs(date).utc().toISOString();
}

// ----------------------------------------------------------------------

/**
 * Retorna a data/hora atual no formato aceito por <input type="datetime-local">
 * @returns Ex: '2025-08-06T14:00'
 */
export function fNowDateTimeInput(): string {
  return dayjs().format('YYYY-MM-DDTHH:mm');
}

// ----------------------------------------------------------------------

/**
 * Retorna a data/hora atual como objeto Date (nativo do JS)
 * @returns Date atual
 */
export function fNowDate(): Date {
  return dayjs().toDate();
}

// ----------------------------------------------------------------------

/**
 * Dado uma data ('YYYY-MM-DD'), retorna a data/hora no formato datetime-local,
 * usando a hora/minuto atual do sistema.
 * @param dateOnly - Data apenas (ex: '2025-08-06')
 * @returns Ex: '2025-08-06T14:23' ou string vazia para entrada inválida
 */
export function fDateWithCurrentTime(dateOnly: string): string {
  if (!dateOnly || dateOnly.length !== 10) return '';
  const now = dayjs();
  const time = now.format('HH:mm');
  return dayjs(`${dateOnly}T${time}`).format('YYYY-MM-DDTHH:mm');
}

// ----------------------------------------------------------------------

/**
 * Monta uma string no formato aceito por <input type="datetime-local">.
 * Se receber apenas a data (YYYY-MM-DD), adiciona a hora/minuto atual.
 * Se receber data/hora completa, normaliza para o formato.
 * @param date - Data parcial ('YYYY-MM-DD') ou completa
 * @returns Ex: '2025-08-06T14:23' ou string vazia para entrada inválida
 */
export function fBuildDateTimeInput(date?: string): string {
  if (!date) return fNowDateTimeInput();
  if (date.length === 10) {
    // Só data: adiciona hora/minuto atual
    const now = dayjs();
    const time = now.format('HH:mm');
    return dayjs(`${date}T${time}`).format('YYYY-MM-DDTHH:mm');
  }
  // Data/hora: normaliza
  if (isValidDate(date)) {
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  }
  return '';
}
