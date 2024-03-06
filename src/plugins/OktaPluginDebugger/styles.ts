/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

export default `
  .siw-debugger-root-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    padding-bottom: 30px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    z-index: 1000;
    overflow: hidden;
    font-family: monospace;
    font-size: 12px;
  }

  .siw-debugger-hidden {
    display: none;
  }
  .siw-debugger-no-scroll {
    overflow: hidden;
  }
  .siw-debugger-selected {
    text-decoration: underline;
  }

  .siw-debugger-container {
    border: 1px solid gray;
    background-color: white;
    height: 100%;
    width: 100%;
    overflow: scroll;
    opacity: 0.95;
    background-color: white;
  }

  .siw-debugger-button {
    z-index: 1001;
    position: fixed;
    bottom: 0;
    left: 0;
  }

  .siw-copy-button {
    z-index: 1001;
    position: fixed;
    bottom: 0;
    left: 72px;
  }
  .siw-copy-textarea {
    z-index: 1001;
    position: fixed;
    bottom: 0;
    right: 0;
  }

  .siw-debugger-list {
  }

  .siw-debugger-list-item {
    position: relative;
  }

  .siw-debugger-list-item-details {
    white-space: pre-wrap;
    margin-left: 0;
    font-size: 11px;
  }
  .siw-debugger-list-item-header {
    white-space: pre-wrap;
    margin-left: 230px;
  }
  .siw-debugger-list-item-type {
    position: absolute;
    text-transform: uppercase;
  }
  .siw-debugger-list-item-title {
    font-weight: bold;
  }
  .siw-debugger-list-item-time {
    position: absolute;
    left: 44px;
  }

  .siw-debugger-list-item-debug {
    color: gray;
  }
  .siw-debugger-list-item-info {
    color: green;
  }
  .siw-debugger-list-item-warn {
    color: orange;
  }
  .siw-debugger-list-item-error {
    color: red;
  }
  .siw-debugger-list-item-xhr {
    background-color: #fafafa;
  }

  .siw-debugger-list-item-xhr .siw-debugger-list-item-details {
    color: #4e4e4e;
  }
  .siw-debugger-list-item-xhr .siw-switch-button {
    margin-left: 6px;
  }
`;