import {
  ContractsApi,
  DeclarationsApi,
  CslApi,
  InfoApi,
  DeonApi,
  } from './DeonApi';
import {
  Event,
  Tag,
  EvaluateExpressionInput,
  InstantiationInput,
  DeclarationInput,
  CheckExpressionInput,
  EvaluateReportInput,
  Exp,
  } from './DeonData';

/**
 * Mock classes for the Deon API.  All API methods return rejected Promises.
 * This can be used with tools like sinon to add relevant stub methods like:
 *   'sinon.default.stub(contractsApiMock, "instantiate");'
 * and using the stub to inspect calls.
 */

export const contractsApiMock : ContractsApi = {
  getAll: () => Promise.reject(),
  get: (_1: string) => Promise.reject(),
  tree: (_1: string) => Promise.reject(),
  src: (_1: string, _2: boolean) => Promise.reject(),
  nextEvents: (_1: string) => Promise.reject(),
  applyEvent: (_1: string, _2: Event, _3?: Tag) => Promise.reject(),
  instantiate: (_1: InstantiationInput) => Promise.reject(),
  getEvents: (_1: string) => Promise.reject(),
};

export const declarationsApiMock : DeclarationsApi = {
  getAll : () => Promise.reject(),
  get : (_1: string) => Promise.reject(),
  add : (_1: DeclarationInput) => Promise.reject(),
  ontology : (_1: string) => Promise.reject(),
  report: (_1: EvaluateExpressionInput) => Promise.reject(),
  reportOnDeclaration: (_1: string, _2: EvaluateExpressionInput) => Promise.reject(),
  reportWithName: (_1: string, _2: EvaluateReportInput) => Promise.reject(),
};

export const cslApiMock : CslApi = {
  check : (_1: CheckExpressionInput) => Promise.reject(),
  checkExpression : (_1: CheckExpressionInput, _2?: string) => Promise.reject(),
  prettyPrintExp : (_1: Exp) => Promise.reject(),
};

export const infoApiMock : InfoApi = {
  get : () => Promise.reject(),
  getAgents : () => Promise.reject(),
};

export const deonApiMock : DeonApi = {
  contracts: contractsApiMock,
  declarations: declarationsApiMock,
  csl: cslApiMock,
  info: infoApiMock,
};
