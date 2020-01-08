#!/usr/bash

npm run lint
npm run build
npm version patch
git push
npm publish
