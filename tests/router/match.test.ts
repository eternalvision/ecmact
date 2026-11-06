import { describe, expect, it } from 'vitest';
import { compilePattern, matchPath } from '@em/router/match';

const match = (pattern: string, path: string) => matchPath(compilePattern(pattern), path);

describe('compilePattern', () => {
  it('collects the parameter names in order', () => {
    expect(compilePattern('/orgs/:org/repos/:repo').names).toEqual(['org', 'repo']);
  });

  it('names a wildcard "*"', () => {
    expect(compilePattern('/files/*').names).toEqual(['*']);
  });

  it('has no names for a static path', () => {
    expect(compilePattern('/about').names).toEqual([]);
  });
});

describe('matchPath', () => {
  it('matches the root', () => {
    expect(match('/', '/')).toEqual({});
    expect(match('/', '/other')).toBeNull();
  });

  it('matches a static path with or without a trailing slash', () => {
    expect(match('/about', '/about')).toEqual({});
    expect(match('/about', '/about/')).toEqual({});
    expect(match('/about', '/about/team')).toBeNull();
    expect(match('/about', '/')).toBeNull();
  });

  it('extracts parameters', () => {
    expect(match('/users/:id', '/users/42')).toEqual({ id: '42' });
    expect(match('/orgs/:org/repos/:repo', '/orgs/a/repos/b')).toEqual({ org: 'a', repo: 'b' });
  });

  it('does not let a parameter span segments or be empty', () => {
    expect(match('/users/:id', '/users/1/2')).toBeNull();
    expect(match('/users/:id', '/users/')).toBeNull();
    expect(match('/users/:id', '/users')).toBeNull();
  });

  it('decodes parameters', () => {
    expect(match('/users/:name', '/users/Ada%20Lovelace')).toEqual({ name: 'Ada Lovelace' });
  });

  it('returns null for an invalid encoding', () => {
    expect(match('/users/:name', '/users/%E0%A4%A')).toBeNull();
  });

  it('matches a wildcard with the rest of the path', () => {
    expect(match('/files/*', '/files/a/b.txt')).toEqual({ '*': 'a/b.txt' });
    expect(match('/files/*', '/files')).toEqual({ '*': '' });
    expect(match('/files/*', '/other')).toBeNull();
  });

  it('matches everything with a bare wildcard', () => {
    expect(match('*', '/')).toEqual({ '*': '' });
    expect(match('*', '/a/b')).toEqual({ '*': 'a/b' });
  });

  it('escapes regular expression characters in static segments', () => {
    expect(match('/a.b', '/a.b')).toEqual({});
    expect(match('/a.b', '/aXb')).toBeNull();
  });
});
