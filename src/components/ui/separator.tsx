import * as SeparatorPrimitive from '@radix-ui/react-separator'
import type { ComponentPropsWithoutRef } from 'react'

export type SeparatorProps = ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>

export function Separator(props: SeparatorProps) {
  return <SeparatorPrimitive.Root {...props} />
}
