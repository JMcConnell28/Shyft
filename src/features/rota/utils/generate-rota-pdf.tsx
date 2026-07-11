import { pdf } from "@react-pdf/renderer"

import type { RotaPdfDocumentData } from "@/features/rota/types/rota-pdf"
import { RotaPdfDocument } from "@/features/rota/components/rota-pdf-document"

function generateRotaPdf(data: RotaPdfDocumentData) {
  return pdf(<RotaPdfDocument data={data} />).toBlob()
}

export { generateRotaPdf }
