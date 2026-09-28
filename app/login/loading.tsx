import { Spinner } from '@/components/ui/spinner'

export default function LoginLoading() {
  return (
    <div className="grid h-svh place-content-center">
      <Spinner className="size-8" />
    </div>
  )
}
