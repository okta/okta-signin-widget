define([
  'okta/jquery',
  'okta/underscore',
  'okta/moment',
  'shared/util/StringUtil',
  './BaseFileUploader'
], function ($, _, moment, StringUtil, BaseFileUploader) {

  return BaseFileUploader.extend({

    className: 'cert-file-upload',

    events: {
      'click .cert-expand-details': function (e) {
        e && e.preventDefault();
        var self = this,
            $certDetails = $(e.target).siblings('.cert-details'),
            duration = $certDetails.length * 75,
            resize = function () {
              self.model.trigger('form:resize');
            };


        if ($certDetails.is(':hidden') || $certDetails.hasClass('hide')) {
          $certDetails.removeClass('hide').hide().slideDown(duration, resize);
          $(e.target).text(StringUtil.localize('oform.certificate.hide.chain'));
        }
        else {
          $certDetails.slideUp(duration, resize);
          $(e.target).text(StringUtil.localize('oform.certificate.view.chain'));
        }
      }
    },

    parse: function (src) {
      var target = _.clone(src || {});
      if (target.notAfter) {
        var diff = moment.utc(target.notAfter).diff(moment.utc(), 'days');
        if (diff > 0) {
          _.extend(target, {
            expiresInDays: diff
          });
        }
        if (diff < 14) {
          target.expireClass = 'cert-expired';
        }
      }
      return target;
    },

    previewTemplate: '\
      <div class="cert-thumbnail"><span class="icon icon-32 icon-only file-cert-32"></span></div>\
      <ul class="cert-details-header">\
        {{#if certNames}}<li class="cert-names">{{certNames}}</li>{{/if}}\
        {{#if uploadedBy}}{{#if uploadedOn}}\
        <li class="cert-upload-info">\
          {{i18n code="oform.certificate.uploaded" bundle="messages" arguments="uploadedBy;uploadedOn"}} \
        </li>\
        {{/if}}{{/if}}\
      </ul>\
      {{#each items}}\
        <ul class="cert-details{{#if multiItems}} hide{{/if}}">\
          {{#if multiItems}}{{#if certName}}\
            <li class="cert-name">{{certName}}</li>\
          {{/if}}{{/if}}\
          {{#if issuer}}<li class="cert-issuer">{{issuer}}</li>{{/if}}\
          {{#if notBefore}}{{#if notAfter}}\
            <li class="cert-valid-date">\
              {{i18n code="oform.certificate.valid" bundle="messages" arguments="notBefore;notAfter"}}\
            </li>\
          {{/if}}{{/if}}\
          <li class="cert-expiration {{expireClass}}">\
            {{#if expiresInDays}}\
            {{i18n code="oform.certificate.expires" bundle="messages" arguments="expiresInDays"}}\
            {{else}}\
            {{i18n code="oform.certificate.expired" bundle="messages"}}\
            {{/if}}\
          </li>\
        </ul>\
      {{/each}}\
      {{#if multiItems}}\
        <a href="#" class="cert-expand-details">{{i18n code="oform.certificate.view.chain"}}</a>\
      {{/if}}\
      ',

    fileTypes: ['.crt', '.pem']

  });

});
