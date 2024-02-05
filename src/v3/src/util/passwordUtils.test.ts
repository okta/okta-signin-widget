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

import { UserInfo } from 'src/types';

import { validatePassword } from './passwordUtils';

describe('PasswordUtils Tests', () => {
  let userInfo: UserInfo;

  beforeEach(() => {
    userInfo = {};
  });

  it('should validate minLength', () => {
    expect(validatePassword('somepass', userInfo, { complexity: { minLength: 8 } })?.minLength)
      .toEqual(true);
    expect(validatePassword('somepass', userInfo, { complexity: { minLength: 12 } })?.minLength)
      .toEqual(false);
    expect(validatePassword('   ', userInfo, { complexity: { minLength: 3 } })?.minLength)
      .toEqual(true);
    expect(validatePassword('____', userInfo, { complexity: { minLength: 3 } })?.minLength)
      .toEqual(true);
  });

  it('should validate lowerCase', () => {
    expect(validatePassword('anotherpass', userInfo, { complexity: { minLowerCase: 1 } })?.minLowerCase)
      .toEqual(true);
    expect(validatePassword('PASS', userInfo, { complexity: { minLowerCase: 1 } })?.minLowerCase)
      .toEqual(false);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { minLowerCase: 1 } })?.minLowerCase)
      .toEqual(false);
    expect(validatePassword('   ', userInfo, { complexity: { minLowerCase: 1 } })?.minLowerCase)
      .toEqual(false);
    expect(validatePassword('asdf', userInfo, { complexity: { minLowerCase: 0 } })?.minLowerCase)
      .toEqual(true);
    expect(validatePassword('!@#$', userInfo, { complexity: { minLowerCase: 0 } })?.minLowerCase)
      .toEqual(true);
    expect(validatePassword('1234', userInfo, { complexity: { minLowerCase: 0 } })?.minLowerCase)
      .toEqual(true);
  });

  it('should validate upperCase', () => {
    expect(validatePassword('anotherpass', userInfo, { complexity: { minUpperCase: 1 } })?.minUpperCase)
      .toEqual(false);
    expect(validatePassword('PASS', userInfo, { complexity: { minUpperCase: 1 } })?.minUpperCase)
      .toEqual(true);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { minUpperCase: 1 } })?.minUpperCase)
      .toEqual(false);
    expect(validatePassword('   ', userInfo, { complexity: { minUpperCase: 1 } })?.minUpperCase)
      .toEqual(false);
    expect(validatePassword('asdf', userInfo, { complexity: { minUpperCase: 0 } })?.minUpperCase)
      .toEqual(true);
    expect(validatePassword('!@#$', userInfo, { complexity: { minUpperCase: 0 } })?.minUpperCase)
      .toEqual(true);
    expect(validatePassword('1234', userInfo, { complexity: { minUpperCase: 0 } })?.minUpperCase)
      .toEqual(true);
  });

  it('should validate minNumber', () => {
    expect(validatePassword('anotherpass', userInfo, { complexity: { minNumber: 1 } })?.minNumber)
      .toEqual(false);
    expect(validatePassword('PASS', userInfo, { complexity: { minNumber: 1 } })?.minNumber)
      .toEqual(false);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { minNumber: 1 } })?.minNumber)
      .toEqual(false);
    expect(validatePassword('123abc', userInfo, { complexity: { minNumber: 1 } })?.minNumber)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { minNumber: 1 } })?.minNumber)
      .toEqual(false);
    expect(validatePassword('asdf', userInfo, { complexity: { minNumber: 0 } })?.minNumber)
      .toEqual(true);
    expect(validatePassword('!@#$', userInfo, { complexity: { minNumber: 0 } })?.minNumber)
      .toEqual(true);
    expect(validatePassword('1234', userInfo, { complexity: { minNumber: 0 } })?.minNumber)
      .toEqual(true);
  });

  it('should validate minSymbol', () => {
    const passwordsWithValidSymbol = [
      'somePass"', 'somePass!', 'somePass#', 'somePass#', 'somePass$', 'somePass%',
      'somePass&', 'somePass\'', 'somePass(', 'somePass)', 'somePass*', 'somePass+',
      'somePass,', 'somePass-', 'somePass.', 'somePass/', 'somePass\\', 'somePass;',
      'somePass:', 'somePass<', 'somePass=', 'somePass>', 'somePass?', 'somePass@',
      'somePass[', 'somePass]', 'somePass^', 'somePass_', 'somePass`', 'somePass{',
      'somePass|', 'somePass}', 'somePass~',
    ];
    passwordsWithValidSymbol.forEach((password) => {
      expect(validatePassword(password, userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
        .toEqual(true);
    });
    expect(validatePassword('anotherpass', userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
      .toEqual(false);
    expect(validatePassword('   ', userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
      .toEqual(false);
    expect(validatePassword('1234', userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
      .toEqual(false);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { minSymbol: 0 } })?.minSymbol)
      .toEqual(true);
    expect(validatePassword('123abc', userInfo, { complexity: { minSymbol: 0 } })?.minSymbol)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { minSymbol: 0 } })?.minSymbol)
      .toEqual(true);
    expect(validatePassword('testpass', userInfo, { complexity: { minSymbol: 0 } })?.minSymbol)
      .toEqual(true);
  });

  it('should fail password validation when spaces are used and a symbol is required', () => {
    expect(validatePassword('   ', userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
      .toEqual(false);
    expect(validatePassword(' somePassword  ', userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
      .toEqual(false);
    expect(validatePassword('another password ', userInfo, { complexity: { minSymbol: 1 } })?.minSymbol)
      .toEqual(false);
  });

  describe('Validate ExcludeAttributes', () => {
    it('should validate excludeAttributes when username is to be excluded', () => {
      userInfo = { identifier: 'tester.user+123@okta.com' };

      expect(validatePassword('tester.user', userInfo, { complexity: { excludeAttributes: ['username'] } })?.username)
        .toEqual(false);
      expect(validatePassword('tester.user@okta.com', userInfo, { complexity: { excludeAttributes: ['username'] } })?.username)
        .toEqual(false);
      expect(validatePassword('tester.user+123@okta.com', userInfo, { complexity: { excludeAttributes: ['username'] } })?.username)
        .toEqual(false);
    });

    it('should validate excludeAttributes when firstName is to be excluded', () => {
      userInfo = { profile: { firstName: 'Tester', lastName: 'Doe' } };

      expect(validatePassword('anotherpass', userInfo, {
        complexity: { excludeAttributes: ['firstName'] },
      })?.firstName).toEqual(true);
      expect(validatePassword('xxTesterxx', userInfo, {
        complexity: { excludeAttributes: ['firstName'] },
      })?.firstName).toEqual(false);
      expect(validatePassword('abcdTester', userInfo, {
        complexity: { excludeAttributes: ['firstName'] },
      })?.firstName).toEqual(false);
      expect(validatePassword('Testerabcd', userInfo, {
        complexity: { excludeAttributes: ['firstName'] },
      })?.firstName).toEqual(false);
      expect(validatePassword('Doe', userInfo, {
        complexity: { excludeAttributes: ['firstName'] },
      })?.firstName).toEqual(true);
    });

    it('should validate excludeAttributes when lastName is to be excluded', () => {
      userInfo = { profile: { firstName: 'John', lastName: 'McTesterson' } };

      expect(validatePassword('anotherpass', userInfo, {
        complexity: { excludeAttributes: ['lastName'] },
      })?.lastName).toEqual(true);
      expect(validatePassword('xxMcTestersonxx', userInfo, {
        complexity: { excludeAttributes: ['lastName'] },
      })?.lastName).toEqual(false);
      expect(validatePassword('abcdMcTesterson', userInfo, {
        complexity: { excludeAttributes: ['lastName'] },
      })?.lastName).toEqual(false);
      expect(validatePassword('McTestersonabcd', userInfo, {
        complexity: { excludeAttributes: ['lastName'] },
      })?.lastName).toEqual(false);
      expect(validatePassword('John', userInfo, {
        complexity: { excludeAttributes: ['lastName'] },
      })?.lastName).toEqual(true);
    });

    it('should validate excludeAttributes when firstName & lastName are to be excluded', () => {
      userInfo = { profile: { firstName: 'John', lastName: 'McTesterson' } };

      expect(validatePassword('anotherpass', userInfo, {
        complexity: { excludeAttributes: ['firstName', 'lastName'] },
      })).toEqual({ firstName: true, lastName: true });
      expect(validatePassword('xxMcTestersonxx', userInfo, {
        complexity: { excludeAttributes: ['firstName', 'lastName'] },
      })).toEqual({ firstName: true, lastName: false });
      expect(validatePassword('John_McTesterson', userInfo, {
        complexity: { excludeAttributes: ['firstName', 'lastName'] },
      })).toEqual({ firstName: false, lastName: false });
      expect(validatePassword('John', userInfo, {
        complexity: { excludeAttributes: ['firstName', 'lastName'] },
      })).toEqual({ firstName: false, lastName: true });
    });
  });

  it('should validate excludeUsername', () => {
    userInfo = { identifier: 'testerUser' };

    expect(validatePassword('anotherpass', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('1234', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('testerUser', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(false);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('testerUser', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('testpass', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);

    userInfo = { identifier: 'tester.user+123@okta.com' };

    expect(validatePassword('tester.user', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(false);
    expect(validatePassword('tester.user@okta.com', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(false);
    expect(validatePassword('tester.user+123@okta.com', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(false);
    expect(validatePassword('tester.user', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('tester.user@okta.com', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);
    expect(validatePassword('tester.user+123@okta.com', userInfo, { complexity: { excludeUsername: false } })?.excludeUsername)
      .toEqual(true);

    userInfo = { identifier: 'testeruser@okta.com' };

    expect(validatePassword('testeruser', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(false);
    expect(validatePassword('okta', userInfo, { complexity: { excludeUsername: true } })?.excludeUsername)
      .toEqual(false);
  });

  it('should validate excludeFirstName', () => {
    userInfo = { profile: { firstName: 'Tester' } };

    expect(validatePassword('anotherpass', userInfo, { complexity: { excludeFirstName: true } })?.excludeFirstName)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { excludeFirstName: true } })?.excludeFirstName)
      .toEqual(true);
    expect(validatePassword('1234', userInfo, { complexity: { excludeFirstName: true } })?.excludeFirstName)
      .toEqual(true);
    expect(validatePassword('Tester', userInfo, { complexity: { excludeFirstName: true } })?.excludeFirstName)
      .toEqual(false);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { excludeFirstName: false } })?.excludeFirstName)
      .toEqual(true);
    expect(validatePassword('Tester', userInfo, { complexity: { excludeFirstName: false } })?.excludeFirstName)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { excludeFirstName: false } })?.excludeFirstName)
      .toEqual(true);
    expect(validatePassword('testpass', userInfo, { complexity: { excludeFirstName: false } })?.excludeFirstName)
      .toEqual(true);
  });

  it('should validate excludeLastName', () => {
    userInfo = { profile: { lastName: 'Test' } };

    expect(validatePassword('anotherpass', userInfo, { complexity: { excludeLastName: true } })?.excludeLastName)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { excludeLastName: true } })?.excludeLastName)
      .toEqual(true);
    expect(validatePassword('1234', userInfo, { complexity: { excludeLastName: true } })?.excludeLastName)
      .toEqual(true);
    expect(validatePassword('Test', userInfo, { complexity: { excludeLastName: true } })?.excludeLastName)
      .toEqual(false);
    expect(validatePassword('!@#$%^', userInfo, { complexity: { excludeLastName: false } })?.excludeLastName)
      .toEqual(true);
    expect(validatePassword('Test', userInfo, { complexity: { excludeLastName: false } })?.excludeLastName)
      .toEqual(true);
    expect(validatePassword('   ', userInfo, { complexity: { excludeLastName: false } })?.excludeLastName)
      .toEqual(true);
    expect(validatePassword('testpass', userInfo, { complexity: { excludeLastName: false } })?.excludeLastName)
      .toEqual(true);
  });

  describe('Validate useADComplexityRequirements', () => {
    it.each`
      pw             | isValid
      ${'abcd1234'}  | ${false}
      ${'aaaaaaaa'}  | ${false}
      ${''}          | ${false}
      ${' '}         | ${false}
      ${'abcd1234$'}  | ${true}
      ${'ABCD1234$'}  | ${true}
      ${'abCD$$$$'}  | ${true}
      ${'abCD1234'}  | ${true}
      ${'abCD1234$'} | ${true}
    `('should validate $pw as $isValid', ({ pw, isValid }) => {
      expect(validatePassword(pw, userInfo, { complexity: { useADComplexityRequirements: true } })
        ?.useADComplexityRequirements)
        .toEqual(isValid);
    });

    it.each`
      pw            | minReq
      ${'aBCD1234'} | ${{ minLowerCase: 2 }}
      ${'abcD1234'} | ${{ minUpperCase: 2 }}
      ${'abcdefG1'} | ${{ minNumber: 2 }}
      ${'abcd123$'} | ${{ minSymbol: 2 }}
    `('should ignore existing $minReq requirement and validate $pw as true', ({ pw, minReq }) => {
      expect(validatePassword(
        pw,
        userInfo,
        {
          complexity:
          {
            useADComplexityRequirements: true,
            ...minReq,
          },
        },
      )
        ?.useADComplexityRequirements)
        .toEqual(true);
    });

    it.each`
      pw                      |  excludeReq               | validationRes
      ${'testUser1'}          |  ${'excludeUsername'}     | ${false}   
      ${'Test1234'}           |  ${'excludeFirstName'}    | ${false}
      ${'User1234'}           |  ${'excludeLastName'}     | ${false}
    `('should enforce existing $excludeReq requirement and validate $pw as $validationRes', ({ pw, excludeReq, validationRes } ) => {
      userInfo = { identifier: 'testUser', profile: { firstName: 'Test', lastName: 'User' } };

      expect(validatePassword(
        pw,
        userInfo,
        {
          complexity:
          {
            useADComplexityRequirements: true,
            [excludeReq]: true,
          },
        },
      )
        ?.[excludeReq])
        .toEqual(validationRes);
    });

    it('should enforce existing excludeAttributes requirement', () => {
      userInfo = { identifier: 'testUser', profile: { firstName: 'Test', lastName: 'User' } };

      expect(validatePassword('Test_User_testUser', userInfo, {
        complexity: {
          useADComplexityRequirements: true,
          excludeAttributes: ['username', 'firstName', 'lastName'],
        },
      }))
        .toEqual({
          firstName: false, lastName: false, username: false, useADComplexityRequirements: true,
        });
    });
  });

  describe('Validate combined password settings', () => {
    it('should validate password against minLength, minUpperCase & excludeLastName requirements', () => {
      userInfo = { profile: { lastName: 'Test' } };

      expect(validatePassword('anotherpass', userInfo, {
        complexity: {
          minLength: 10,
          minUpperCase: 1,
          excludeLastName: true,
        },
      })).toEqual({
        minLength: true,
        minUpperCase: false,
        excludeLastName: true,
      });

      expect(validatePassword('anotherPass', userInfo, {
        complexity: {
          minLength: 10,
          minUpperCase: 1,
          excludeLastName: true,
        },
      })).toEqual({
        minLength: true,
        minUpperCase: true,
        excludeLastName: true,
      });

      expect(validatePassword('Test', userInfo, {
        complexity: {
          minLength: 10,
          minUpperCase: 1,
          excludeLastName: true,
        },
      })).toEqual({
        minLength: false,
        minUpperCase: true,
        excludeLastName: false,
      });

      expect(validatePassword('yetanotherpass', userInfo, {
        complexity: {
          minLength: 5,
          minUpperCase: 0,
          excludeLastName: false,
        },
      })).toEqual({
        minLength: true,
        minUpperCase: true,
        excludeLastName: true,
      });
    });

    it('should validate password against minLength, minUpperCase & minSymbol requirements', () => {
      expect(validatePassword('anotherpassS', userInfo, {
        complexity: {
          minLength: 10,
          minUpperCase: 1,
          minSymbol: 1,
        },
      })).toEqual({
        minLength: true,
        minUpperCase: true,
        minSymbol: false,
      });

      expect(validatePassword('1234!@#$', userInfo, {
        complexity: {
          minLength: 4,
          minUpperCase: 1,
          minSymbol: 1,
        },
      })).toEqual({
        minLength: true,
        minUpperCase: false,
        minSymbol: true,
      });

      expect(validatePassword('1234', userInfo, {
        complexity: {
          minLength: 10,
          minUpperCase: 1,
          minSymbol: 1,
        },
      })).toEqual({
        minLength: false,
        minUpperCase: false,
        minSymbol: false,
      });
    });
  });
});
