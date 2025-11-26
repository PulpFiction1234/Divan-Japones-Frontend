export default function NewsletterSection() {
  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter__content">
        <p className="newsletter__title">Diván Japonés es nuestro dojo de ideas y afectos en Providencia, Santiago de Chile.</p>
        <p>
          Cada boletín comparte apuntes de cine, manga y literatura japonesa atravesados por el psicoanálisis. También
          anunciamos ciclos de cine, encuentros de té y convocatorias de escritura colectiva.
        </p>
      </div>
      <form className="newsletter__form">
        <label className="newsletter__label" htmlFor="newsletter-email">
          Suscríbete para recibir nuestra agenda.
        </label>
        <div className="newsletter__controls">
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="Escribe tu correo..."
            aria-required="true"
          />
          <button type="submit">Unirme</button>
        </div>
      </form>
    </section>
  )
}
