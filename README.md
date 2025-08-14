# OpenAPI Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/chanfana-openapi-template)

![OpenAPI Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/91076b39-1f5b-46f6-7f14-536a6f183000/public)

<!-- dash-content-start -->

This is a Cloudflare Worker with OpenAPI 3.1 Auto Generation and Validation using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono).

This is an lab project made to be used for training in CX flows that consume OpenAPI compliant web services that generates the `openapi.json` schema automatically from code and validates the incoming request to the defined parameters or request body.

This template includes various endpoints.

<!-- dash-content-end -->

## Testing

This template includes integration tests using [Vitest](https://vitest.dev/). To run the tests locally:

```bash
pnpm run test
```

Test files are located in the `tests/` directory, with examples demonstrating how to test your endpoints and database interactions.

## Project structure

1. Main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. Integration tests are located in the `tests/` directory.
4. For more information read the [chanfana documentation](https://chanfana.com/), [Hono documentation](https://hono.dev/docs), and [Vitest documentation](https://vitest.dev/guide/).
