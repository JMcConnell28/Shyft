function LandingRotaImage() {
  return (
    <section data-testid="landing-rota-image" className="mt-8 lg:mt-10">
      <div className="overflow-hidden rounded-[30px] border border-[#dde8ff] bg-background shadow-[0_30px_80px_rgba(45,87,171,0.12)]">
        <img
          src="/brand/landing-rota-board.png"
          alt="RocketRota weekly staff rota for Harbour House"
          className="block h-auto w-full"
        />
      </div>
    </section>
  )
}

export { LandingRotaImage }
