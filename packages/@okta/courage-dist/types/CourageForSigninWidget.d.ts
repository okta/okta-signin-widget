import BaseModel from './courage/models/BaseModel';
import Model from './courage/models/Model';
import Handlebars from './courage/util/handlebars-wrapper';
import $ from './courage/util/jquery-wrapper';
import _ from './courage/util/underscore-wrapper';
import ListView from './courage/views/Backbone.ListView';
import Backbone from 'backbone';
import FrameworkView from './courage/framework/View';
import './util/scrollParent';
declare const Form: import("./courage/views/BaseView").BaseViewConstructor<import("./courage/views/BaseView").BaseViewInstance>;
declare const loc: (key: any, bundleName?: any, params?: any) => any;
declare const createButton: (options: any) => import("./courage/views/BaseView").BaseViewConstructor<import("./courage/views/BaseView").BaseViewInstance>;
declare const createCallout: (options: any) => import("./courage/views/BaseView").BaseViewInstance;
declare const registerInput: (type: any, input: import("./courage/views/forms/BaseInput").BaseInputConstructor) => void;
declare const Collection: any;
declare const View: import("./courage/views/BaseView").BaseViewConstructor<import("./courage/views/BaseView").BaseViewInstance>;
declare const Router: import("./courage/util/BaseRouter").BaseRouterConstructor;
declare const Controller: import("./courage/util/BaseController").BaseControllerConstructor<import("./courage/util/BaseController").BaseControllerInstance>;
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
export * from './courage/models/Model';
export * from './courage/util/BaseRouter';
export * from './courage/util/SettingsModel';
export * from './courage/util/jquery-wrapper';
export * from './courage/util/underscore-wrapper';
