import { render } from '@testing-library/preact';
import { h } from 'preact';

import Redirect from './Redirect';

const mockChangeLocation = jest.fn();
const mockExecuteOnVisiblePage = jest.fn((cb: () => void) => cb());

jest.mock('../../../../util/Util', () => ({
  __esModule: true,
  default: {
    changeLocation: (...args: any[]) => mockChangeLocation(...args),
    executeOnVisiblePage: (...args: any[]) => mockExecuteOnVisiblePage(...args),
  },
}));

const mockIsSafari = jest.fn();

jest.mock('../../../../util/BrowserFeatures', () => ({
  __esModule: true,
  default: {
    isSafari: () => mockIsSafari(),
  },
}));

describe('Redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does nothing when url is missing', () => {
    render(<Redirect uischema={{ type: 'Redirect', options: {} } as any} />);
    expect(mockExecuteOnVisiblePage).not.toHaveBeenCalled();
    expect(mockChangeLocation).not.toHaveBeenCalled();
  });

  it('redirects immediately for non-safari when page is visible', () => {
    mockIsSafari.mockReturnValue(false);

    render(
      <Redirect
        uischema={{ type: 'Redirect', options: { url: 'https://example.com' } } as any}
      />,
    );

    expect(mockExecuteOnVisiblePage).toHaveBeenCalledTimes(1);
    expect(mockChangeLocation).toHaveBeenCalledWith('https://example.com');
  });

  it('delays redirect on safari by 150ms', () => {
    jest.useFakeTimers();
    mockIsSafari.mockReturnValue(true);

    render(
      <Redirect
        uischema={{ type: 'Redirect', options: { url: 'https://example.com' } } as any}
      />,
    );

    expect(mockExecuteOnVisiblePage).toHaveBeenCalledTimes(1);
    expect(mockChangeLocation).not.toHaveBeenCalled();

    jest.advanceTimersByTime(149);
    expect(mockChangeLocation).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockChangeLocation).toHaveBeenCalledWith('https://example.com');
  });
});