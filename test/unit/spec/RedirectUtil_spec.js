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

      it('should redirect to a path', function (done) {
        var url = window.location.origin + '/path';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
    
        frame.addEventListener('load', function () {
          expect(frame.contentWindow.location.pathname).toBe('/path');
          expect(frame.contentWindow.location.search).toBe('');
          done();
        });

        form.submit();
      });

      it('should redirect to a path and query', function (done) {
        var url = window.location.origin + '/path/too?foo=bar&baz=1';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
    
        frame.addEventListener('load', function () {
          expect(frame.contentWindow.location.pathname).toBe('/path/too');
          expect(frame.contentWindow.location.search).toBe('?foo=bar&baz=1');
          done();
        });

        form.submit();
      });

      it('should redirect to a URL containing an escaped URL', function (done) {
        var url = window.location.origin + '/redirect?dest=https%3A%2F%2Fexample.com&foo=bar';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
    
        frame.addEventListener('load', function () {
          expect(frame.contentWindow.location.pathname).toBe('/redirect');
          expect(frame.contentWindow.location.search).toBe('?dest=https%3A%2F%2Fexample.com&foo=bar');
          done();
        });

        form.submit();
      });

      it('should redirect to a path with a query containing multiple same-named parameters', function (done) {
        var url = window.location.origin + '/path/too?foo=bar&baz=1&foo=two';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);
    
        frame.addEventListener('load', function () {
          expect(frame.contentWindow.location.pathname).toBe('/path/too');
          expect(frame.contentWindow.location.search).toBe('?foo=bar&baz=1&foo=two');
          done();
        });

        form.submit();
      });

      it('should redirect to a path and preserve a fragment', function (done) {
        var url = window.location.origin + '/path?foo=bar#baz';

        var form = RedirectUtil.buildDynamicForm(url);
        var frame = createTestIframe();
        frame.contentDocument.body.appendChild(form);

        frame.addEventListener('load', function () {
          expect(frame.contentWindow.location.pathname).toBe('/path');
          expect(frame.contentWindow.location.hash).toBe('#baz');
          expect(frame.contentWindow.location.search).toBe('?foo=bar');
          done();
        });

        form.submit();
      });
    });
  });
});
