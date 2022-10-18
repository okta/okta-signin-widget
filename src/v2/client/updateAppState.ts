import { IdxResponse } from "@okta/okta-auth-js";
import CookieUtil from '../../util/CookieUtil';
import AppState from '../models/AppState';
import sessionStorageHelper from './sessionStorageHelper';
import { interactionCodeFlow } from './interactionCodeFlow';
import { FORMS } from "../ion/RemediationConstants";
import transformIdxResponse from '../ion/transformIdxResponse';

function hasAuthenticationSucceeded(idxResponse: IdxResponse) {
  // Check whether authentication has succeeded. This is done by checking the server response
  // and seeing if either the 'success' or 'successWithInteractionCode' objects are present.
  return idxResponse?.rawIdxState?.success || idxResponse?.rawIdxState?.successWithInteractionCode;
}

/**
  * When "Remember My Username" is enabled, we save the identifier in a cookie
  * so that the next time the user visits the SIW, the identifier field can be 
  * pre-filled with this value.
  */
function updateIdentifierCookie(appState: AppState, idxResponse: IdxResponse) {
  const settings = appState.settings;
  if (settings.get('features.rememberMe')) {
    // Update the cookie with the identifier
    const user = idxResponse?.context?.user;
    const { identifier } = user?.value || {};
    if (identifier) {
      CookieUtil.setUsernameCookie(identifier);
    }
  } else {
    // We remove the cookie explicitly if this feature is disabled.
    CookieUtil.removeUsernameCookie();
  }    
}

export async function updateAppState(appState: AppState, idxResponse: IdxResponse): Promise<void> {
  const settings = appState.settings;

  // Only update the cookie when the user has successfully authenticated themselves 
  // to avoid incorrect/unnecessary updates.
  if (hasAuthenticationSucceeded(idxResponse) && settings.get('features.rememberMyUsernameOnOIE')) {
      updateIdentifierCookie(appState, idxResponse);
  }

  const lastResponse = appState.get('idx');
  const useInteractionCodeFlow = settings.get('useInteractionCodeFlow');
  if (useInteractionCodeFlow) {
    if (idxResponse.interactionCode) {
      // Although session.stateHandle isn't used by interation flow,
      // it's better to clean up at the end of the flow.
      sessionStorageHelper.removeStateHandle();
      // This is the end of the IDX flow, now entering OAuth
      const tokens = await interactionCodeFlow(settings, idxResponse);
      // reset terminal view in case the were OAuth errors prior to successful token retrieval
      if (appState.get('currentFormName') === FORMS.TERMINAL) {
        appState.unset('currentFormName', { silent: true });
      }
      return tokens;
    }  
  } else {
    // Do not save state handle for the first page loads.
    // Because there shall be no difference between following behavior
    // 1. bootstrap widget
    //    -> save state handle to session storage
    //    -> refresh page
    //    -> introspect using sessionStorage.stateHandle
    // 2. bootstrap widget
    //    -> do not save state handle to session storage
    //    -> refresh page
    //    -> introspect using options.stateHandle
    if (lastResponse) {
      sessionStorageHelper.setStateHandle(idxResponse?.context?.stateHandle);
    }
    // Login flows that mimic step up (moving forward in login pipeline) via internal api calls,
    // need to clear stored stateHandles.
    // This way the flow can maintain the latest state handle. For eg. Device probe calls
    if (appState.get('currentFormName') === FORMS.CANCEL_TRANSACTION) {
      sessionStorageHelper.removeStateHandle();
    }
  }

  // transform response
  const ionResponse = transformIdxResponse(settings, idxResponse, lastResponse);

  await appState.setIonResponse(ionResponse);
}
