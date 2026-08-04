import { renderHook, act } from '@testing-library/react-hooks';
import useSessionStorage from '../src/useSessionStorage';

describe(useSessionStorage, () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('retrieves an existing value from sessionStorage', () => {
    sessionStorage.setItem('foo', '"bar"');
    const { result } = renderHook(() => useSessionStorage('foo'));
    const [state] = result.current;
    expect(state).toEqual('bar');
  });

  it('should return initialValue if sessionStorage empty and set that to sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('foo', 'bar'));
    const [state] = result.current;
    expect(state).toEqual('bar');
    expect(sessionStorage.getItem('foo')).toEqual('"bar"');
  });

  it('prefers existing value over initial state', () => {
    sessionStorage.setItem('foo', '"bar"');
    const { result } = renderHook(() => useSessionStorage('foo', 'baz'));
    const [state] = result.current;
    expect(state).toEqual('bar');
  });

  it('does not clobber existing sessionStorage with initialState', () => {
    sessionStorage.setItem('foo', '"bar"');
    renderHook(() => useSessionStorage('foo', 'buzz'));
    expect(sessionStorage.getItem('foo')).toEqual('"bar"');
  });

  it('correctly updates sessionStorage', () => {
    const { result, rerender } = renderHook(() => useSessionStorage('foo', 'bar'));

    const [, setFoo] = result.current;
    act(() => setFoo('baz'));
    rerender();

    expect(sessionStorage.getItem('foo')).toEqual('"baz"');
  });

  it('correctly and promptly returns a new value', () => {
    const { result, rerender } = renderHook(() => useSessionStorage('foo', 'bar'));

    const [, setFoo] = result.current;
    act(() => setFoo('baz'));
    rerender();

    const [foo] = result.current;
    expect(foo).toEqual('baz');
  });

  it('parses out objects from sessionStorage', () => {
    sessionStorage.setItem('foo', JSON.stringify({ ok: true }));
    const { result } = renderHook(() => useSessionStorage<{ ok: boolean }>('foo'));
    const [foo] = result.current;
    expect(foo!.ok).toEqual(true);
  });

  it('safely sets objects to sessionStorage', () => {
    const { result, rerender } = renderHook(() =>
      useSessionStorage<{ ok: any }>('foo', { ok: true })
    );

    const [, setFoo] = result.current;
    act(() => setFoo({ ok: 'bar' }));
    rerender();

    const [foo] = result.current;
    expect(foo!.ok).toEqual('bar');
  });

  describe('Options: raw', () => {
    it('does not JSON parse an existing raw value', () => {
      sessionStorage.setItem('foo', 'bar');
      const { result } = renderHook(() => useSessionStorage('foo', 'baz', true));
      const [foo] = result.current;
      expect(foo).toEqual('bar');
    });

    it('stores the initial value as a raw string, unserialized', () => {
      renderHook(() => useSessionStorage('foo', 'bar', true));
      expect(sessionStorage.getItem('foo')).toEqual('bar');
    });

    it('sets sessionStorage as a raw string after an update', () => {
      const { result, rerender } = renderHook(() => useSessionStorage('foo', 'bar', true));

      const [, setFoo] = result.current;
      act(() => setFoo('baz'));
      rerender();

      expect(sessionStorage.getItem('foo')).toEqual('baz');
    });
  });
});
