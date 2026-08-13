import { it, expect, describe } from 'vitest';

import es from './es/common.json';
import enUS from './en-US/common.json';
import ptBR from './pt-BR/common.json';

type TranslationTree = { [key: string]: string | TranslationTree };

function keys(value: TranslationTree, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'string' ? path : keys(child, path);
  });
}

describe('patient portal locales', () => {
  it('keeps Portuguese, English and Spanish portal keys aligned', () => {
    const portugueseKeys = keys(ptBR.patientPortal).sort();
    expect(keys(enUS.patientPortal).sort()).toEqual(portugueseKeys);
    expect(keys(es.patientPortal).sort()).toEqual(portugueseKeys);
  });

  it('does not introduce billing or subscription actions into patient navigation', () => {
    expect(Object.keys(ptBR.patientPortal.nav)).toEqual(['home', 'mealPlan', 'account']);
    expect(JSON.stringify(ptBR.patientPortal.nav)).not.toMatch(/billing|subscription|assinatura/i);
  });
});
