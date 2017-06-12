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

      it('minLength is 8', function () {
        expect(this.defaultProps['minLength']).toEqual(['number', false, 8]);
      });

      it('minLowerCase is 1', function () {
        expect(this.defaultProps['minLowerCase']).toEqual(['number', false, 1]);
      });

      it('minUpperCase is 8', function () {
        expect(this.defaultProps['minUpperCase']).toEqual(['number', false, 1]);
      });

      it('minNumber is 8', function () {
        expect(this.defaultProps['minNumber']).toEqual(['number', false, 1]);
      });

      it('minSymbol is 8', function () {
        expect(this.defaultProps['minSymbol']).toEqual(['number', false, 1]);
      });

      it('excludeUsername is true', function () {
        expect(this.defaultProps['excludeUsername']).toBeTruthy();
      });
    });

    describe('isEnabled', function () {
      beforeEach(function () {
        this.complexities = PasswordComplexityUtil.complexities;
      });

      it('has 6 properties', function () {
        expect(_.size(this.complexities)).toEqual(6);
      });

      describe('minLength', function () {
        beforeEach(function () {
          this.isEnabled = this.complexities['minLength'].isEnabled;
        });

        it('1 is enabled', function () {
          expect(this.isEnabled(1)).toBeTruthy();
        });

        it('0 is disabled', function () {
          expect(this.isEnabled(0)).toBeFalsy();
        });
      });

      describe('minLowerCase', function () {
        beforeEach(function () {
          this.isEnabled = this.complexities['minLowerCase'].isEnabled;
        });

        it('1 is enabled', function () {
          expect(this.isEnabled(1)).toBeTruthy();
        });

        it('0 is disabled', function () {
          expect(this.isEnabled(0)).toBeFalsy();
        });
      });

      describe('minUpperCase', function () {
        beforeEach(function () {
          this.isEnabled = this.complexities['minUpperCase'].isEnabled;
        });

        it('1 is enabled', function () {
          expect(this.isEnabled(1)).toBeTruthy();
        });

        it('0 is disabled', function () {
          expect(this.isEnabled(0)).toBeFalsy();
        });
      });

      describe('minNumber', function () {
        beforeEach(function () {
          this.isEnabled = this.complexities['minNumber'].isEnabled;
        });

        it('1 is enabled', function () {
          expect(this.isEnabled(1)).toBeTruthy();
        });

        it('0 is disabled', function () {
          expect(this.isEnabled(0)).toBeFalsy();
        });
      });

      describe('minSymbol', function () {
        beforeEach(function () {
          this.isEnabled = this.complexities['minSymbol'].isEnabled;
        });

        it('1 is enabled', function () {
          expect(this.isEnabled(1)).toBeTruthy();
        });

        it('0 is disabled', function () {
          expect(this.isEnabled(0)).toBeFalsy();
        });
      });

      describe('excludeUsername', function () {
        beforeEach(function () {
          this.isEnabled = this.complexities['excludeUsername'].isEnabled;
        });

        it('true is enabled', function () {
          expect(this.isEnabled(true)).toBeTruthy();
        });

        it('false is disabled', function () {
          expect(this.isEnabled(false)).toBeFalsy();
        });
      });
    });

    describe('doesComplexityMeet', function () {
      beforeEach(function () {
        this.complexities = PasswordComplexityUtil.complexities;
      });

      describe('minLength is 10 characters', function () {
        beforeEach(function () {
          this.doesComplexityMeet = _.partial(this.complexities['minLength'].doesComplexityMeet, 10);
        });

        it('10 characters password meets the complexity', function () {
          expect(this.doesComplexityMeet('1234567890')).toBeTruthy();
        });

        it('9 characters password does not meet the complexity', function () {
          expect(this.doesComplexityMeet('123456789')).toBeFalsy();
        });

        it('empty password does not meet the complexity', function () {
          expect(this.doesComplexityMeet('')).toBeFalsy();
        });
      });

      describe('minLowerCase is 2 characters', function () {
        beforeEach(function () {
          this.doesComplexityMeet = _.partial(this.complexities['minLowerCase'].doesComplexityMeet, 2);
        });

        it('a password with 2 lowercase characters meets the complexity', function () {
          expect(this.doesComplexityMeet('12abCD')).toBeTruthy();
        });

        it('a password with 1 lowercase character does not meet the complexity', function () {
          expect(this.doesComplexityMeet('12AaBCD')).toBeFalsy();
        });

        it('empty password does not meet the complexity', function () {
          expect(this.doesComplexityMeet('')).toBeFalsy();
        });
      });

      describe('minUpperCase is 3 characters', function () {
        beforeEach(function () {
          this.doesComplexityMeet = _.partial(this.complexities['minUpperCase'].doesComplexityMeet, 3);
        });

        it('a password with 3 uppercase characters meets the complexity', function () {
          expect(this.doesComplexityMeet('34eFGH')).toBeTruthy();
        });

        it('a password with 2 uppercase character does not meet the complexity', function () {
          expect(this.doesComplexityMeet('34efGH')).toBeFalsy();
        });

        it('empty password does not meet the complexity', function () {
          expect(this.doesComplexityMeet('')).toBeFalsy();
        });
      });

      describe('minNumber is 4 characters', function () {
        beforeEach(function () {
          this.doesComplexityMeet = _.partial(this.complexities['minNumber'].doesComplexityMeet, 4);
        });

        it('a password with 4 numbers meets the complexity', function () {
          expect(this.doesComplexityMeet('12abCD34')).toBeTruthy();
        });

        it('a password with 3 numberes does not meet the complexity', function () {
          expect(this.doesComplexityMeet('12abCD 4')).toBeFalsy();
        });

        it('empty password does not meet the complexity', function () {
          expect(this.doesComplexityMeet('')).toBeFalsy();
        });
      });

      describe('minSymbol is 1 character', function () {
        beforeEach(function () {
          this.doesComplexityMeet = _.partial(this.complexities['minSymbol'].doesComplexityMeet, 1);
        });

        it('a password with 1 symbol meets the complexity', function () {
          expect(this.doesComplexityMeet('a1B@')).toBeTruthy();
        });

        it('a password with no symbol does not meet the complexity', function () {
          expect(this.doesComplexityMeet('a1B')).toBeFalsy();
        });

        it('empty password does not meet the complexity', function () {
          expect(this.doesComplexityMeet('')).toBeFalsy();
        });
      });

      describe('excludeUsername is true', function () {

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
            expect(this.doesComplexityMeet('12ABcd@#')).toBeTruthy();
          });

          it('a password prepend the username does not meet the complexity', function () {
            expect(this.doesComplexityMeet).toBeDefined();
            expect(this.doesComplexityMeet('user@okta.coma12ABcd')).toBeFalsy();
          });

          it('a password append the username does not meet the complexity', function () {
            expect(this.doesComplexityMeet).toBeDefined();
            expect(this.doesComplexityMeet('a12ABcduser@okta.com')).toBeFalsy();
          });

          it('a password contains the username does not meet the complexity', function () {
            expect(this.doesComplexityMeet).toBeDefined();
            expect(this.doesComplexityMeet('a12user@okta.comABcd')).toBeFalsy();
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBeFalsy();
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

          it('any passowrd does not the complexity', function () {
            expect(this.doesComplexityMeet).toBeDefined();
            expect(this.doesComplexityMeet('34EFgh$%')).toBeFalsy();
          });

          it('empty password does not meet the complexity', function () {
            expect(this.doesComplexityMeet('')).toBeFalsy();
          });
        });

      });
    });

  });
});
