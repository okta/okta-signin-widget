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

export const ClearIcon: FunctionComponent<IconProps> = ({
  name, description, width, height,
}) => (
  <svg
    width={width || 36}
    height={height || 36}
    viewBox="0 0 52 49"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    role="img"
  >
    <title id={name}>{description}</title>
    <path d="M2.0391 26.4876C3.16526 26.4876 4.0782 25.5766 4.0782 24.4528C4.0782 23.329 3.16526 22.418 2.0391 22.418C0.912935 22.418 0 23.329 0 24.4528C0 25.5766 0.912935 26.4876 2.0391 26.4876Z" fill="#041A55"/>
    <path d="M11.2134 26.4876C12.3396 26.4876 13.2525 25.5766 13.2525 24.4528C13.2525 23.329 12.3396 22.418 11.2134 22.418C10.0873 22.418 9.17432 23.329 9.17432 24.4528C9.17432 25.5766 10.0873 26.4876 11.2134 26.4876Z" fill="#041A55"/>
    <path d="M7.4556 32.4906C8.58176 32.4906 9.4947 31.5795 9.4947 30.4557C9.4947 29.3319 8.58176 28.4209 7.4556 28.4209C6.32944 28.4209 5.4165 29.3319 5.4165 30.4557C5.4165 31.5795 6.32944 32.4906 7.4556 32.4906Z" fill="#041A55"/>
    <path d="M14.0542 35.097C15.1804 35.097 16.0933 34.186 16.0933 33.0622C16.0933 31.9384 15.1804 31.0273 14.0542 31.0273C12.9281 31.0273 12.0151 31.9384 12.0151 33.0622C12.0151 34.186 12.9281 35.097 14.0542 35.097Z" fill="#041A55"/>
    <path d="M14.4585 42.2044C15.5847 42.2044 16.4976 41.2934 16.4976 40.1696C16.4976 39.0458 15.5847 38.1348 14.4585 38.1348C13.3324 38.1348 12.4194 39.0458 12.4194 40.1696C12.4194 41.2934 13.3324 42.2044 14.4585 42.2044Z" fill="#041A55"/>
    <path d="M7.4556 20.4788C8.58176 20.4788 9.4947 19.5678 9.4947 18.444C9.4947 17.3202 8.58176 16.4092 7.4556 16.4092C6.32944 16.4092 5.4165 17.3202 5.4165 18.444C5.4165 19.5678 6.32944 20.4788 7.4556 20.4788Z" fill="#041A55"/>
    <path d="M6.62357 12.5941C7.74973 12.5941 8.66267 11.6831 8.66267 10.5592C8.66267 9.43544 7.74973 8.52441 6.62357 8.52441C5.49741 8.52441 4.58447 9.43544 4.58447 10.5592C4.58447 11.6831 5.49741 12.5941 6.62357 12.5941Z" fill="#041A55"/>
    <path d="M14.0542 17.8167C15.1804 17.8167 16.0933 16.9057 16.0933 15.7819C16.0933 14.6581 15.1804 13.7471 14.0542 13.7471C12.9281 13.7471 12.0151 14.6581 12.0151 15.7819C12.0151 16.9057 12.9281 17.8167 14.0542 17.8167Z" fill="#041A55"/>
    <path d="M14.3174 10.9867C15.4436 10.9867 16.3565 10.0756 16.3565 8.95183C16.3565 7.82802 15.4436 6.91699 14.3174 6.91699C13.1913 6.91699 12.2783 7.82802 12.2783 8.95183C12.2783 10.0756 13.1913 10.9867 14.3174 10.9867Z" fill="#041A55"/>
    <path d="M21.2242 12.5941C22.3503 12.5941 23.2633 11.6831 23.2633 10.5592C23.2633 9.43544 22.3503 8.52441 21.2242 8.52441C20.098 8.52441 19.1851 9.43544 19.1851 10.5592C19.1851 11.6831 20.098 12.5941 21.2242 12.5941Z" fill="#041A55"/>
    <path d="M30.1138 12.5941C31.24 12.5941 32.1529 11.6831 32.1529 10.5592C32.1529 9.43544 31.24 8.52441 30.1138 8.52441C28.9876 8.52441 28.0747 9.43544 28.0747 10.5592C28.0747 11.6831 28.9876 12.5941 30.1138 12.5941Z" fill="#041A55"/>
    <path d="M36.8462 10.8997C37.9724 10.8997 38.8853 9.98872 38.8853 8.86491C38.8853 7.7411 37.9724 6.83008 36.8462 6.83008C35.7201 6.83008 34.8071 7.7411 34.8071 8.86491C34.8071 9.98872 35.7201 10.8997 36.8462 10.8997Z" fill="#041A55"/>
    <path d="M37.3086 17.9564C38.4348 17.9564 39.3477 17.0454 39.3477 15.9216C39.3477 14.7977 38.4348 13.8867 37.3086 13.8867C36.1825 13.8867 35.2695 14.7977 35.2695 15.9216C35.2695 17.0454 36.1825 17.9564 37.3086 17.9564Z" fill="#041A55"/>
    <path d="M43.9087 20.4788C45.0349 20.4788 45.9478 19.5678 45.9478 18.444C45.9478 17.3202 45.0349 16.4092 43.9087 16.4092C42.7826 16.4092 41.8696 17.3202 41.8696 18.444C41.8696 19.5678 42.7826 20.4788 43.9087 20.4788Z" fill="#041A55"/>
    <path d="M43.9087 32.4906C45.0349 32.4906 45.9478 31.5795 45.9478 30.4557C45.9478 29.3319 45.0349 28.4209 43.9087 28.4209C42.7826 28.4209 41.8696 29.3319 41.8696 30.4557C41.8696 31.5795 42.7826 32.4906 43.9087 32.4906Z" fill="#041A55"/>
    <path d="M37.3086 35.1175C38.4348 35.1175 39.3477 34.2065 39.3477 33.0827C39.3477 31.9589 38.4348 31.0479 37.3086 31.0479C36.1825 31.0479 35.2695 31.9589 35.2695 33.0827C35.2695 34.2065 36.1825 35.1175 37.3086 35.1175Z" fill="#041A55"/>
    <path d="M44.8164 40.3822C45.9426 40.3822 46.8555 39.4711 46.8555 38.3473C46.8555 37.2235 45.9426 36.3125 44.8164 36.3125C43.6903 36.3125 42.7773 37.2235 42.7773 38.3473C42.7773 39.4711 43.6903 40.3822 44.8164 40.3822Z" fill="#041A55"/>
    <path d="M30.1138 40.3822C31.24 40.3822 32.1529 39.4711 32.1529 38.3473C32.1529 37.2235 31.24 36.3125 30.1138 36.3125C28.9876 36.3125 28.0747 37.2235 28.0747 38.3473C28.0747 39.4711 28.9876 40.3822 30.1138 40.3822Z" fill="#041A55"/>
    <path d="M21.2242 40.3822C22.3503 40.3822 23.2633 39.4711 23.2633 38.3473C23.2633 37.2235 22.3503 36.3125 21.2242 36.3125C20.098 36.3125 19.1851 37.2235 19.1851 38.3473C19.1851 39.4711 20.098 40.3822 21.2242 40.3822Z" fill="#041A55"/>
    <path d="M6.564 40.3822C7.69016 40.3822 8.6031 39.4711 8.6031 38.3473C8.6031 37.2235 7.69016 36.3125 6.564 36.3125C5.43784 36.3125 4.5249 37.2235 4.5249 38.3473C4.5249 39.4711 5.43784 40.3822 6.564 40.3822Z" fill="#041A55"/>
    <path d="M36.8462 42.2044C37.9724 42.2044 38.8853 41.2934 38.8853 40.1696C38.8853 39.0458 37.9724 38.1348 36.8462 38.1348C35.7201 38.1348 34.8071 39.0458 34.8071 40.1696C34.8071 41.2934 35.7201 42.2044 36.8462 42.2044Z" fill="#041A55"/>
    <path d="M25.6431 45.7923C26.7693 45.7923 27.6822 44.8813 27.6822 43.7575C27.6822 42.6337 26.7693 41.7227 25.6431 41.7227C24.5169 41.7227 23.604 42.6337 23.604 43.7575C23.604 44.8813 24.5169 45.7923 25.6431 45.7923Z" fill="#041A55"/>
    <path d="M32.9673 49.0013C34.0935 49.0013 35.0064 48.0903 35.0064 46.9665C35.0064 45.8427 34.0935 44.9316 32.9673 44.9316C31.8412 44.9316 30.9282 45.8427 30.9282 46.9665C30.9282 48.0903 31.8412 49.0013 32.9673 49.0013Z" fill="#041A55"/>
    <path d="M18.4117 49.0013C19.5378 49.0013 20.4508 48.0903 20.4508 46.9665C20.4508 45.8427 19.5378 44.9316 18.4117 44.9316C17.2855 44.9316 16.3726 45.8427 16.3726 46.9665C16.3726 48.0903 17.2855 49.0013 18.4117 49.0013Z" fill="#041A55"/>
    <path d="M40.2105 26.4876C41.3366 26.4876 42.2496 25.5766 42.2496 24.4528C42.2496 23.329 41.3366 22.418 40.2105 22.418C39.0843 22.418 38.1714 23.329 38.1714 24.4528C38.1714 25.5766 39.0843 26.4876 40.2105 26.4876Z" fill="#041A55"/>
    <path d="M49.334 26.4876C50.4602 26.4876 51.3731 25.5766 51.3731 24.4528C51.3731 23.329 50.4602 22.418 49.334 22.418C48.2079 22.418 47.2949 23.329 47.2949 24.4528C47.2949 25.5766 48.2079 26.4876 49.334 26.4876Z" fill="#041A55"/>
    <path d="M44.815 12.5941C45.9411 12.5941 46.8541 11.6831 46.8541 10.5592C46.8541 9.43544 45.9411 8.52441 44.815 8.52441C43.6888 8.52441 42.7759 9.43544 42.7759 10.5592C42.7759 11.6831 43.6888 12.5941 44.815 12.5941Z" fill="#041A55"/>
    <path d="M25.6431 7.18588C26.7693 7.18588 27.6822 6.27485 27.6822 5.15104C27.6822 4.02724 26.7693 3.11621 25.6431 3.11621C24.5169 3.11621 23.604 4.02724 23.604 5.15104C23.604 6.27485 24.5169 7.18588 25.6431 7.18588Z" fill="#041A55"/>
    <path d="M18.355 4.06967C19.4812 4.06967 20.3941 3.15864 20.3941 2.03483C20.3941 0.911026 19.4812 0 18.355 0C17.2289 0 16.3159 0.911026 16.3159 2.03483C16.3159 3.15864 17.2289 4.06967 18.355 4.06967Z" fill="#041A55"/>
    <path d="M32.9878 4.06967C34.114 4.06967 35.0269 3.15864 35.0269 2.03483C35.0269 0.911026 34.114 0 32.9878 0C31.8617 0 30.9487 0.911026 30.9487 2.03483C30.9487 3.15864 31.8617 4.06967 32.9878 4.06967Z" fill="#041A55"/>
  </svg>
);
