import { useQueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

import { loginUserAction, userErrors, userKeys } from '../../shared'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { cn } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'

const LoginSchema = z.object({
  // UNCOMMENT
  // email: z.email('Invalid email format'),
  email: z.string().min(1, 'Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

type LoginSchemaT = z.input<typeof LoginSchema>

const defaultValues: LoginSchemaT = {
  email: '',
  password: '',
}

type LoginFormProps = {
  onSwitchForm: React.Dispatch<React.SetStateAction<boolean>>
} & React.ComponentProps<'div'>

export function LoginForm({
  className,
  onSwitchForm,
  ...props
}: LoginFormProps) {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      const { email, password } = LoginSchema.parse(value)

      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const result = await toast
        .promise(loginUserAction(formData), {
          loading: 'Logging in...',
        })
        .unwrap()

      if (result.success) {
        toast.success('Welcome back!', { duration: 1200 })
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        queryClient.setQueryData(userKeys.current(), result.user)
        redirect('/')
      } else {
        toast.error('Login failed', {
          description: result.errors.code
            ? userErrors[result.errors.code].client
            : 'Please try again',
          duration: 3000,
        })
      }
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={e => e.preventDefault()}>
            <FieldGroup>
              <form.AppField name="email">
                {field => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="example@email.com"
                    data-required
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {field => (
                  <field.TextField
                    label="Password"
                    type="password"
                    data-required
                  />
                )}
              </form.AppField>

              <Field>
                <form.AppForm>
                  <form.SubscribeButton form="login-form" label="Login" />
                </form.AppForm>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => onSwitchForm(prev => !prev)}
                  >
                    Sign up
                  </Button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
