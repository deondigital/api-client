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
  } from './DeonData';

/**
 * Mock classes for the Deon API.  All API methods return rejected Promises.
 * This can be used with tools like sinon to add relevant stub methods like:
 *   'sinon.default.stub(contractsApiMock, "instantiate");'
 * and using the stub to inspect calls.
 */

export const contractsApiMock : ContractsApi = {
  getAll: () => Promise.reject(),
  get: (_: string) => Promise.reject(),
  tree: (_: string) => Promise.reject(),
  src: (_: string, __: boolean) => Promise.reject(),
  nextEvents: (_: string) => Promise.reject(),
  applyEvent: (_: string, __: Event, ___?: Tag) => Promise.reject(),
  report: (_: EvaluateExpressionInput) => Promise.reject(),
  reportOnContract: (_: string, __: EvaluateExpressionInput) => Promise.reject(),
  instantiate: (_: InstantiationInput) => Promise.reject(),
};

export const declarationsApiMock : DeclarationsApi = {
  getAll : () => Promise.reject(),
  get : (_: string) => Promise.reject(),
  add : (_: DeclarationInput) => Promise.reject(),
  ontology : (_: string) => Promise.reject(),
};

export const cslApiMock : CslApi = {
  check : (_: CheckExpressionInput) => Promise.reject(),
  checkExpression : (_: CheckExpressionInput, __?: string) => Promise.reject(),
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
