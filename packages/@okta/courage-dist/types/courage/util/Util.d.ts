declare const _default: {
    redirect: (url: any) => void;
    reloadPage: () => void;
    constantError: (errorMessage: any) => () => never;
    /**
     * Simply convert an URL query key value pair object into an URL query string.
     * Remember NOT to escape the query string when using this util.
     * example:
     * input: {userId: 123, instanceId: undefined, expand: 'schema,app'}
     * output: '?userId=123&expand=schema,app'
     */
    getUrlQueryString: (queries: any) => string;
    isABaseView(obj: any): boolean;
    isSafari(): boolean;
};
export default _default;
