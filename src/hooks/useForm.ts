import { useMemo, useState } from 'react';
import type { FormErrors, FormValidator } from '@/types';

interface UseFormOptions<T> {
  initialValues: T;
  validator?: FormValidator<T>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validator,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const validate = (nextValues: T) => {
    const nextErrors = validator ? validator(nextValues) : {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setValues((current) => {
      const nextValues = { ...current, [field]: value };
      if (errors[field]) {
        validate(nextValues);
      }
      return nextValues;
    });
  };

  const handleSubmit = async () => {
    const nextValues = values;
    if (!validate(nextValues) || !onSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(nextValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = (nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    setValues,
    setErrors,
    handleChange,
    handleSubmit,
    reset,
    validate: () => validate(values),
  };
}

