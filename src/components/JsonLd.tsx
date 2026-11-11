export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Se escapa "<" para que el contenido no pueda cerrar la etiqueta <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
