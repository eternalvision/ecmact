import { afterEach, describe, expect, it, vi } from 'vitest';
import { devtools } from '@em/store/devtools';
import { createBase } from '@em/store/store';

interface Message {
  type: string;
  payload?: { type: string };
  state?: string;
}

const connect = () => {
  const connection = {
    init: vi.fn(),
    send: vi.fn(),
    subscribe: vi.fn((_listener: (message: Message) => void) => () => {}),
  };
  const extension = { connect: vi.fn(() => connection) };
  vi.stubGlobal('__REDUX_DEVTOOLS_EXTENSION__', extension);
  return { connection, extension };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('devtools', () => {
  it('works as usual without the extension', () => {
    const store = createBase(devtools(() => ({ count: 0 })));
    store.setState({ count: 1 });
    expect(store.getState().count).toBe(1);
  });

  it('works as usual when disabled', () => {
    const { extension } = connect();
    createBase(devtools(() => ({ count: 0 }), { enabled: false }));
    expect(extension.connect).not.toHaveBeenCalled();
  });

  it('connects with the name and sends the initial state', () => {
    const { connection, extension } = connect();
    createBase(devtools(() => ({ count: 0 }), { name: 'counter' }));
    expect(extension.connect).toHaveBeenCalledWith({ name: 'counter' });
    expect(connection.init).toHaveBeenCalledWith({ count: 0 });
  });

  it('sends every change with its action name', () => {
    const { connection } = connect();
    const store = createBase(devtools(() => ({ count: 0 })));
    store.setState({ count: 1 }, false, 'counter/set');
    expect(connection.send).toHaveBeenLastCalledWith({ type: 'counter/set' }, { count: 1 });
  });

  it('names changes that have no name anonymous, or with the given name', () => {
    const { connection } = connect();
    const plain = createBase(devtools(() => ({ count: 0 })));
    plain.setState({ count: 1 });
    expect(connection.send).toHaveBeenLastCalledWith({ type: 'anonymous' }, { count: 1 });
    const named = createBase(devtools(() => ({ count: 0 }), { anonymousActionType: 'change' }));
    named.setState({ count: 1 });
    expect(connection.send).toHaveBeenLastCalledWith({ type: 'change' }, { count: 1 });
  });

  it('sends the changes that actions make through set', () => {
    const { connection } = connect();
    const store = createBase<{ count: number; inc: () => void }>(
      devtools((set) => ({ count: 0, inc: () => set((state) => ({ count: state.count + 1 })) })),
    );
    store.getState().inc();
    expect(connection.send).toHaveBeenCalledTimes(1);
  });

  it('jumps to the state that the extension sends', () => {
    const { connection } = connect();
    const store = createBase(devtools(() => ({ count: 0 })));
    const listener = connection.subscribe.mock.calls[0]![0];
    store.setState({ count: 5 });
    listener({ type: 'DISPATCH', payload: { type: 'JUMP_TO_STATE' }, state: '{"count":1}' });
    expect(store.getState().count).toBe(1);
    listener({ type: 'DISPATCH', payload: { type: 'JUMP_TO_ACTION' }, state: '{"count":2}' });
    expect(store.getState().count).toBe(2);
  });

  it('ignores other messages', () => {
    const { connection } = connect();
    const store = createBase(devtools(() => ({ count: 0 })));
    const listener = connection.subscribe.mock.calls[0]![0];
    listener({ type: 'START' });
    listener({ type: 'DISPATCH', payload: { type: 'RESET' } });
    listener({ type: 'DISPATCH', payload: { type: 'JUMP_TO_STATE' } });
    listener({ type: 'DISPATCH' });
    expect(store.getState().count).toBe(0);
  });
});
