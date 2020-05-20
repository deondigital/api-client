[![Build Status](https://travis-ci.com/deondigital/api-client.svg?branch=master)](https://travis-ci.com/deondigital/api-client)

# REST client for Deon Digital's API

## Changelog

### [16.0.0] - 2020-05-20

* The API is now split up into two parts: an anonymous API that does not require authentication and an identified API that does. The "authentication" is for now just a header that states which of the known identities of the ledger backed that performs a given request.

### [15.0.0] - 2020-05-07

* Removed the `ContractApi.tree` endpoint and `ContractTree` type.
* Introduced the `ExternalObject.CordaAgent` type for handling agent types coming from Corda backends
* Renamed `mkAgentValue` and `ExternalObject.mkAgent` to `mkStringAgentValue` and `ExternalObject.mkStringAgent` respectively to closer match the generated object.

### [14.2.0] - 2020-04-15

* The `Duration` type is now a `class` with `equals` and `hashCode` methods.  This makes it possible to use it with the containers in `immutable-js`.

### [14.1.2] - 2020-03-27

* Aligned error codes with current version of the API webservice.

### [14.1.1] - 2020-03-09

* Tags are now always returned when applying events.

### [14.1.0] - 2020-02-21

* Support for built-in CSL `Map` type.

### [14.0.0] - 2020-02-10

* Added the function `reportWithName` in the `DeclarationsApi` for calling the new endpoint `/declarations/${id}/namedReport`.
* Added types for `Exp`, `Type`, and `AgentMatcher`. Updated `EventPredicate` to use these types.

### [13.0.0] - 2020-01-28

* The functions for calling reports, `report` and `reportOnContract`, have been moved to the `DeclarationsApi`.  The latter has been renamed `reportOnDeclaration` and now takes a declaration id instead of a contract id.
* The `Contract` interface now contains the list of participants that the contract was instantiated with.
* The `peers` field in `InstantiationInput` is now an `ExternalObject`.
* The field `peers` has been removed from the `NodeInfoOutput` interface.

### [12.2.0] - 2020-01-09

* Add `CallError`, `CSLError`, and `SerializationError` to possible `CheckError` types.
* Handle the more structured `BadRequestError` from Deon API `v0.53.0`.
* Correct the `Duration` validation logic to match the intended format. Now supports `PnDTnHnMnS` instead of `PnYnMnDTnHnMnS`, to follow the duration libraries in Java and Haskell.

### [12.0.0] - 2019-10-18

* Remove `Pseudo` and replace it with `ExternalObject` which is equivalent except that it doesn't require the specification of "bound names".
* Change `ContractId` to `Contract` everywhere for consistency with `Agent`.
* Remove `ContractIdentifier` and `AgentIdentifier`. Where type safety is wanted, use `ExternalObject.StringContract` and `ExternalObject.StringAgent`.

### [11.0.0] - 2019-09-27

* Remove `InstantiationArgument` and `SelfContractId` as this is not supported with the removal of getEvents.

### [10.3.0] - 2019-08-05

* Added `Contracts.getEvents` for the new `GET /contracts/{id}/events` endpoint.

### [10.2.0] - 2019-05-24

* Removed support for database values as they were removed from the query language.

### [10.1.0] - 2019-05-15

* Added support for the database values used in the new query language.

### [10.0.0] - 2019-02-25

* Improved error handling for `CslApi.check` and `CslApi.checkExpression`.
* Changed the representation of floating point values to be string rather than number. With version v0.35.0 of the server we use decimal128 rather than binary64 for floating point numbers, and `decimal128` cannot be represented in a TypeScript number.

### [9.0.0] - 2019-02-25

* Use new data model for `CheckError` from Deon API `v0.29.0`.

### [8.0.0] - 2019-02-19

* API change for `DeonRestClient` constructor: hook now has type `(r: Promise<Response>) => Promise<Response>` and can catch rejected promises.

### [7.0.0] - 2019-01-03

* `AgentValue` now has a proper `AgentIdentifier` instead of a string.

### [6.1.1] - 2018-12-20

* Corrected error when publishing npm package

### [6.1.0] - 2018-12-20

* Added `TupleValue` that handles tupled-values in CSL.

### [6.0.0] - 2018-11-29

* Breaking: `Signed` is now generic since its CSL type is polymorphic.

### [5.0.0] - 2018-11-21

* Breaking: `PseudoValue`s now take `string` as `boundName` instead of `QualifiedName`.

### [4.0.0] - 2018-10-29

* Breaking: Use new `PseudoValue` constructor to represent pseudo-syntactic values.

### [3.5.1] - 2018-10-25

* Fixed a bug when (de)serializing elliptic curve names.

### [3.5.0] - 2018-10-12

* Added `SignedValue` and `PublicKeyValue` that models signed data. There are also functions to construct such values using OpenSSL generated keys in the PEM format.

### [3.4.0] - 2018-10-04

* Added a `ContractIdValue` that holds information about instantiated contracts. This value is returned from `POST /contracts`.

### [3.3.0] - 2018-09-21

* Add support for `SelfContractId` instantiation argument, which resolves to the id of the contract that is being instantiated.  Requires Deon API version 0.22.0.
* Added mock versions of the APIs to assist in testing with mocking frameworks.

### [3.2.0] - 2018-08-30

* Expose ISO8601 duration parsing functionality.
* Support for duration primitive datatype.
* (Note: Requires Deon-api version 0.22.0) Introduced a `NodeInfo.getAgents()` that wraps the api call `/agents`, to request agent values from the back end.

---
[16.0.0]: https://github.com/deondigital/api-client/compare/v15.0.0...v16.0.0
[15.0.0]: https://github.com/deondigital/api-client/compare/v14.2.0...v15.0.0
[14.2.0]: https://github.com/deondigital/api-client/compare/v14.1.2...v14.2.0
[14.1.2]: https://github.com/deondigital/api-client/compare/v14.1.1...v14.1.2
[14.1.1]: https://github.com/deondigital/api-client/compare/v14.1.0...v14.1.1
[14.1.0]: https://github.com/deondigital/api-client/compare/v14.0.0...v14.1.0
[14.0.0]: https://github.com/deondigital/api-client/compare/v13.0.0...v14.0.0
[13.0.0]: https://github.com/deondigital/api-client/compare/v12.2.0...v13.0.0
[12.2.0]: https://github.com/deondigital/api-client/compare/v12.0.0...v12.2.0
[12.0.0]: https://github.com/deondigital/api-client/compare/v11.0.0...v12.0.0
[11.0.0]: https://github.com/deondigital/api-client/compare/v10.3.0...v11.0.0
[10.3.0]: https://github.com/deondigital/api-client/compare/v10.2.0...v10.3.0
[10.2.0]: https://github.com/deondigital/api-client/compare/v10.1.0...v10.2.0
[10.1.0]: https://github.com/deondigital/api-client/compare/v10.0.0...v10.1.0
[10.0.0]: https://github.com/deondigital/api-client/compare/v9.0.0...v10.0.0
[9.0.0]: https://github.com/deondigital/api-client/compare/v8.0.0...v9.0.0
[8.0.0]: https://github.com/deondigital/api-client/compare/v7.0.0...v8.0.0
[7.0.0]: https://github.com/deondigital/api-client/compare/v6.1.1...v7.0.0
[6.1.1]: https://github.com/deondigital/api-client/compare/v6.1.0...v6.1.1
[6.1.0]: https://github.com/deondigital/api-client/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/deondigital/api-client/compare/v5.0.0...v6.0.0
[5.0.0]: https://github.com/deondigital/api-client/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/deondigital/api-client/compare/v3.5.1...v4.0.0
[3.5.1]: https://github.com/deondigital/api-client/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/deondigital/api-client/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/deondigital/api-client/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/deondigital/api-client/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/deondigital/api-client/compare/v3.1.0...v3.2.0
