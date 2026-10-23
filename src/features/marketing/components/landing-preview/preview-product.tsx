export function PreviewProduct() {
  return (
    <section
      id="product"
      className="preview-product"
      aria-label="See the RocketRota rota planner"
    >
      <figure>
        <div className="preview-product-frame">
          <img
            src="/brand/landing-rota-board.png"
            alt="RocketRota weekly rota planner showing shifts across seven days, organised by team. All staff and business details are fictional."
            width="1530"
            height="792"
            decoding="async"
          />
        </div>
        <figcaption>
          Example rota with fictional staff and business details.
        </figcaption>
      </figure>
    </section>
  )
}
