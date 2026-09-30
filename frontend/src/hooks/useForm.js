/**
 * useForm — minimal controlled-form hook with validation.
 *
 * Manages values, touched state, and errors. A `validators` map provides one
 * validator per field returning an error string or empty string when valid.
 */
import { useState, useCallback } from 'react';

/**
 * @param {object} initialValues - Initial field values keyed by name.
 * @param {Object<string, Function>} [validators] - field -> (value, values) => errorString.
 * @returns {object} Form state and handlers.
 */
export const useForm = (initialValues, validators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate a single field and store any error message.
  const runValidator = useCallback(
    (name, value, allValues) => {
      const validate = validators[name];
      const message = validate ? validate(value, allValues) : '';
      setErrors((prev) => ({ ...prev, [name]: message }));
      return message;
    },
    [validators]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        // Re-validate the changed field against the latest values.
        if (touched[name]) runValidator(name, value, next);
        return next;
      });
    },
    [touched, runValidator]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      runValidator(name, value, values);
    },
    [values, runValidator]
  );

  /**
   * Validate every field. Returns true when the whole form is valid.
   */
  const validateAll = useCallback(() => {
    const newErrors = {};
    let valid = true;
    Object.keys(validators).forEach((name) => {
      const message = validators[name](values[name], values);
      newErrors[name] = message;
      if (message) valid = false;
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce((acc, name) => ({ ...acc, [name]: true }), {})
    );
    return valid;
  }, [validators, values]);

  return { values, errors, touched, handleChange, handleBlur, validateAll, setValues };
};
