import { pdf } from "@react-pdf/renderer"

import type { RotaPdfDocumentData } from "@/features/rota/types/rota-pdf"
import { RotaPdfDocument } from "@/features/rota/components/rota-pdf-document"

export function renderRotaPdf(data: RotaPdfDocumentData): Promise<Blob> {
  return pdf(<RotaPdfDocument data={data} />).toBlob()
}
