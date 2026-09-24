function StepIntro({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto mb-3 max-w-[540px] text-center">
      <h1 className="font-heading text-2xl font-extrabold tracking-[-0.05em] text-[#111f45] sm:text-[1.85rem]">
        {title}
      </h1>
      <p className="mt-1 text-xs leading-5 text-[#56698d] sm:text-sm">
        {description}
      </p>
    </div>
  )
}

export { StepIntro }
