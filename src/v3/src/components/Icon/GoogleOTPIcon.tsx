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

import { FunctionComponent, h } from 'preact';

import { IconProps } from '../../types';

export const GoogleOTPIcon: FunctionComponent<IconProps> = ({ name, description }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    aria-labelledby={name}
    role="img"
    viewBox="0 0 48 48"
  >
    <title id={name}>{description}</title>
    <path
      fill="#F5F5F6"
      fillRule="evenodd"
      d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24Z"
      class="siwFillBg"
      clipRule="evenodd"
    />
    <path
      fill="#616161"
      d="M24 40.001c8.838 0 16.001-7.163 16.001-16S32.838 8 24.001 8 8 15.164 8 24c0 8.838 7.164 16.001 16 16.001Z"
    />
    <path
      fill="#9E9E9E"
      d="M24 34.182c-5.623 0-10.181-4.557-10.181-10.181 0-5.624 4.558-10.182 10.182-10.182 2.81 0 5.355 1.14 7.2 2.982l4.114-4.114A15.952 15.952 0 0 0 24 8C15.163 8 8 15.164 8 24c0 8.838 7.164 16.001 16 16.001 4.42 0 8.419-1.79 11.316-4.685l-4.114-4.114A10.164 10.164 0 0 1 24 34.182Z"
    />
    <path
      fill="#424242"
      d="M34.183 24H29.09a5.09 5.09 0 1 0-8.76 3.528l-.004.004 6.304 6.304.001.001c4.348-1.16 7.55-5.124 7.55-9.836Z"
    />
    <path
      fill="#616161"
      d="M40 24h-5.82c0 4.713-3.204 8.676-7.549 9.837l4.493 4.493C36.385 35.71 40 30.277 40 24Z"
    />
    <path
      fill="#212121"
      fillOpacity=".1"
      d="M24 39.818c-8.806 0-15.948-7.114-15.999-15.909L8 24.001c0 8.837 7.164 16 16 16 8.838 0 16.001-7.163 16.001-16L40 23.909c-.05 8.795-7.194 15.91-16 15.91Z"
    />
    <path
      fill="#fff"
      fillOpacity=".05"
      d="m26.634 33.837.141.142c4.273-1.207 7.408-5.134 7.408-9.797v-.181c0 4.712-3.204 8.675-7.55 9.836Z"
    />
    <path
      fill="#9E9E9E"
      d="M37.092 22.546H24a1.454 1.454 0 1 0 0 2.908h13.09a1.454 1.454 0 0 0 .002-2.908Z"
    />
    <path
      fill="#BDBDBD"
      d="M37.092 22.546H24a1.454 1.454 0 1 0 0 2.908h13.09a1.454 1.454 0 0 0 .002-2.908Z"
      opacity=".5"
    />
    <path
      fill="#BDBDBD"
      d="M10.909 25.091a1.09 1.09 0 1 0 0-2.181 1.09 1.09 0 0 0 0 2.181ZM24 12a1.09 1.09 0 1 0 0-2.182A1.09 1.09 0 0 0 24 12Zm0 26.182a1.09 1.09 0 1 0 0-2.181 1.09 1.09 0 0 0 0 2.181Zm-9.272-22.348a1.09 1.09 0 1 0 0-2.182 1.09 1.09 0 0 0 0 2.182Zm0 18.53a1.09 1.09 0 1 0 0-2.181 1.09 1.09 0 0 0 0 2.181Z"
    />
    <path
      fill="#757575"
      d="M33.274 34.364a1.09 1.09 0 1 0 0-2.181 1.09 1.09 0 0 0 0 2.181Z"
    />
    <path
      fill="#fff"
      fillOpacity=".2"
      d="M24 22.728h13.091c.773 0 1.404.603 1.45 1.364 0-.03.005-.06.005-.091 0-.804-.651-1.455-1.455-1.455h-13.09a1.454 1.454 0 0 0-1.45 1.546 1.451 1.451 0 0 1 1.45-1.364Z"
    />
    <path
      fill="#212121"
      fillOpacity=".2"
      d="M38.54 24.09a1.456 1.456 0 0 1-1.449 1.365h-13.09a1.452 1.452 0 0 1-1.45-1.364 1.454 1.454 0 0 0 1.45 1.545h13.09a1.454 1.454 0 0 0 1.45-1.545Z"
    />
    <path
      fill="#212121"
      fillOpacity=".1"
      d="M24 14c2.811 0 5.357 1.14 7.2 2.983l4.204-4.206-.09-.092L31.2 16.8a10.154 10.154 0 0 0-7.2-2.982c-5.623 0-10.181 4.557-10.181 10.181l.001.092C13.87 18.509 18.408 14 24 14Z"
    />
    <path
      fill="url(#paint0_radial_5_581)"
      d="M24 40.001c8.838 0 16.001-7.163 16.001-16S32.838 8 24.001 8 8 15.164 8 24c0 8.838 7.164 16.001 16 16.001Z"
    />
    <defs>
      <radialGradient
        id="paint0_radial_5_581"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="translate(12.692 12.656) scale(31.946)"
        gradientUnits="userSpaceOnUse"
      >
        <stop
          stopColor="#fff"
          stopOpacity=".1"
        />
        <stop
          offset="1"
          stopColor="#fff"
          stopOpacity="0"
        />
      </radialGradient>
    </defs>
  </svg>
);
