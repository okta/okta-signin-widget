/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const addClassNamesByAttr = require('./svgo-plugins/addClassNamesByAttr');

const PRIMARY = '#00297A';
const SECONDARY = '#A7B5EC';

module.exports = {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: true,
  },
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'removeUselessDefs',
    'cleanupNumericValues',
    'convertColors',
    {
      name: 'removeUnknownsAndDefaults',
      params: {
        keepRoleAttr: true,
      },
    },
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortDefsChildren',
    'sortAttrs',
    {
      ...addClassNamesByAttr,
      params: {
        rules: [
          {
            test: (el) => new RegExp(PRIMARY, 'i')
              .test(el.attributes && el.attributes.fill),
            classNames: ['siwFillPrimary'],
          },
          {
            test: (el) => new RegExp(SECONDARY, 'i')
              .test(el.attributes && el.attributes.fill),
            classNames: ['siwFillSecondary'],
          },
        ],
      },
    },
  ],
};
