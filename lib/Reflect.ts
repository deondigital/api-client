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
  constructor(private heap: ReifiedHeap, private symbols: { [id: string] : ExternalObject }) { }
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
            expression: this.reflect(this.heap.hExp[c.expression]),
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
      case 'DateTime': return {
        tag: 'CDateTime',
        value: constant.instant,
      };
      case 'Duration': return {
        tag: 'CDuration',
        value: constant.duration,
      };
      case 'Quote': return {
        tag: 'CQuote',
        value: Object.keys(this.symbols)[constant.symbol],
      };
    }
  }
  reflectAtomTerm = (atomTern: ReifiedAtomTerm): AtomTerm => {
    switch (atomTern.tag) {
      case 'Wildcard': return {
        tag: 'Wildcard',
        wildcardId: atomTern.vildcardId,
      };
      case 'App': return {
        tag: 'App',
        name: atomTern.name,
        arguments: atomTern.arguments.map(r => this.reflectAtomTerm(this.heap.hAtomTerm[r])),
      };
      case 'Constant': return {
        tag: 'Constant',
        constant: this.reflectConstant(this.heap.hConstant[atomTern.constant]),
      };
      case 'Record': return {
        tag: 'Record',
        name: atomTern.name,
        fields: Object.assign({}, ...Object.keys(atomTern.fields).map(
          k => ({ [k]: this.reflectAtomTerm(this.heap.hAtomTerm[atomTern.fields[k]]) }),
        )),
      };
      case 'Tuple': return {
        tag: 'Tuple',
        elements: atomTern.elements.map(r => this.reflectAtomTerm(this.heap.hAtomTerm[r])),
      };
      case 'Var': return {
        tag: 'Var',
        variableId: atomTern.variableId,
      };
      case 'Map': {
        const d = [...atomTern.nativeMap].map(([k, v]) =>
          [
            this.reflectAtomTerm(this.heap.hAtomTerm[k]),
            this.reflectAtomTerm(this.heap.hAtomTerm[v]),
          ] as [AtomTerm, AtomTerm],
        );
        return {
          tag: 'Map',
          nativeMap: d,
        };
      }
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
}
