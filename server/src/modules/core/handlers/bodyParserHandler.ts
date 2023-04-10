import bodyParser, { OptionsJson } from 'body-parser';
import type { Handler } from 'express';

export const bodyParserOptions: OptionsJson = {};

export const bodyParserHandler: Handler = bodyParser.json(bodyParserOptions);
