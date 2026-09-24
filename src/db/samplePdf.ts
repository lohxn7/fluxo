// Gera um PDF minimo e valido em runtime, para servir de anexo de exemplo no seed.
export function buildSamplePdf(title: string): Blob {
  const text = title.replace(/[()\\]/g, ' ')
  const objects: string[] = []
  objects.push('<< /Type /Catalog /Pages 2 0 R >>')
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  objects.push(
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>'
  )
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  const stream = `BT /F1 22 Tf 72 700 Td (${text}) Tj ET\nBT /F1 12 Tf 72 670 Td (Documento de exemplo gerado pelo Fluxo) Tj ET`
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]
  objects.forEach((obj, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}
