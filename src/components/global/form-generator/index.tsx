import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { 
  FieldErrors, 
  FieldValues, 
  FieldPath,
  UseFormRegister 
} from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { Textarea } from '@/components/ui/textarea'

type Props<T extends FieldValues> = {
  type?: 'text' | 'email' | 'password' | 'number'
  inputType: 'select' | 'input' | 'textarea'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  register: UseFormRegister<T>
  name: FieldPath<T>
  errors: FieldErrors<T>
  lines?: number
}

const FormGenerator = <T extends FieldValues>({
  inputType,
  options,
  label,
  placeholder,
  register,
  name,
  errors,
  type,
  lines,
}: Props<T>) => {
  switch (inputType) {
    case 'input':
      return (
        <Label
          className="flex flex-col gap-2 text-muted-foreground"
          htmlFor={`input-${label}`}
        >
          {label && label}
          <Input
            id={`input-${label}`}
            type={type}
            placeholder={placeholder}
            className="bg-transparent border-themeGray text-themeTextGray"
            {...register(name)}
          />
          <ErrorMessage
            errors={errors}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={name as any}
            render={({ message }) => (
              <p className="text-red-400 mt-2">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </Label>
      )
    case 'select':
      return (
        <Label
          htmlFor={`select-${label}`}
          className="flex flex-col gap-2"
        >
          {label && label}
          <select
            id={`select-${label}`}
            className="w-full bg-transparent border-[1px] p-3 rounded-lg"
            {...register(name)}
          >
            {options?.length &&
              options.map((option) => (
                <option
                  value={option.value}
                  key={option.id}
                  className="dark:bg-muted"
                >
                  {option.label}
                </option>
              ))}
          </select>
          <ErrorMessage
            errors={errors}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={name as any}
            render={({ message }) => (
              <p className="text-red-400 mt-2">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </Label>
      )

    case 'textarea':
      return (
        <Label
          className="flex flex-col gap-2"
          htmlFor={`input-${label}`}
        >
          {label && label}
          <Textarea
            className="bg-transparent border-themeGray text-themeTextGray"
            id={`input-${label}`}
            placeholder={placeholder}
            rows={lines}
            {...register(name)}
          />
          <ErrorMessage
            errors={errors}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={name as any}
            render={({ message }) => (
              <p className="text-red-400 mt-2">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </Label>
      )

    default:
      break
  }
}

export default FormGenerator