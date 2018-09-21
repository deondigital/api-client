[![Build Status](https://travis-ci.com/deondigital/api-client.svg?branch=master)](https://travis-ci.com/deondigital/api-client)

# REST client for Deon Digital's API

## Changelog

### Unpublished

* Add support for `SelfContractId` instantiation argument, which resolves to the id of the contract that is being instantiated.

### [3.2.0] - 2018-08-30

* Expose ISO8601 duration parsing functionality.
* Support for duration primitive datatype.
* (Note: Requires Deon-api version 0.22.0) Introduced a `NodeInfo.getAgents()` that wraps the api call `/agents`, to request agent values from the back end.

---


[3.2.0]: https://github.com/deondigital/api-client/compare/v3.1.0...v3.2.0
