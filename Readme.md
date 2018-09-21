[![Build Status](https://travis-ci.com/deondigital/api-client.svg?branch=master)](https://travis-ci.com/deondigital/api-client)

# REST client for Deon Digital's API

## Changelog

### [3.3.0] - 2018-09-21

* Add support for `SelfContractId` instantiation argument, which resolves to the id of the contract that is being instantiated.  Requires Deon API version 0.22.0.
* Added mock versions of the APIs to assist in testing with mocking frameworks.

### [3.2.0] - 2018-08-30

* Expose ISO8601 duration parsing functionality.
* Support for duration primitive datatype.
* (Note: Requires Deon-api version 0.22.0) Introduced a `NodeInfo.getAgents()` that wraps the api call `/agents`, to request agent values from the back end.

---


[3.3.0]: https://github.com/deondigital/api-client/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/deondigital/api-client/compare/v3.1.0...v3.2.0
