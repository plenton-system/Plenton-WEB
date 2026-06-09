import type { AddressDto } from './../../../types/dto/address-dto';

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

const CEP_RE = /^\d{8}$/;
const cache = new Map<string, AddressDto>();
const DEFAULT_TIMEOUT_MS = 6000;

export function sanitizeCep(input: string | null | undefined): string {
  return (input ?? '').replace(/\D/g, '');
}

export function isValidCep(cep: string): boolean {
  return CEP_RE.test(cep);
}

export async function fetchAddressByCep(
  rawCep: string,
  opts?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<AddressDto | null> {
  const cep = sanitizeCep(rawCep);
  if (!isValidCep(cep)) return null;

  if (cache.has(cep)) return cache.get(cep)!;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: opts?.signal ?? controller.signal,
    });
    if (!res.ok) return null;

    const data: ViaCepResponse = await res.json();
    if (data?.erro) return null;

    const addr: AddressDto = {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };

    cache.set(cep, addr);
    return addr;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
