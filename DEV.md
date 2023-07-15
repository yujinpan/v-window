# DEV

## Create Component

- create component file in `src/components/`
- create entry module in `src/index.ts`

## Test Component

### Unit Test

- create test files:
  - source-code.js
  - source-code.spec.js
- run command `npm run test`

### Browser Test

- import test component in `dev/src/App.vue`, or create multiple components in `dev/src`
- run command `npm start`

## Build Component

- run command `npm run build`
- the dest in `lib` folder

## Create Document

- run command `npm run build` to get component dest code
- run command `npm run docs:dev` start docs preview
- edit `docs/*.md` show your component features

## Publish Library

> You need sign the npm first:
> `npm login`

- run command `npm run publish:beta` to publish beta version
- run command `npm run publish:patch` to publish patch version

## Publish Documentation

If you don't have a private package, just `git push`
and the GitHub workflow (`.github/workflows/deploy`) will be deployed automatically.

Or use the deployment shell publish to origin/gh-pages branch in local.

```shell
npm run docs:build

sh deploy.sh
```