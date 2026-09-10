export interface AIAttachment {
  name: string;
  type: 'image' | 'pdf' | 'text' | 'file';
  size: number;
  dataUrl?: string;
  content?: string;
}

export async function processFileAttachment(file: File): Promise<AIAttachment> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const isText = file.type.startsWith('text/') || 
                 file.name.endsWith('.txt') || 
                 file.name.endsWith('.csv') || 
                 file.name.endsWith('.json') || 
                 file.name.endsWith('.md');

  if (isImage) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          type: 'image',
          size: file.size,
          dataUrl: reader.result as string,
          content: `[Imagem Anexada: ${file.name}]`
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (isText) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        resolve({
          name: file.name,
          type: 'text',
          size: file.size,
          content: text.slice(0, 8000) // cap to 8000 chars for prompt safety
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  if (isPdf) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = reader.result as string;
        // Extract readable text snippets from PDF binary stream
        const textMatch = raw.match(/[\x20-\x7E\s]{4,}/g);
        const extractedText = textMatch ? textMatch.join(' ').replace(/\s+/g, ' ').slice(0, 6000) : '';
        resolve({
          name: file.name,
          type: 'pdf',
          size: file.size,
          content: extractedText.length > 50 
            ? `Conteúdo do PDF (${file.name}):\n${extractedText}` 
            : `[Ficheiro PDF Anexado: ${file.name}]`
        });
      };
      reader.readAsBinaryString(file);
    });
  }

  return {
    name: file.name,
    type: 'file',
    size: file.size,
    content: `[Ficheiro Anexado: ${file.name}]`
  };
}
