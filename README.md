# react-use-form

## Install

```bash
yarn add --save riccoski/react-use-form
```

## Usage

```javascript
import React from "react";
import useForm from "react-use-form";
import * as yup from "yup";

function App() {
  const { handleChange, handleSubmit } = useForm({
    onSubmit(values) {
      console.log("values", values);
    },
    validationSchema: yup.object().shape({
      password: yup.string().required(),
      email: yup
        .string()
        .email()
        .required()
    })
  });

  return (
    <form onSubmit={handleSubmit}>
      <label>Email address</label>
      <input
        onChange={handleChange}
        name="email"
        type="email"
        placeholder="Enter email"
      />
      <label>Password</label>
      <input
        onChange={handleChange}
        type="password"
        name="password"
        placeholder="Password"
      />
      <button type="submit">Log in</button>
    </form>
  );
}

export default App;
```

## License

MIT © [riccoski](https://github.com/riccoski)
