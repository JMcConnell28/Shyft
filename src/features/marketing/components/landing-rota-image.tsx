function LandingRotaImage() {
  return (
    <section data-testid="landing-rota-image" className="mt-8 lg:mt-10">
      <figure>
        <div className="overflow-hidden rounded-[30px] border border-[#dde8ff] bg-background shadow-[0_30px_80px_rgba(45,87,171,0.12)]">
          <img
            src="/brand/landing-rota-board.png"
            alt="Example RocketRota weekly staff rota with fictional team data"
            className="block h-auto w-full"
          />
        </div>
        <figcaption className="mt-3 text-center text-xs leading-5 text-[#64789e]">
          Example rota with fictional staff and business details.
        </figcaption>
      </figure>
    </section>
  )
}

export { LandingRotaImage }
