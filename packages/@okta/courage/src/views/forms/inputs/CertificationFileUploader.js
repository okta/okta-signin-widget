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
          $(e.target).text(StringUtil.localize('oform.certificate.hide.chain', 'courage'));
        }
        else {
          $certDetails.slideUp(duration, resize);
          $(e.target).text(StringUtil.localize('oform.certificate.view.chain', 'courage'));
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
        {{#if nameOrDownload}}<li class="cert-names {{downloadClass}}">\
          {{#if certNames}}{{certNames}}{{/if}}\
          {{#if downloadClass}}<span class="download-icon icon icon-16 icon-only download-16"></span>{{/if}}\
        </li>{{/if}}\
        {{#if uploadedBy}}{{#if uploadedOn}}\
        <li class="cert-upload-info">\
          {{i18n code="oform.certificate.uploaded" bundle="courage" arguments="uploadedBy;uploadedOn"}} \
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
              {{i18n code="oform.certificate.valid" bundle="courage" arguments="notBefore;notAfter"}}\
            </li>\
          {{/if}}{{/if}}\
          <li class="cert-expiration {{expireClass}}">\
            {{#if expiresInDays}}\
            {{i18n code="oform.certificate.expires" bundle="courage" arguments="expiresInDays"}}\
            {{else}}\
            {{i18n code="oform.certificate.expired" bundle="courage"}}\
            {{/if}}\
          </li>\
        </ul>\
      {{/each}}\
      {{#if multiItems}}\
        <a href="#" class="cert-expand-details">{{i18n code="oform.certificate.view.chain" bundle="courage"}}</a>\
      {{/if}}\
      ',

    fileTypes: ['.crt', '.pem']

  });

});
