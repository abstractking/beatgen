import * as SliderPrimitive from '@radix-ui/react-slider'
import type { ComponentPropsWithoutRef } from 'react'

export type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root>

export function Slider({ style, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        touchAction: 'none',
        ...style,
      }}
    >
      <SliderPrimitive.Track
        style={{
          position: 'relative',
          flexGrow: 1,
          background: '#242424',
          height: '6px',
          borderRadius: '999px',
        }}
      >
        <SliderPrimitive.Range
          style={{
            position: 'absolute',
            height: '100%',
            background: '#06b6d4',
            borderRadius: '999px',
          }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        style={{
          display: 'block',
          width: '16px',
          height: '16px',
          background: '#ffffff',
          borderRadius: '999px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
        }}
      />
    </SliderPrimitive.Root>
  )
}
