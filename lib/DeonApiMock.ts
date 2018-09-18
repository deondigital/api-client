import { ContractsApi, DeclarationsApi, CslApi, InfoApi, DeonApi } from './DeonApi';
import { Event, Tag, EvaluateExpressionInput, InstantiationInput, DeclarationInput, CheckExpressionInput } from './DeonData';

/**
 * Mock classes for the Deon API.  All API methods return rejected Promises.
 * This can be used with tools like sinon to add relevant stub methods like:
 *   'sinon.default.stub(contractsApiMock, "instantiate");'
 * and using the stub to inspect calls.
 */

export const contractsApiMock : ContractsApi = {
  getAll: () => Promise.reject(),
  get: (_id: string) => Promise.reject(),
  tree: (_id: string) => Promise.reject(),
  src: (_id: string, _simplified: boolean) => Promise.reject(),
  nextEvents: (_id: string) => Promise.reject(),
  applyEvent: (_id: string, _event: Event, _tag?: Tag) => Promise.reject(),
  report: (_expressionInput: EvaluateExpressionInput) => Promise.reject(),
  reportOnContract: (_id: string, _expressionInput: EvaluateExpressionInput) => Promise.reject(),
  instantiate: (_instantiateInput: InstantiationInput) => Promise.reject()
}

export const declarationsApiMock : DeclarationsApi = {
  getAll : () => Promise.reject(),
  get : (_id: string) => Promise.reject(),
  add : (_declarationInput: DeclarationInput) => Promise.reject(),
  ontology : (_id: string) => Promise.reject()
}

export const cslApiMock : CslApi = {
  check : (_i: CheckExpressionInput) => Promise.reject(),
  checkExpression : (_i: CheckExpressionInput, _id?: string) => Promise.reject()
}

export const infoApiMock : InfoApi = {
  get : () => Promise.reject(),
  getAgents : () => Promise.reject()
}

export const deonApiMock : DeonApi = {
  contracts: contractsApiMock,
  declarations: declarationsApiMock,
  csl: cslApiMock,
  info: infoApiMock
}
