/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { render } from '@testing-library/preact';
import { h } from 'preact';
import { ReactNode } from 'preact/compat';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loc } from 'util/loc';

import { WidgetContextProvider } from '../../contexts';
import {
  AuthenticatorButtonElement,
  AuthenticatorGroupCardElement,
  ButtonType,
} from '../../types';
import AuthenticatorGroupCard from './AuthenticatorGroupCard';

const locMock = loc as jest.Mock;

const renderWithContext = (ui: ReactNode) => render(
  <WidgetContextProvider value={{ loading: false, widgetProps: {} }}>
    {ui}
  </WidgetContextProvider>,
);

const makeButton = (key: string, index: number): AuthenticatorButtonElement => ({
  type: 'AuthenticatorButton',
  label: key,
  id: `auth_btn_${key}_${index}`,
  options: {
    type: ButtonType.BUTTON,
    key,
    ariaLabel: `Set up ${key}`,
    ctaLabel: 'Set up',
    dataSe: key,
    step: 'select-authenticator-enroll',
    iconName: `${key}_${index}`,
    includeData: true,
    includeImmutableData: false,
    actionParams: { 'authenticator.id': `id-${key}` },
  },
});

const buildCard = (options: Partial<AuthenticatorGroupCardElement['options']>): AuthenticatorGroupCardElement => ({
  type: 'AuthenticatorGroupCard',
  options: {
    groupIndex: 0,
    remaining: 1,
    buttons: [makeButton('okta_email', 0), makeButton('phone_number', 1)],
    ...options,
  },
});

describe('AuthenticatorGroupCard', () => {
  it('renders the card wrapper with a positional data-se attribute', () => {
    const { getByTestId } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({ groupIndex: 0 })} />,
    );
    const card = getByTestId('authenticator-enroll-group-0');
    expect(card).toBeInTheDocument();
  });

  it('uses the groupIndex option verbatim, never leaking a groupId', () => {
    const { container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({ groupIndex: 3 })} />,
    );
    expect(container.querySelector('[data-se="authenticator-enroll-group-3"]')).not.toBeNull();
    expect(container.innerHTML.includes('arg-')).toBe(false);
  });

  it('exposes role=group and aria-labelledby pointing at the per-card label id', () => {
    // Regions with the same button labels (e.g. Okta Verify in two overlapping
    // groups) must still be distinguishable in AT — the "Choose N of" chip is
    // the region name via aria-labelledby.
    const { getByTestId, container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({ groupIndex: 2 })} />,
    );
    const card = getByTestId('authenticator-enroll-group-2');
    expect(card.getAttribute('role')).toBe('group');
    expect(card.getAttribute('aria-labelledby')).toBe('authenticator-enroll-group-2-label');
    // The referenced id exists in the DOM.
    expect(container.querySelector('#authenticator-enroll-group-2-label')).not.toBeNull();
  });

  it('renders a "choose N of" label element sourced from the group.remaining count', () => {
    // Contract: N reflects transaction-remaining, not the static criteria threshold.
    // The jest.setup loc() mock returns the raw key, so we assert on the key
    // AND on the params passed to loc — the params carry the interpolation
    // input and would silently break if the transformer forgot [remaining].
    locMock.mockClear();
    const { getByTestId } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({ remaining: 2 })} />,
    );
    const label = getByTestId('authenticator-enroll-group-card-label');
    expect(label.textContent).toBe('oie.enrollment.group.choose.n.of');
    expect(locMock).toHaveBeenCalledWith('oie.enrollment.group.choose.n.of', 'login', [2]);
  });

  it('renders BY_DATE_TIME grace-period block when both description + expiry are provided', () => {
    const { container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({
        gracePeriodRequiredDescription: 'Required in 14 days',
        gracePeriodExpiry: '11/30/2026, 07:00 PM EST',
      })}
      />,
    );
    expect(container.querySelector('[data-se="authenticator-grace-period-required-description"]')?.textContent)
      .toBe('Required in 14 days');
    expect(container.querySelector('[data-se="authenticator-grace-period-expiry-date"]')?.textContent)
      .toBe('11/30/2026, 07:00 PM EST');
  });

  it('renders BY_SKIP_COUNT grace-period block when remaining-skips description is provided', () => {
    const { container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({
        gracePeriodRemainingSkipsDescription: '3 skips remaining',
      })}
      />,
    );
    expect(container.querySelector('[data-se="authenticator-grace-period-skip-count-description"]')?.textContent)
      .toBe('3 skips remaining');
  });

  it('renders BY_DATE_TIME description block even when gracePeriodExpiry is absent (languageTags unavailable)', () => {
    // groupGracePeriodDescriptions sets gracePeriodRequiredDescription independently of
    // gracePeriodExpiry (which requires languageTags). The block must still render so that
    // v3 matches v2 behavior when languageTags is not available in the widget props.
    const { container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({
        gracePeriodRequiredDescription: 'Required today',
        gracePeriodExpiry: undefined,
      })}
      />,
    );
    expect(container.querySelector('[data-se="authenticator-grace-period-required-description"]')?.textContent)
      .toBe('Required today');
    expect(container.querySelector('[data-se="authenticator-grace-period-expiry-date"]')).toBeNull();
  });

  it('omits the grace-period block entirely when the group has no grace period', () => {
    const { container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({})} />,
    );
    expect(container.querySelector('[data-se="authenticator-grace-period-required-description"]')).toBeNull();
    expect(container.querySelector('[data-se="authenticator-grace-period-skip-count-description"]')).toBeNull();
  });

  it('hosts member buttons inside the card, keeping each button\'s data-se for e2e stability', () => {
    const { container } = renderWithContext(
      <AuthenticatorGroupCard uischema={buildCard({
        buttons: [makeButton('okta_email', 0), makeButton('phone_number', 1), makeButton('security_question', 2)],
      })}
      />,
    );
    expect(container.querySelector('[data-se="okta_email"]')).not.toBeNull();
    expect(container.querySelector('[data-se="phone_number"]')).not.toBeNull();
    expect(container.querySelector('[data-se="security_question"]')).not.toBeNull();
  });
});
