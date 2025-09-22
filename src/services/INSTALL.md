# Installation Guide

## Required Dependencies

To use the IndexedDB implementation, you need to install the following package:

```bash
# Using npm
npm install idb

# Using yarn
yarn add idb
```

The `idb` package is a small wrapper around the IndexedDB API that makes it easier to use. It provides a more modern Promise-based API for working with IndexedDB.

## Verifying Installation

After installing the package, you can verify that it's installed correctly by checking your package.json file. It should include an entry for "idb" in the dependencies section.

## Alternative: Using Native IndexedDB API

If you prefer not to add a new dependency, you can modify the `db.service.js` file to use the native IndexedDB API instead of the `idb` package. However, the native API is more verbose and harder to work with.