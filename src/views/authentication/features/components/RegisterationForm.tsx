import { useQueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'

import { registerUserAction, userErrors, userKeys } from '../../shared'

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

const RegisterSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters'),
  // UNCOMMENT
  // email: z.email('Invalid email format'),
  email: z.string().min(1, 'Invalid email format'),
  // UNCOMMENT
  // password: z.string().min(6, 'Password must be at least 6 characters'),
  password: z.string().min(1, 'Password must be at least 1 characters'),
})

type RegisterSchemaT = z.input<typeof RegisterSchema>

const defaultValues: RegisterSchemaT = {
  username: '',
  email: '',
  password: '',
}

type RegistrationFormProps = {
  onSwitchForm: React.Dispatch<React.SetStateAction<boolean>>
} & React.ComponentProps<'div'>

export function RegistrationForm({
  className,
  onSwitchForm,
  ...props
}: RegistrationFormProps) {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: RegisterSchema,
    },
    onSubmit: async ({ value }) => {
      const { username, email, password } = RegisterSchema.parse(value)

      const formData = new FormData()
      formData.append('username', username)
      formData.append('email', email)
      formData.append('password', password)

      const result = await toast
        .promise(registerUserAction(formData), {
          loading: 'Creating account...',
        })
        .unwrap()

      if (result.success) {
        toast.success('Account created!', { duration: 1200 })
        queryClient.setQueryData(userKeys.current(), result.user)
        redirect('/')
      } else {
        toast.error('Registration failed', {
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
          <CardTitle>Register a new account</CardTitle>
          <CardDescription>
            Fill out the form with the required fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={e => e.preventDefault()}>
            <FieldGroup>
              <form.AppField name="username">
                {field => (
                  <field.TextField
                    label="Username"
                    placeholder="johndoe"
                    data-required
                  />
                )}
              </form.AppField>

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
                  <form.SubscribeButton form="register-form" label="Register" />
                </form.AppForm>
                <Button variant="outline" type="button">
                  Register with Google
                </Button>
                <FieldDescription className="text-center">
                  Do you have an account?{' '}
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => onSwitchForm(prev => !prev)}
                  >
                    Sign In
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
