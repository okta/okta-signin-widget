import { OktaSignInAPI } from '../types/api';
import { EventContext } from '../types/events';
import { WidgetOptions } from '../types/options';

/**
 * This plugin improves the accessibility (a11y) of the Okta sign in widget to
 * comply with WCAG2.1AA (https://www.w3.org/TR/WCAG21/) standards and Section
 * 508 (https://www.section508.gov/)
 *
 * @param widget instance of OktaSignIn
 * @param options options for a11y plugin
 */
export const init = (widget: OktaSignInAPI & { options: WidgetOptions }): void => {
  const brandName = widget.options?.brandName;

  widget.on('afterRender', function (context: EventContext) {
    const title = document.querySelector('.okta-form-title')?.textContent;
    if (title) {
      document.title = brandName ? `${brandName} - ${title}` : title;
    }

    function setAttrs(selector: string, attributes: Record<string, string>) {
      const elements = document.querySelectorAll(selector) || [];
      const keys = Object.keys(attributes) || [];
      elements.forEach((el) => {
        keys.forEach((key) => {
          el.setAttribute(key, attributes[key]);
        })
      });
    }

    /**
     * Hide authenticator icon from screen readers to prevent redundancy. The 
     * sibling element .authenticator-description conveys the same information.
     * 
     * https://www.w3.org/WAI/tutorials/images/decision-tree/
     * https://www.w3.org/WAI/tutorials/images/decorative/
     */
    document.querySelectorAll('.authenticator-list').forEach((list) => {
      list.querySelectorAll('.authenticator-row')
        .forEach((row) => {
          row.querySelector('.authenticator-icon')
            ?.setAttribute('aria-hidden', '');
        });
    });

    // identify page autocomplete attrs
    setAttrs('input[name="identifier"]', { autocomplete: 'username' });

    // register page autocomplete attrs
    setAttrs('input[name="userProfile.email"]', { autocomplete: 'email' });
    setAttrs('input[name="userProfile.lastName"]', { autocomplete: 'family-name' });
    setAttrs('input[name="userProfile.firstName"]', { autocomplete: 'given-name' });

    document.querySelectorAll('.password-toggle')
      .forEach((toggle) => {
        const container = toggle.parentNode;
        if (!container) {
          // should not be reached
          console.warn('Could not find parent node of ".password-toggle"');
          return;
        }

        // find the <input> element
        const input = container?.querySelector<HTMLInputElement>('.password-with-toggle');

        if (!input) {
          // should not be reached
          console.warn('Could not find input element ".password-with-toggle"');
          return;
        }

        // NOTE: replace <span> (non-interactive) elements with buttons to make
        // them keyboard-focusable and set appropriate aria atttributes/roles
        const children = [...toggle.children];
        children.forEach((span) => toggle.removeChild(span)); // FIXME
        const button = document.createElement('button');
        const updateButton = () => {
          const isVisible = input.type !== 'password';
          button.type = 'button';
          if (isVisible) {
            button.ariaLabel = 'Hide password';
            button.className = 'eyeicon visibility-off-16';
          } else {
            button.ariaLabel = 'Show password';
            button.className = 'eyeicon visibility-16';
          }
        };
        updateButton();
        button.onclick = () => {
          input.type = input.type === 'password' ? 'text' : 'password';
          updateButton();
        }
        toggle.appendChild(button);
      });

    // Pages with "resend" links/buttons that appear after a delay (default: 30s),
    // e.g., "Resend email", "Resend SMS"
    const RESEND_PAGES = [
      {
        controller: 'mfa-verify-passcode',
        formName: 'challenge-authenticator',
        authenticatorKey: 'phone_number',
        methodType: 'sms',
      },
      {
        controller: "enroll-email",
        formName: "enroll-authenticator",
        authenticatorKey: "okta_email",
        methodType: "email"
      },
      {
        controller: "mfa-verify",
        formName: "challenge-poll",
        authenticatorKey: "okta_verify",
        methodType: "push"
      },
      {
        controller: "forgot-password",
        formName: "identify-recovery"
      },
    ];

    // cheap check for shallow equality
    const isEqual = (a,b) => [...Object.keys(a)].every((k) => a[k] === b[k]);

    if (RESEND_PAGES.some(page => isEqual(page, context))) {
      let count = 0;
      const intervalWarning = setInterval(() => {
        console.log('interval: infobox-warning')
        if (document.querySelector('.infobox-warning')) {
          document.querySelectorAll('.infobox-warning')
            .forEach((box) => {
              if (count === 0) {
                // element already exists in DOM, just hidden, set aria
                box.setAttribute('aria-live', 'assertive');
              } else {
                // remove
                const parent = box.parentElement;
                parent?.removeChild(box);
                box.setAttribute('aria-live', 'assertive');
                parent?.appendChild(box);
              }
            })
          console.log('clearing interval: infobox-warning')
          clearInterval(intervalWarning)
        }
        count++;
      }, 1500);

      const intervalResend = setInterval(() => {
        if (document.querySelector('.resend-link')) {
          console.log('interval: resend-link')
          document.querySelectorAll('.resend-link')
            .forEach((link) => link.setAttribute('href', 'javascript:void(0);'))
          console.log('clearing interval: resend-link')
          clearInterval(intervalResend)
        }
      }, 1500);
    }
  });
}
