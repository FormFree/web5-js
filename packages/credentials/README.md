# `@web5/credentials` <!-- omit in toc -->

The `@web5/credentials` package provides the following functionality:
* creation, signing, verification, and general processing of [Verifiable Credentials (VCs)](https://www.google.com/search?q=w3c+verifiable+credentials&rlz=1C5GCEM_enPK1033PK1033&oq=w3c+verifiable+credentials&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg7MgYIAhBFGDvSAQgzMTIwajBqN6gCALACAA&sourceid=chrome&ie=UTF-8). 
* [Presentation Exchange](https://identity.foundation/presentation-exchange/) evaluation

# Table of Contents <!-- omit in toc -->

- [`VerifiableCredential`](#verifiablecredential)
  - [Features](#vc-features)
  - [Usage](#vc-usage)
    - [Creating a Verifiable Credential](#creating-a-verifiable-credential)
    - [Signing a Verifiable Credential](#signing-a-verifiable-credential)
    - [Verifying a Verifiable Credential](#verifying-a-verifiable-credential)
    - [Parsing a JWT into a Verifiable Credential](#parsing-a-jwt-into-a-verifiable-credential)
    - [Creating a Status List Credential](#creating-a-status-list-credential)
- [`VerifiablePresentation`](#verifiablepresentation)
  - [Features](#vp-features)
  - [Usage](#vp-usage)
    - [Creating a Verifiable Presentation](#creating-a-verifiable-presentation)
    - [Signing a Verifiable Presentation](#signing-a-verifiable-presentation)
    - [Verifying a Verifiable Presentation](#verifying-a-verifiable-presentation)
    - [Parsing a JWT into a Verifiable Presentation](#parsing-a-jwt-into-a-verifiable-presentation)
- [`PresentationExchange`](#presentationexchange)
  - [Features](#pex-features)
  - [Usage](#pex-usage)
    - [Selecting Credentials](#selecting-credentials)
    - [Satisfying a Presentation Definition](#satisfying-a-presentation-definition)
    - [Create Presentation From Credentials](#create-presentation-from-credentials)
    - [Validate Definition](#validate-definition)
    - [Validate Submission](#validate-submission)
    - [Validate Presentation](#validate-presentation)

# `VerifiableCredential`

## VC Features

* Create Verifiable Credentials with flexible data types.
* Sign credentials using decentralized identifiers (DIDs).
* Verify the integrity and authenticity of VCs encoded as JSON Web Tokens (JWTs).
* Parse JWT representations of VCs into VerifiableCredential instances.

## VC Usage

Along with the credentials package you will need command and dids for most of the Verifiable Credentials operations

```bash
npm install @web5/common
npm install @web5/dids
npm install @web5/credentials
```

Then to import:

```javascript
import { VerifiableCredential, VerifiablePresentation, PresentationExchange } from '@web5/credentials';
```

### Creating a Verifiable Credential

Create a new `VerifiableCredential` with the following parameters:

- `type`: Type of the credential.
- `issuer`: Issuer URI.
- `subject`: Subject URI.
- `data`: Credential data.
- `issuanceDate?` (Optional) The Issuance Date. Defaults to current date if not specified.
- `expirationDate?`: (Optional) Expiration Date.
- `credentialStatus?`: Optional. The credential status lookup information to see if credential is revoked.
- `credentialSchema?`: (Optional) The credential schema of the credential.
- `evidence?`: (Optional) Evidence can be included by an issuer to provide the verifier with additional supporting information in a verifiable credential.

```javascript
class StreetCredibility {
  constructor(localRespect, legit) {
    this.localRespect = localRespect;
    this.legit = legit;
  }
}

const vc: VerifiableCredential = await VerifiableCredential.create({
  type: "StreetCred",
  issuer: "did:example:issuer",
  subject: "did:example:subject",
  data: new StreetCredibility("high", true)
});
```

### Signing a Verifiable Credential
Sign a `VerifiableCredential` with a DID:

- `did`: The did that is signing the VC.

First create a `Did` object as follows:

```javascript
import { DidJwk } from '@web5/dids';
const issuer: BearerDid = await DidJwk.create();
```

Then sign the VC using the `did` object
```javascript
const vcJwt: string = await vc.sign({ did: issuer });
```

### Verifying a Verifiable Credential
Verify the integrity and authenticity of a Verifiable Credential

- `vcJwt`: The VC in JWT format as a String.

```javascript
try {
  await VerifiableCredential.verify({ vcJwt: signedVcJwt })
  console.log("VC Verification successful!")
} catch (e: Error) {
  console.log("VC Verification failed: ${e.message}")
}
```

### Parsing a JWT into a Verifiable Credential
Parse a JWT into a `VerifiableCredential` instance

`vcJwt`: The VC JWT as a String.

```javascript
const vc: VerifiableCredential = VerifiableCredential.parseJwt({ vcJwt: signedVcJwt })
```

### Creating a Status List Credential
Create a new `StatusListCredential` with the following parameters:

- `statusListCredentialId`: The id used for the resolvable path to the status list credential [String].
- `issuer`: The issuer URI of the status list credential, as a [String].
- `statusPurpose`: The status purpose of the status list cred, eg: revocation, as a [StatusPurpose].
- `credentialsToDisable`: The credentials to be marked as revoked/suspended (status bit set to 1) in the status list.

```javascript
const statusListCredential: VerifiableCredential = StatusListCredential.create({
  statusListCredentialId : 'https://statuslistcred.com/123',
  issuer                 : "did:example:issuer",
  statusPurpose          : 'revocation',
  credentialsToDisable   : [credWithCredStatus]
});
```

To associate the status list credential with a revocable credential have the `statusListCredential` parameter match up to the `statusListCredentialId` parameter. Here is a full example:

```javascript
const credentialStatus: StatusList2021Entry = {
  id                   : 'cred-with-status-id',
  type                 : 'StatusList2021Entry',
  statusPurpose        : 'revocation',
  statusListIndex      : '94567',
  statusListCredential : 'https://statuslistcred.com/123',
};

const credWithCredStatus: VerifiableCredential = await VerifiableCredential.create({
  type             : 'StreetCred',
  issuer           : issuerDid.uri,
  subject          : subjectDid.uri,
  data             : new StreetCredibility('high', true),
  credentialStatus : credentialStatus
});

// Create a status list credential with and revoke the credWithCredStatus
const statusListCredential: VerifiableCredential = StatusListCredential.create({
  statusListCredentialId : 'https://statuslistcred.com/123',
  issuer                 : "did:example:issuer",
  statusPurpose          : 'revocation',
  credentialsToDisable   : [credWithCredStatus]
});
```

# `VerifiablePresentation`

## VP Features

* Create Verifiable Presentation with flexible data types.
* Sign presentations using decentralized identifiers (DIDs).
* Verify the integrity and authenticity of VPs encoded as JSON Web Tokens (JWTs).
* Parse JWT representations of VPs into VerifiablePresentation instances.

### VP Usage

### Creating a Verifiable Presentation
Create a new VerifiablePresentation with the following parameters:

- `holder`: The holder URI of the presentation, as a string..
- `vcJwts`: The JWTs of the credentials to be included in the presentation.
- `type`: Optional type of the presentation, can be a string or an array of strings.
- `additionalData`: Optional additional data to be included in the presentation.

```javascript
const vp: VerifiablePresentation = await VerifiablePresentation.create({
  type: 'PresentationSubmission',
  holder: 'did:ex:holder',
  vcJwts: vcJwts,
  additionalData: { 'arbitrary': 'data' }
});
```

### Signing a Verifiable Presentation
Sign a `VerifiablePresentation` with a DID:

- `did`: The did that is signing the VP

Sign the VP using the `did` object
```javascript
const vpJwt: string = await vp.sign({ did: issuer });
```

### Verifying a Verifiable Presentation
Verify the integrity and authenticity of a Verifiable Presentation

- `vpJwt`: The VP in JWT format as a String.

```javascript
try {
  await VerifiablePresentation.verify({ vpJwt: signedVpJwt })
  console.log("VP Verification successful!")
} catch (e: Error) {
  console.log("VP Verification failed: ${e.message}")
}
```

### Parsing a JWT into a Verifiable Presentation
Parse a JWT into a `VerifiablePresentation` instance

`vpJwt`: The VP JWT as a String.

```javascript
const parsedVp: VerifiablePresentation = VerifiablePresentation.parseJwt({ vcJwt: signedVcJwt })
```

## `PresentationExchange`

`PresentationExchange` is designed to facilitate the creation of a Verifiable Presentation by providing tools to select and validate Verifiable Credentials against defined criteria.

### PEX Features

- Select credentials that satisfy a given presentation definition.
- Validate if a Verifiable Credential JWT satisfies a Presentation Definition.
- Validate input descriptors within Presentation Definitions.


### PEX Usage

### Selecting Credentials
Select Verifiable Credentials that meet the criteria of a given presentation definition.

- `vcJwts`: The list of Verifiable Credentials to select from.
- `presentationDefinition` The Presentation Definition to match against.

This returns a list of the vcJwts that are acceptable in the presentation definition.
```javascript
const selectedCredentialsJwts: string[] = PresentationExchange.selectCredentials({
    vcJwts: signedVcJwts,
    presentationDefinition: presentationDefinition
})
```

### Satisfying a Presentation Definition
Validate if a Verifiable Credential JWT satisfies the given presentation definition. Will return an error if the evaluation results in warnings or errors.

- `vcJwts`: The list of Verifiable Credentials to select from.
- `presentationDefinition` The Presentation Definition to match against.

```javascript 
try {
  PresentationExchange.satisfiesPresentationDefinition({ vcJwts: signedVcJwts, presentationDefinition: presentationDefinition })
  console.log("vcJwts satisfies Presentation Definition!")
} catch (e: Error) {
  console.log("Verification failed: ${e.message}")
}
```

### Create Presentation From Credentials
Creates a presentation from a list of Verifiable Credentials that satisfy a given presentation definition. This function initializes the Presentation Exchange (PEX) process, validates the presentation definition, evaluates the credentials against the definition, and finally constructs the presentation result if the evaluation is successful.

- `vcJwts`: The list of Verifiable Credentials to select from.
- `presentationDefinition` The Presentation Definition to match against.

```javascript
const presentationResult: PresentationResult = PresentationExchange.createPresentationFromCredentials({ vcJwts: signedVcJwts, presentationDefinition: presentationDefinition })
```

### Validate Definition
This method validates whether an object is usable as a presentation definition or not.

- `presentationDefinition` The Presentation Definition to validate

```javascript
const valid: Validated = PresentationExchange.validateDefinition({ presentationDefinition })
```

### Validate Submission
This method validates whether an object is usable as a presentation submission or not.

- `presentationSubmission` The Presentation Submission to validate 

```javascript
const valid: Validated = PresentationExchange.validateSubmission({ presentationSubmission })
```

### Validate Presentation
Evaluates a presentation against a presentation definition.

- `presentationDefinition` The Presentation Definition to validate
- `presentation` The Presentation

```javascript
const evaluationResults: EvaluationResults = PresentationExchange.evaluatePresentation({ presentationDefinition, presentation })
```