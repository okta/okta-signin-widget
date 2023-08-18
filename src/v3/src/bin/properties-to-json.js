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

const path = require('path');
const {
  ensureDirSync,
  readFileSync,
  readdirSync,
  removeSync,
  writeFileSync,
} = require('fs-extra');
const properties = require('properties');

const PROPERTIES_EXTENSION = '.properties';
const JSON_EXTENSION = '.json';

const getPropertiesFiles = (src) => {
  const fileNames = readdirSync(src);
  // get relative paths to files
  const filePaths = fileNames.map((file) => path.join(src, file));
  // only list files with correct extension
  const propertiesFilesPaths = filePaths.filter(
    (file) => path.extname(file) === PROPERTIES_EXTENSION,
  );

  return propertiesFilesPaths;
};

const propertiesToJson = (options) => {
  const {
    src,
    dest,
  } = options;
  // ensure src exists
  ensureDirSync(src);
  // clear out dest dir
  removeSync(dest);
  ensureDirSync(dest);

  const propertiesFiles = getPropertiesFiles(src);

  // process each file and write it to dest as .json
  propertiesFiles.forEach((file) => {
    const fileData = `${readFileSync(file)}`;

    properties.parse(fileData, (error, obj) => {
      if (error) { throw error; }

      const targetFile = path.join(
        dest,
        path.basename(file).replace(PROPERTIES_EXTENSION, JSON_EXTENSION),
      );

      writeFileSync(targetFile, JSON.stringify(obj));
    });
  });
};

propertiesToJson({ src: './src/properties', dest: './src/properties/json' });
