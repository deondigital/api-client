import {
  ReifiedHeap,
  ReifiedExp,
  Exp,
  ReifiedConstant,
  Constant,
  ReifiedAtomTerm,
  AtomTerm,
  ReifiedAgentMatcher,
  AgentMatcher,
 } from './DeonData';
import { ExternalObject } from './ExternalObject';

export class Reflect {
  constructor(private heap: ReifiedHeap, private entities: ExternalObject[]) { }

  private counter = 0;
  private entitySymbols = Array<[ExternalObject, string]>();
  symbolContext = new Map<string, ExternalObject>();
  private getSymbol = (e: ExternalObject): string => {
    const idx = this.entitySymbols.findIndex(x => e === x[0]);
    if (idx >= 0) {
      return this.entitySymbols[idx][1];
    }
    const symbol = (this.counter).toString();
    this.counter += 1;
    this.symbolContext.set(symbol, e);
    this.entitySymbols.push([e, symbol]);
    return symbol;
  }

  reflect = (exp: ReifiedExp): Exp => {
    switch (exp.tag) {
      case 'App': return {
        tag: 'EApp',
        expression: this.reflect(this.heap.hExp[exp.expression]),
        arg: this.reflect(this.heap.hExp[exp.arg]),
      };
      case 'BuiltInApp': return {
        tag: 'EBuiltInApp',
        builtInName: exp.builtInName,
        args: exp.args.map(e => this.reflect(this.heap.hExp[e])),
      };
      case 'Constant': return {
        tag: 'EConstant',
        constant: this.reflectConstant(this.heap.hConstant[exp.constant]),
      };
      case 'Constructor': return {
        tag: 'EConstructor',
        constructorName: exp.constructorName,
      };
      case 'Lambda': return {
        tag: 'ELambda',
        cases: exp.cases.map((c) => {
          return {
            pattern: c.pattern,
            body: this.reflect(this.heap.hExp[c.body]),
          };
        }),
      };
      case 'Project': return {
        tag: 'EProject',
        expression: this.reflect(this.heap.hExp[exp.expression]),
        field: exp.field,
      };
      case 'Query': return {
        tag: 'EQuery',
        bodyExp: this.reflect(this.heap.hExp[exp.bodyExp]),
        ruleName: exp.ruleName,
        ruleTerm: this.reflectAtomTerm(this.heap.hAtomTerm[exp.ruleTerm]),
      };
      case 'Record': return {
        tag: 'ERecord',
        type: exp.type,
        fields: exp.fields.map((f) => {
          return {
            name: f.name,
            expression: this.reflect(this.heap.hExp[f.expression]),
          };
        }),
      };
      case 'Tuple': return {
        tag: 'ETuple',
        values: exp.values.map(v => this.reflect(this.heap.hExp[v])),
      };
      case 'Var': return {
        tag: 'EVar',
        qualifiedName: exp.qualifiedName,
      };
    }
  }
  reflectConstant = (constant: ReifiedConstant): Constant => {
    switch (constant.tag) {
      case 'Int': return {
        tag: 'CInt',
        value: constant.value,
      };
      case 'String': return {
        tag: 'CString',
        value: constant.value,
      };
      case 'Float': return {
        tag: 'CFloat',
        value: constant.value,
      };
      case 'Instant': return {
        tag: 'CInstant',
        value: constant.instant,
      };
      case 'Duration': return {
        tag: 'CDuration',
        value: constant.duration,
      };
      case 'Time': return {
        tag: 'CTime',
        value: constant.value,
      };
      case 'Period': return {
        tag: 'CPeriod',
        value: constant.value,
      };
      case 'Year': return {
        tag: 'CYear',
        value: constant.value,
      };
      case 'YearMonth': return {
        tag: 'CYearMonth',
        value: constant.value,
      };
      case 'Date': return {
        tag: 'CDate',
        value: constant.value,
      };
      case 'ZonedDateTime': return {
        tag: 'CZonedDateTime',
        value: constant.value,
      };
      case 'ZoneOffset': return {
        tag: 'CZoneOffset',
        value: constant.value,
      };
      case 'Quote': return {
        tag: 'CQuote',
        value: this.reflectSymbol(this.entities[constant.symbol]),
      };
    }
  }
  reflectAtomTerm = (atomTerm: ReifiedAtomTerm): AtomTerm => {
    switch (atomTerm.tag) {
      case 'Wildcard': return {
        tag: 'Wildcard',
        wildcardId: atomTerm.vildcardId,
      };
      case 'App': return {
        tag: 'App',
        name: atomTerm.name,
        arguments: atomTerm.arguments.map(r => this.reflectAtomTerm(this.heap.hAtomTerm[r])),
      };
      case 'Constant': return {
        tag: 'Constant',
        constant: this.reflectConstant(this.heap.hConstant[atomTerm.constant]),
      };
      case 'Record': return {
        tag: 'Record',
        name: atomTerm.name,
        fields: Object.assign({}, ...Object.keys(atomTerm.fields).map(
          k => ({ [k]: this.reflectAtomTerm(this.heap.hAtomTerm[atomTerm.fields[k]]) }),
        )),
      };
      case 'Tuple': return {
        tag: 'Tuple',
        elements: atomTerm.elements.map(r => this.reflectAtomTerm(this.heap.hAtomTerm[r])),
      };
      case 'Var': return {
        tag: 'Var',
        variableId: atomTerm.variableId,
      };
      case 'Map': {
        const d = [...atomTerm.entries].map(([k, v]) =>
          [
            this.reflectAtomTerm(this.heap.hAtomTerm[k]),
            this.reflectAtomTerm(this.heap.hAtomTerm[v]),
          ] as [AtomTerm, AtomTerm],
        );
        return {
          tag: 'Map',
          entries: d,
        };
      }
      case 'Set': return {
        tag: 'Set',
        entries: atomTerm.entries.map(e => this.reflectAtomTerm(this.heap.hAtomTerm[e])),
      };
    }
  }
  reflectAgentMatcher = (agentMatcher: ReifiedAgentMatcher): AgentMatcher => {
    switch (agentMatcher.tag) {
      case 'AnyAgent': return {
        tag: 'AnyAgent',
      };
      case 'MatchAgent': return {
        tag: 'MatchAgent',
        expression: this.reflect(this.heap.hExp[agentMatcher.expression]),
      };
    }
  }
  reflectSymbol = (e: ExternalObject): string => {
    return this.getSymbol(e);
  }
}
