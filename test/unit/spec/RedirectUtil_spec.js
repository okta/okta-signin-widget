define([
  'util/RedirectUtil'
],
function (RedirectUtil) {

  describe('util/RedirectUtil', function () {

    describe('buildDynamicForm', function () {
      it('returns an element', function () {
        var form = RedirectUtil.buildDynamicForm('https://example.com');
        expect(form).not.toBeUndefined();
      });

      it('returns a form whose method is GET', function () {
        var form = RedirectUtil.buildDynamicForm('https://example.com/path?foo=bar');
        expect(form.method).toBe('get');
      });

      it('returns a form whose action is the URL minus query', function () {
        var form = RedirectUtil.buildDynamicForm('https://example.com/path?foo=bar');
        expect(form.action).toBe('https://example.com/path');
      });
    });

    describe('buildDynamicForm redirection', function () {
      function createTestIframe () {
        var frame = document.createElement('iframe');
        frame.style = 'display: none;';
        document.body.appendChild(frame);

        frame.contentDocument.open();
        frame.contentDocument.write('<html><body></body></html>');
        frame.contentDocument.close();
        
        return frame;
      }

      var wait = 25;

      it('should redirect to a path', function (done) {
        var url = window.location.origin + '/path';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
        form.submit();
    
        setTimeout(() => {
          expect(frame.contentWindow.location.pathname).toBe('/path');
          expect(frame.contentWindow.location.search).toBe('');
          done();
        }, wait);
      });

      it('should redirect to a path and query', function (done) {
        var url = window.location.origin + '/path/too?foo=bar&baz=1';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
        form.submit();
    
        setTimeout(() => {
          expect(frame.contentWindow.location.pathname).toBe('/path/too');
          expect(frame.contentWindow.location.search).toBe('?foo=bar&baz=1');
          done();
        }, wait);
      });

      it('should redirect to a URL containing an escaped URL', function (done) {
        var url = window.location.origin + '/redirect?dest=https%3A%2F%2Fexample.com&foo=bar';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
        form.submit();
    
        setTimeout(() => {
          expect(frame.contentWindow.location.pathname).toBe('/redirect');
          expect(frame.contentWindow.location.search).toBe('?dest=https%3A%2F%2Fexample.com&foo=bar');
          done();
        }, wait);
      });

      it('should redirect to a path with a query containing multiple same-named parameters', function (done) {
        var url = window.location.origin + '/path/too?foo=bar&baz=1&foo=two';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
        form.submit();
    
        setTimeout(() => {
          expect(frame.contentWindow.location.pathname).toBe('/path/too');
          expect(frame.contentWindow.location.search).toBe('?foo=bar&baz=1&foo=two');
          done();
        }, wait);
      });
    });
  });
});
