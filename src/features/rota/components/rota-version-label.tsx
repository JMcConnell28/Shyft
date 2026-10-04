function RotaVersionLabel({
  version,
  publishedVersion,
}: {
  version: number
  publishedVersion: number
}) {
  return (
    <span className="text-[10px] font-semibold text-[#61709a]">
      Latest saved v{version}
      {publishedVersion > 0 && publishedVersion !== version
        ? ` · Published v${publishedVersion}`
        : ""}
    </span>
  )
}

export { RotaVersionLabel }
