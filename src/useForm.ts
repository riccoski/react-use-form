import { useCallback, useEffect, useMemo, useReducer } from "react";
import isEqual from "lodash/isEqual";
import set from "lodash/set";

interface IUseForm {
  initialValues?: any;
  onReset?: any;
  onSubmit: any;
  validate?: any;
  validationSchema?: any;
}

enum ActionType {
  RESET = "RESET",
  SET_ERRORS = "SET_ERRORS",
  SET_VALUE = "SET_VALUE"
}

interface IState {
  errors: any;
  values: any;
}

interface IAction {
  type: ActionType;
  payload?: any;
}

function useForm({
  initialValues = {},
  onReset,
  onSubmit,
  validate,
  validationSchema
}: IUseForm) {
  const initialState = {
    errors: {},
    isValid: false,
    values: initialValues
  };

  function reducer(state: IState, { payload, type }: IAction) {
    switch (type) {
      case "RESET":
        return { ...initialState };
      case "SET_ERRORS":
        return {
          ...state,
          errors: { ...payload }
        };
      case "SET_VALUE":
        return {
          ...state,
          values: set(
            {
              ...state.values
            },
            payload.name,
            payload.value
          )
        };
      default:
        return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  const isDirty = useMemo(() => !isEqual(initialValues, state.values), [
    initialValues,
    state.values
  ]);

  const isValid = useMemo(() => !Object.keys(state.errors).length, [
    state.errors
  ]);

  const schemaValidation = useCallback(
    async (values: any) => {
      let payload = {};

      return validationSchema
        .validate(values, { abortEarly: false })
        .then(() => Promise.resolve(payload))
        .catch((err: any) => {
          if (err.name === "ValidationError") {
            if (!err.inner.length) {
              set(payload, [err.path], err.message);
            }
            err.inner.forEach((error: any) => {
              payload = set(payload, [error.path], error.message);
            });

            return Promise.resolve(payload);
          }

          return Promise.reject(err);
        });
    },
    [validationSchema]
  );

  const validateForm = useCallback(async () => {
    return new Promise(resolve => {
      if (validationSchema) {
        schemaValidation(state.values).then((schemaErrors: any) => {
          if (!isEqual(state.errors, schemaErrors)) {
            dispatch({
              type: ActionType.SET_ERRORS,
              payload: schemaErrors
            });
          }

          resolve(schemaErrors);
        });
      } else {
        resolve({});
      }
    });
  }, [schemaValidation, state.errors, state.values, validationSchema]);

  function setFieldValue(name: string, value: number | string) {
    dispatch({
      type: ActionType.SET_VALUE,
      payload: {
        name,
        value
      }
    });
  }

  const handleChange = useCallback(e => {
    const { name, value } = e.target;

    setFieldValue(name, value);
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent<HTMLFormElement>): void => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();

      validateForm().then((validationErrors: any) => {
        const isNowValid = !Object.keys(validationErrors).length;

        if (isNowValid) {
          onSubmit(state.values);
        }
        // eslint-disable-next-line consistent-return
        return null;
      });
    },
    [onSubmit, state.values, validateForm]
  );

  const resetForm = useCallback(() => {
    dispatch({
      type: ActionType.RESET
    });

    if (typeof onReset === "function") onReset();
  }, [onReset]);

  useEffect(() => {
    if (isDirty) validateForm();
  }, [isDirty, state.values, validateForm]);

  return {
    ...state,
    handleChange,
    handleSubmit,
    isValid,
    resetForm,
    setFieldValue
  };
}

export default useForm;
