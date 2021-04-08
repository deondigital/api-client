import {
  DeonApi, AnonymousDeonApi, IdentifiedDeonApi, CheckResponse,
  } from './DeonApi';
import {
  Event,
  Tag,
  EvaluateExpressionInput,
  InstantiationInput,
  DeclarationInput,
  EvaluateReportInput,
  Exp,
  DeclarationOutput,
  Declaration,
  Ontology,
  NodeInfoOutput,
  NovationInput,
  NamedAgents,
  Contract,
  ContractValue,
  InstantiationOutput,
  EventPredicate,
  Value,
  CheckExpressionInput,
  ResidualSource,
  OntologyRequest,
  EntrypointSignatureRequest,
  OntologyAndEntrypointSignatures,
  } from './DeonData';
import { ExternalObject } from './ExternalObject';

/**
 * Mock classes for the Deon API.  All API methods return rejected Promises.
 * This can be used with tools like sinon to add relevant stub methods like:
 *   'sinon.default.stub(contractsApiMock, "instantiate");'
 * and using the stub to inspect calls.
 */

export const anonymousApiMock: AnonymousDeonApi = {
  addDeclaration: (_0: DeclarationInput): Promise<DeclarationOutput> => Promise.reject(),
  getDeclarations: (): Promise<Declaration[]> => Promise.reject(),
  getDeclaration: (_0: string): Promise<Declaration> => Promise.reject(),
  getOntology: (_0: string): Promise<Ontology> => Promise.reject(),
  getOntologyForCSL: (_0: OntologyRequest): Promise<Ontology> => Promise.reject(),
  getEntrypointSignatures: (_0: EntrypointSignatureRequest):
    Promise<OntologyAndEntrypointSignatures> => Promise.reject(),
  checkContract: (_0: CheckExpressionInput): Promise<CheckResponse> => Promise.reject(),
  checkExpression: (_0: CheckExpressionInput, _1?: string): Promise<CheckResponse> =>
    Promise.reject(),
  prettyPrintExp: (_0: Exp): Promise<string> => Promise.reject(),
  getNodeInfo: (): Promise<NodeInfoOutput> => Promise.reject(),
  getAgents: (): Promise<NamedAgents> => Promise.reject(),
};

export const identifiedApiMock: IdentifiedDeonApi = {
  identity: (): ExternalObject => { throw Error('Not implemented'); },

  getContracts: (): Promise<Contract[]> => Promise.reject(),
  getContract: (_0: string | ContractValue): Promise<Contract> => Promise.reject(),
  addContract: (_0: InstantiationInput): Promise<InstantiationOutput> => Promise.reject(),

  src: (
    _0: string | ContractValue,
    _1: boolean,
  ): Promise<ResidualSource> => Promise.reject(),

  nextEvents: (_0: string | ContractValue): Promise<EventPredicate[]> => Promise.reject(),
  getEvents: (_0: string | ContractValue): Promise<Value[]> => Promise.reject(),
  applyEvent: (
    _0: string | ContractValue,
    _1: Event,
    _2?: Tag,
  ): Promise<Tag> => Promise.reject(),

  terminateContract: (_0: string, _1: Date, _2: String): Promise<void> => Promise.reject(),

  novateContract: (_0: string, _1: NovationInput): Promise<InstantiationOutput> => Promise.reject(),

  postReport: (
    _0: EvaluateExpressionInput,
    _1?: string,
  ): Promise<Value> => Promise.reject(),
  postReportWithName: (
    _0: EvaluateReportInput,
    _1: string,
  ): Promise<Value> => Promise.reject(),
};

export const deonApiMock : DeonApi = {
  anonymous: anonymousApiMock,
  identified: identifiedApiMock,
};
