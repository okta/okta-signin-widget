declare const BackboneToRequestMethods: {
    readonly create: "POST";
    readonly delete: "DELETE";
    readonly patch: "PATCH";
    readonly read: "GET";
    readonly update: "PUT";
};
export declare type BackboneSyncRequestMethod = keyof typeof BackboneToRequestMethods;
export declare type RequestMethod = typeof BackboneToRequestMethods[BackboneSyncRequestMethod];
export declare const toRequestMethod: (backboneRequestMethod: BackboneSyncRequestMethod) => RequestMethod;
export {};
