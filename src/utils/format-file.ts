
// ----------------------------------------------------------------------

// Converte File ou Blob em base64 (incluindo data:image/...)
export function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

// ----------------------------------------------------------------------

// Remove o prefixo data:image/png;base64, e retorna só o base64 puro
export function stripBase64Header(base64: string): string {
    return base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
}

// ----------------------------------------------------------------------

// Retorna a extensão do arquivo a partir do nome (ex: 'foto.jpg' -> 'jpg')
export function getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
}

// ----------------------------------------------------------------------

// Gera um nome de arquivo único
export function generateUniqueFileName(originalName: string): string {
    const ext = getFileExtension(originalName);
    const uuid = crypto.randomUUID ? crypto.randomUUID() : Date.now();
    return `${uuid}.${ext}`;
}

// ----------------------------------------------------------------------

// Verifica se é imagem
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

// ----------------------------------------------------------------------

// Converte base64 para Blob (pode ser útil se precisar fazer o caminho inverso)
export function base64ToBlob(base64: string, mime: string = 'image/png'): Blob {
    const byteString = atob(base64.split(',')[1] || base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
}

// ----------------------------------------------------------------------

// (Opcional) Limita tamanho máximo do arquivo
export function isFileSizeValid(file: File, maxMB: number): boolean {
    return file.size <= maxMB * 1024 * 1024;
}

// ----------------------------------------------------------------------

// Dispara o download de um Blob no navegador, criando uma URL temporária e clicando em um link invisível.
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

// ----------------------------------------------------------------------

// Extrai o filename do header Content-Disposition (RFC 5987: filename*=UTF-8''... ou filename="...")
export function extractFileNameFromContentDisposition(contentDisposition: unknown): string | null {
    if (typeof contentDisposition !== 'string') return null;

    const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    if (utf8Match?.[1]) {
        const raw = utf8Match[1].trim().replace(/^"|"$/g, '');
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }

    const asciiMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
    return asciiMatch?.[1]?.trim() ?? null;
}

// ----------------------------------------------------------------------

// Detecta o MIME mais provável a partir do prefixo do base64 "puro"
export function guessImageMimeFromBase64(b64: string): string {
    if (!b64) return 'image/jpeg';
    const s = b64.slice(0, 10);
    if (s.startsWith('/9j/')) return 'image/jpeg';       // JPEG
    if (s.startsWith('iVBOR')) return 'image/png';       // PNG
    if (s.startsWith('R0lGOD')) return 'image/gif';      // GIF
    if (s.startsWith('UklGR')) return 'image/webp';      // WEBP
    return 'image/jpeg';
}

// ----------------------------------------------------------------------

// Garante uma URL válida para <img>/<Avatar> a partir de:
// - data URL já completa (data:...)
// - URL http(s) ou blob
// - base64 "puro" (sem header) -> prefixa com data:<mime>;base64,
export function ensureDataUrl(src?: string | null): string | null {
    if (!src) return null;
    if (
        src.startsWith('data:') ||
        src.startsWith('http://') ||
        src.startsWith('https://') ||
        src.startsWith('blob:')
    ) {
        return src;
    }
    // Se veio base64 puro, prefixa
    const mime = guessImageMimeFromBase64(src);
    return `data:${mime};base64,${src}`;
}