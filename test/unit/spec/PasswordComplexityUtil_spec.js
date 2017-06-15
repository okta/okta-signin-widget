define([
  'okta',
  'okta/underscore',
  'util/PasswordComplexityUtil'
],
function (Okta, _, PasswordComplexityUtil) {

  describe('PasswordComplexityUtil', function () {

    describe('default model properties', function () {
      beforeEach(function () {
        this.defaultProps = PasswordComplexityUtil.modelProps;
      });

      it('has 6 properties', function () {
        expect(_.size(this.defaultProps)).toEqual(6);
      });

      it('minLength is a number, not required and with the default value 8', function () {
        expect(this.defaultProps['minLength']).toEqual(['number', false, 8]);
      });

      it('minLowerCase is a number, not required and with the default value 1', function () {
        expect(this.defaultProps['minLowerCase']).toEqual(['number', false, 1]);
      });

      it('minUpperCase is a number, not required and with the default value 1', function () {
        expect(this.defaultProps['minUpperCase']).toEqual(['number', false, 1]);
      });

      it('minNumber is a number, not required and with the default value 1', function () {
        expect(this.defaultProps['minNumber']).toEqual(['number', false, 1]);
      });

      it('minSymbol is a number, not required and with the default value 8', function () {
        expect(this.defaultProps['minSymbol']).toEqual(['number', false, 1]);
      });

      it('excludeUsername is a boolean, not required and with the default value true', function () {
        expect(this.defaultProps['excludeUsername']).toEqual(['boolean', false, true]);
      });
    });

    describe('complexities', function () {
      beforeEach(function () {
        this.complexities = PasswordComplexityUtil.complexities;
      });

      it('has 6 properties', function () {
        expect(_.size(this.complexities)).toEqual(6);
      });

      describe('minLength', function () {
        beforeEach(function () {
          this.complexity = this.complexities['minLength'];
        });

        it('1 is enabled', function () {
          expect(this.complexity.isEnabled(1)).toBe(true);
        });

        it('0 is disabled', function () {
          expect(this.complexity.isEnabled(0)).toBe(false);
        });

        describe('validation if set to 10 characters', function () {
          beforeEach(function () {
            this.doesComplexityMeet = _.partial(this.complexity.doesComplexityMeet, 10);
          });

          it('a password with 10 characters meets the complexity', function () {
            expect(this.doesComplexityMeet('1234567890')).toBe(true);
          });

          it('a password with 9 characters does not meet the complexity', function () {
            expect(this.doesComplexityMeet('123456789')).toBe(false);
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBe(false);
          });
        });
      });

      describe('minLowerCase', function () {
        beforeEach(function () {
          this.complexity = this.complexities['minLowerCase'];
        });

        it('1 is enabled', function () {
          expect(this.complexity.isEnabled(1)).toBe(true);
        });

        it('0 is disabled', function () {
          expect(this.complexity.isEnabled(0)).toBe(false);
        });

        describe('validation if set to 2 letters', function () {
          beforeEach(function () {
            this.doesComplexityMeet = _.partial(this.complexity.doesComplexityMeet, 2);
          });

          it('a password with 2 lowercase letters meets the complexity', function () {
            expect(this.doesComplexityMeet('12abCD')).toBe(true);
          });

          it('a password with 1 lowercase letters does not meet the complexity', function () {
            expect(this.doesComplexityMeet('12AaBCD')).toBe(false);
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBe(false);
          });
        });
      });

      describe('minUpperCase', function () {
        beforeEach(function () {
          this.complexity = this.complexities['minUpperCase'];
        });

        it('1 is enabled', function () {
          expect(this.complexity.isEnabled(1)).toBe(true);
        });

        it('0 is disabled', function () {
          expect(this.complexity.isEnabled(0)).toBe(false);
        });

        describe('validation if set to 3 letters', function () {
          beforeEach(function () {
            this.doesComplexityMeet = _.partial(this.complexity.doesComplexityMeet, 3);
          });

          it('a password with 3 uppercase characters meets the complexity', function () {
            expect(this.doesComplexityMeet('34eFGH')).toBe(true);
          });

          it('a password with 2 uppercase character does not meet the complexity', function () {
            expect(this.doesComplexityMeet('34efGH')).toBe(false);
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBe(false);
          });
        });
      });

      describe('minNumber', function () {
        beforeEach(function () {
          this.complexity = this.complexities['minNumber'];
        });

        it('1 is enabled', function () {
          expect(this.complexity.isEnabled(1)).toBe(true);
        });

        it('0 is disabled', function () {
          expect(this.complexity.isEnabled(0)).toBe(false);
        });

        describe('validation if set to 4 numbers', function () {
          beforeEach(function () {
            this.doesComplexityMeet = _.partial(this.complexity.doesComplexityMeet, 4);
          });

          it('a password with 4 numbers meets the complexity', function () {
            expect(this.doesComplexityMeet('12abCD34')).toBe(true);
          });

          it('a password with 3 numbers does not meet the complexity', function () {
            expect(this.doesComplexityMeet('12abCD 4')).toBe(false);
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBe(false);
          });
        });
      });

      describe('minSymbol', function () {
        beforeEach(function () {
          this.complexity = this.complexities['minSymbol'];
        });

        it('1 is enabled', function () {
          expect(this.complexity.isEnabled(1)).toBe(true);
        });

        it('0 is disabled', function () {
          expect(this.complexity.isEnabled(0)).toBe(false);
        });

        describe('validation if set to 1 symbol', function () {
          beforeEach(function () {
            this.doesComplexityMeet = _.partial(this.complexity.doesComplexityMeet, 1);
          });

          it('a password with 1 symbol meets the complexity', function () {
            expect(this.doesComplexityMeet('a1B@')).toBe(true);
          });

          it('a password with no symbol does not meet the complexity', function () {
            expect(this.doesComplexityMeet('a1B')).toBe(false);
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBe(false);
          });
        });
      });

      describe('excludeUsername', function () {
        beforeEach(function () {
          this.complexity = this.complexities['excludeUsername'];
        });

        it('true is enabled', function () {
          expect(this.complexity.isEnabled(true)).toBe(true);
        });

        it('false is disabled', function () {
          expect(this.complexity.isEnabled(false)).toBe(false);
        });

        describe('validation', function () {
          beforeEach(function () {
            this.doesComplexityMeet = _.partial(this.complexity.doesComplexityMeet, 3);
          });

          describe('username is set', function () {
            beforeEach(function () {
              var myModel = new (Okta.Model.extend({
                props: {'login': ['string', false, 'user@okta.com']}
              }))();
              this.doesComplexityMeet = _.partial(
                  this.complexities['excludeUsername'].doesComplexityMeet, true, _, myModel);
            });

            it('a password does not contain the username meets the complexity', function () {
              expect(this.doesComplexityMeet).toBeDefined();
              expect(this.doesComplexityMeet('12ABcd@#')).toBe(true);
            });

            it('a password prepend the username does not meet the complexity', function () {
              expect(this.doesComplexityMeet).toBeDefined();
              expect(this.doesComplexityMeet('user@okta.coma12ABcd')).toBe(false);
            });

            it('a password append the username does not meet the complexity', function () {
              expect(this.doesComplexityMeet).toBeDefined();
              expect(this.doesComplexityMeet('a12ABcduser@okta.com')).toBe(false);
            });

            it('a password contains the username does not meet the complexity', function () {
              expect(this.doesComplexityMeet).toBeDefined();
              expect(this.doesComplexityMeet('a12user@okta.comABcd')).toBe(false);
            });

            it('empty password does not meet the complexity', function () {
              expect(this.doesComplexityMeet('')).toBe(false);
            });

          });

          describe('username is empty', function () {
            beforeEach(function () {
              var myModel = new (Okta.Model.extend({
                props: {'login': ['string', false, '']}
              }))();
              this.doesComplexityMeet = _.partial(
                  this.complexities['excludeUsername'].doesComplexityMeet, true, _, myModel);
            });

            it('any password does not the complexity', function () {
              expect(this.doesComplexityMeet).toBeDefined();
              expect(this.doesComplexityMeet('34EFgh$%')).toBe(false);
            });

            it('empty password does not meet the complexity', function () {
              expect(this.doesComplexityMeet('')).toBe(false);
            });
          });
        });
      });
    });
  });
});
