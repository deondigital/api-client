import { DeonApi, ContractsApi, DeclarationsApi, CslApi, InfoApi, RestResponse } from './DeonApi';
import { InstantiationInput, ExpressionInput, DeclarationInput, Event, Tag } from './DeonData';

/**
 * Constructs a Deon REST client.
 */
class DeonRestClient implements DeonApi {
  private get: <TOk, TErr>(url: string) => Promise<RestResponse<TOk, TErr>>;
  private post: <TOk, TErr>(url: string, data: object) => Promise<RestResponse<TOk, TErr>>;

  constructor(
    get: <TOk, TErr>(url: string) => Promise<RestResponse<TOk, TErr>>,
    post: <TOk, TErr>(url: string, data: object) => Promise<RestResponse<TOk, TErr>>,
  ) {
    this.get = get;
    this.post = post;
  }

  contracts: ContractsApi = {
    getAll: () => this.get('/contracts'),

    get: (id: string) => this.get('/contracts/' + id),

    tree: (id: string) => this.get('/contracts/' + id + '/tree'),

    src: (id: string, simplified: boolean) => {
      const url = simplified ? `/contracts/${id}/src/?simplified=true` : `/contracts/${id}/src`;
      return this.get(url);
    },

    nextEvents: (id: string) => this.get('/contracts/' + id + '/next-events'),

    instantiate: (instantiateInput: InstantiationInput) =>
      this.post('/contracts', instantiateInput),

    applyEvent: (id: string, event: Event, tag?: Tag) => {
      if (tag) return this.post('/contracts/' + id + '/' + tag + '/events', event);
      return this.post('/contracts/' + id + '/events', event);
    },

    report: (expressionInput: ExpressionInput) => this.post('/contracts/report', expressionInput),

    reportOnContract: (id: string, expressionInput: ExpressionInput) =>
      this.post('/contracts/' + id + '/report', expressionInput),
  };

  declarations: DeclarationsApi = {
    getAll: () => this.get('/declarations'),

    get: (id: string) => this.get('/declarations/' + id),

    add: (i: DeclarationInput) => this.post('/declarations', i),

    ontology: (id: string) => this.get('/declarations/' + id + '/ontology'),
  };

  csl: CslApi = {
    check: (i: ExpressionInput) => this.post('/csl/check', i),

    checkExpression: (i: ExpressionInput, id?: string) => {
      if (id) return this.post('/csl/check-expression/' + id, i);
      return this.post('/csl/check-expression', i);
    },

  };

  info: InfoApi = {
    get: () => this.get('/node-info'),
  };
}

export { DeonRestClient };
