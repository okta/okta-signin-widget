import WebauthnCustomInstructionsView from 'v2/view-builder/views/webauthn/WebauthnCustomInstructionsView';
import $sandbox from 'sandbox';

describe('v2/view-builder/views/webauthn/WebauthnCustomInstructionsView', function() {
  let testContext;
  
  beforeEach(function() {
    testContext = {};
  });

  afterEach(function() {
    $sandbox.empty();
  });

  it('renders additional instructions title and callout with description', function() {
    testContext.view = new WebauthnCustomInstructionsView({
      el: $sandbox,
      description: 'Insert your YubiKey and tap the button.',
    });
    testContext.view.render();
    
    expect(testContext.view.$('.additional-instructions-title').length).toBe(1);
    expect(testContext.view.$('.additional-instructions-title').text().trim()).toBe('Additional instructions from your administrator:');
    expect(testContext.view.$('.additional-instructions-callout').length).toBe(1);
    expect(testContext.view.$('.additional-instructions-callout').text().trim()).toBe(
      'Insert your YubiKey and tap the button.'
    );
  });

  it('does not render anything when description is not provided', function() {
    testContext.view = new WebauthnCustomInstructionsView({
      el: $sandbox,
    });
    testContext.view.render();
    
    expect(testContext.view.$('.additional-instructions-title').length).toBe(0);
    expect(testContext.view.$('.additional-instructions-callout').length).toBe(0);
  });
});
