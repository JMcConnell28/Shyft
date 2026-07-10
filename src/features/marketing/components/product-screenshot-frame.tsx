"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ProductScreenshotFrameProps = {
  alt: string
  src: string
  fallback?: React.ReactNode
  className?: string
  imageClassName?: string
}

function ProductScreenshotFrame({
  alt,
  src,
  fallback,
  className,
  imageClassName,
}: ProductScreenshotFrameProps) {
  const [hasImageError, setHasImageError] = React.useState(false)
  const imageRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    setHasImageError(false)
  }, [src])

  React.useEffect(() => {
    const image = imageRef.current

    if (!image || hasImageError) {
      return
    }

    if (image.complete && image.naturalWidth === 0) {
      setHasImageError(true)
    }
  }, [hasImageError, src])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[32px] border border-[#d7e3f8] bg-white p-2 shadow-[0_28px_80px_rgba(27,59,128,0.16)]",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[25px] border border-[#e4ecfb] bg-[#f7faff]">
        {hasImageError && fallback ? (
          <div data-testid="product-screenshot-media">{fallback}</div>
        ) : (
          <img
            data-testid="product-screenshot-media"
            ref={imageRef}
            src={src}
            alt={alt}
            className={cn(
              "h-[430px] w-full object-cover object-left-top sm:h-[500px] lg:h-[540px]",
              imageClassName,
            )}
            loading="eager"
            decoding="async"
            onError={() => setHasImageError(true)}
          />
        )}
      </div>
    </div>
  )
}

export { ProductScreenshotFrame }
