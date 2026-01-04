# OpenApi

Access [OpenApi Github](https://github.com/ferdikoomen/openapi-typescript-codegen)

Install OpenApi

```shell
npm install openapi-typescript-codegen --save-dev
```

Use the ﻿openapi command to generate TypeScript code

```shell
# --input designates your OpenAPI file (eg: JSON, YAML)
# --output is the output directory for your generated files
# --client specifies the HTTP client you want to use (eg: ﻿fetch, ﻿axios, ﻿xhr)
openapi --input http://127.0.0.1:8080/v3/api-docs --output ./src/api --client axios
```

Configure OpenApi

```ts
export const OpenAPI: OpenAPIConfig = {
    BASE: 'http://127.0.0.1:10100',
    VERSION: '1.0',
    WITH_CREDENTIALS: true, // Request with credentials
    CREDENTIALS: 'include',
    TOKEN: undefined,
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: undefined,
};
```

If we assume that we have a ﻿UserService with a method ﻿getUser(id: string), this method can be imported and used as follows

```ts
import { UserService } from '@/src/api'

const userService = new UserService()

UserControllerService.getLoginUserUsingGet().then((rep) => {
  console.log(rep)
}).catch((err) => {
  console.log(err)
})
```

