[![Build Status](https://travis-ci.com/deondigital/api-client.svg?branch=master)](https://travis-ci.com/deondigital/api-client)

# REST client for Deon Digital's API

## Changelog

### [4.0.0] - 2018-10-29

* Breaking: Use new `PseudoValue` constructor to represent pseudo-syntactic values

### [3.5.1] - 2018-10-25

* Fixed a bug when (de)serializing elliptic curve names

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

[4.0.0]: https://github.com/deondigital/api-client/compare/v3.5.1...v4.0.0
[3.5.1]: https://github.com/deondigital/api-client/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/deondigital/api-client/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/deondigital/api-client/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/deondigital/api-client/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/deondigital/api-client/compare/v3.1.0...v3.2.0
