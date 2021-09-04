# ts-json-as-const
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](#)

A (very) simple CLI tool that reads JSON files and creates .d.ts files with their keys/values explicitly defined

## Install

```sh
npm install ts-json-as-const
```

## Usage

```sh
npx ts-json-as-const [path/to/json/file.json ...]
```

## Example

### Input `example.json`
```json
{
  "foo": {
    "bar": false,
    "baz": true,
    "i-can": "hascheezburger"
  },
  "array": [ 1, 2, 3, { "foo": 1, "bar": [ 4, 5 ] }, 6 ]
}
```

### Output `example.json.d.ts`
```ts
interface Example {
  foo: {
    bar: false,
    baz: true,
    'i-can': 'hascheezburger';
  },
  array: [
    1,
    2,
    3,
    {
      foo: 1,
      bar: [
        4,
        5
      ]
    },
    6
  ]
}

declare const Example: Example;

export = Example;
```

## Author

👤 **Bethany Hitch**

* Github: [@dfoverdx](https://github.com/dfoverdx)
