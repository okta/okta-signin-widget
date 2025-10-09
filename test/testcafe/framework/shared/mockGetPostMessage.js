Object.defineProperty(window, '__get$PostMessage', {
    value: () => function () {
        return function () {};
    }
});