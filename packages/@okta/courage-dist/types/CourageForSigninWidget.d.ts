import BaseModel from './courage/models/BaseModel';
import Model from './courage/models/Model';
import Handlebars from './courage/util/handlebars-wrapper';
import $ from './courage/util/jquery-wrapper';
import _ from './courage/util/underscore-wrapper';
import ListView from './courage/views/Backbone.ListView';
import Backbone from 'backbone';
import FrameworkView from './courage/framework/View';
import './util/scrollParent';
declare const Form: any;
declare const loc: (key: any, bundleName?: any, params?: any) => any;
declare const createButton: (options: any) => any;
declare const createCallout: (options: any) => any;
declare const registerInput: (type: any, input: import("./courage/views/forms/BaseInput").BaseInputClass) => void;
declare const Collection: typeof import("./courage/models/BaseCollection").BaseCollectionClass;
declare const View: typeof import("./courage/views/BaseView").BaseViewClass;
declare const Router: typeof import("./courage/util/BaseRouter").BaseRouterClass;
declare const Controller: typeof import("./courage/util/BaseController").BaseControllerClass;
export interface Internal {
    util: any;
    views: {
        components: any;
        forms: {
            helpers: any;
            components: any;
            inputs: any;
        };
    };
    models: any;
}
declare const internal: Internal;
export { Backbone, $, _, Handlebars, loc, createButton, createCallout, registerInput, Model, BaseModel, Collection, FrameworkView, View, ListView, Router, Controller, Form, internal, };
export * from './courage/views/forms/types';
export * from './courage/framework/Model';
export * from './courage/models/Model';
export * from './courage/util/BaseRouter';
export * from './courage/util/SettingsModel';
export * from './courage/util/jquery-wrapper';
export * from './courage/util/underscore-wrapper';
