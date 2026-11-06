import { describe, expect, it } from 'vitest';
import { CanceledError, HttpError, isCancel, isHttpError } from '@em/http/error';

const config = {
  url: '/x',
  headers: { Authorization: 'secret', Accept: 'a' },
  redact: ['authorization', 'url'],
};

describe('HttpError', () => {
  it('carries the message, code, config and response', () => {
    const response = { status: 404 } as never;
    const error = new HttpError('nope', 'ERR_BAD_REQUEST', config, response);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HttpError');
    expect(error.message).toBe('nope');
    expect(error.code).toBe('ERR_BAD_REQUEST');
    expect(error.config).toBe(config);
    expect(error.response).toBe(response);
    expect(error.status).toBe(404);
    expect(error.isHttpError).toBe(true);
  });

  it('has no response or status when the server did not answer', () => {
    const error = new HttpError('x', 'ERR_NETWORK', {});
    expect(error.response).toBeUndefined();
    expect(error.status).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it('keeps the error it wraps as the cause', () => {
    const cause = new Error('socket');
    expect(new HttpError('x', 'ERR_NETWORK', {}, undefined, cause).cause).toBe(cause);
  });

  it('describes itself for logging and masks what is listed in redact', () => {
    const json = new HttpError('nope', 'ERR_BAD_REQUEST', config).toJSON();
    expect(json).toMatchObject({ name: 'HttpError', message: 'nope', code: 'ERR_BAD_REQUEST' });
    expect(json.config.url).toBe('[REDACTED ****]');
    expect((json.config.headers as Record<string, string>).Authorization).toBe('[REDACTED ****]');
    expect((json.config.headers as Record<string, string>).Accept).toBe('a');
  });

  it('describes a config without headers or redact', () => {
    expect(new HttpError('x', 'ERR_NETWORK', { url: '/y' }).toJSON().config).toEqual({ url: '/y' });
  });
});

describe('CanceledError', () => {
  it('is an HttpError with the code ERR_CANCELED', () => {
    const error = new CanceledError({});
    expect(error).toBeInstanceOf(HttpError);
    expect(error.name).toBe('CanceledError');
    expect(error.code).toBe('ERR_CANCELED');
    expect(error.message).toBe('canceled');
    expect(new CanceledError({}, 'stopped').message).toBe('stopped');
  });
});

describe('isHttpError and isCancel', () => {
  it('recognizes the errors of this client', () => {
    expect(isHttpError(new HttpError('x', 'ERR_NETWORK', {}))).toBe(true);
    expect(isHttpError(new CanceledError({}))).toBe(true);
    expect(isHttpError({ isHttpError: true })).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isHttpError(new Error('x'))).toBe(false);
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError('x')).toBe(false);
    expect(isHttpError({})).toBe(false);
  });

  it('recognizes only cancellations', () => {
    expect(isCancel(new CanceledError({}))).toBe(true);
    expect(isCancel(new HttpError('x', 'ERR_NETWORK', {}))).toBe(false);
  });
});
