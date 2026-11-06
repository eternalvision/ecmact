# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities through [GitHub private vulnerability reporting](https://github.com/eternalvision/ecmact/security/advisories/new). Do not publish exploit details in a public issue or pull request before a fix or coordinated disclosure.

Include the affected package (`ecmact` or `create-ecmact`) and version, a minimal reproduction, the environment, expected impact and any suggested mitigation. Use synthetic data and remove credentials and private information.

Reports are reviewed by the maintainer. Response and fix times depend on severity and availability; there is no guaranteed response-time commitment. Older releases may require upgrading to receive a fix.

## Security boundaries

- `content` is text. `html` accepts raw HTML and does not sanitize it: sanitize untrusted markup before passing it in.
- URL-bearing attributes are not URL validators. Validate untrusted links and resource URLs in the application.
- Do not let untrusted input select arbitrary element tags.
- Shadow DOM isolates markup and styling; it is not a security sandbox for untrusted scripts.
- Client-side route guards do not enforce authorization. Enforce permissions on the server.
- Treat third-party widget scripts as code running with the host page's privileges.

See the [documented security model](README.md#security-model) for details. If behavior violates these documented boundaries, include that discrepancy in your report.
