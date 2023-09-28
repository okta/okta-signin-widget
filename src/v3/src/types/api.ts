import { OktaAuthIdxInterface, Tokens } from '@okta/okta-auth-js';

import { RenderOptions, WidgetOptions } from './widget';
import {
  HooksAPI,
  RenderErrorCallback,
  RenderResult,
  RenderSuccessCallback,
  RouterEventsAPI,
} from '../../../types';

// Keep a duplicate OktaSignInAPI interface because the version of auth-js differs between
// Gen3 and Gen2 so there are type mismatches in their exposed type interfaces
export interface OktaSignInAPI extends HooksAPI, RouterEventsAPI {
  // Gen3 only
  readonly options: Pick<WidgetOptions, 'brandName'>;

  // Gen3 supports only IDX
  authClient: OktaAuthIdxInterface;
  show(): void;
  hide(): void;
  remove(): void;
  showSignIn(options: RenderOptions): Promise<RenderResult>;
  showSignInToGetTokens(options: RenderOptions): Promise<Tokens>;
  showSignInAndRedirect(options: RenderOptions): Promise<void>;
  renderEl(
    options: RenderOptions,
    success?: RenderSuccessCallback,
    error?: RenderErrorCallback
  ): Promise<RenderResult>;

  getUser(): void
}
