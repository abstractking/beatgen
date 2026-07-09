import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type { ComponentPropsWithoutRef } from 'react'

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>

export function Checkbox(props: CheckboxProps) {
  return <CheckboxPrimitive.Root {...props} />
}
