# Authentication API Contract

All SDKs in this repository use the same request format and response schema.

## Endpoint

- `POST /api/auth`

## Request Content-Type

- `application/json`

## Common Fields

- `type`: `init` | `login` | `license`
- `appname`: string
- `ownerid`: string
- `secret`: string

## Operation Payloads

### init

```json
{
  "type": "init",
  "appname": "my-app",
  "ownerid": "owner-id",
  "secret": "app-secret",
  "version": "1.0"
}
```

### login

```json
{
  "type": "login",
  "appname": "my-app",
  "ownerid": "owner-id",
  "secret": "app-secret",
  "username": "demo",
  "password": "demo-pass",
  "hwid": "machine-id"
}
```

### license

```json
{
  "type": "license",
  "appname": "my-app",
  "ownerid": "owner-id",
  "secret": "app-secret",
  "key": "XXXX-YYYY-ZZZZ",
  "hwid": "machine-id"
}
```

## Response

```json
{
  "success": true,
  "message": "ok",
  "token": "optional-session-token",
  "user": {
    "username": "demo",
    "expiry": "2026-12-31",
    "hwid": "machine-id"
  }
}
```
