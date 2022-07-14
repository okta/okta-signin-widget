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

// TODO: remove - transform should happen via auth-js instead of raw ionResponse

/**
 * A JSON object with a member named value.
 */
export interface IonValueObject<T> {
  value: T;
}

/**
 * A Value Object where the value member is a JSON array. If a JSON value is an
 * element in a Collection Object's value array, it is said that the Collection
 * Object contains the value
 */
export type IonCollection<T> = IonValueObject<T[]>;

export type IonMediaType = string;

/**
 * A Value Object where the value member is a Base64URL-encoded byte array that
 * also has mimetype and name members representing file metadata.
 */
export type IonFileObject = {
  /**
   * The mediatype member is a JSON string that is equals a syntactically valid
   * Media Type string value.
   *
   * The mediatype member MUST NOT be null.
   *
   * The use of this member is REQUIRED.
   */
  mediatype: IonMediaType;

  /**
   * The name member is the string name of the file. This value is the
   * unqualified file name, without path information.
   *
   * The name member MUST NOT be null. If the file name cannot be determined or
   * represented, the blank string must be used.
   *
   * The use of this member is REQUIRED.
   */
  name: string;

  /**
   * The type member represents the type of Ion object encountered. For Ion File
   * Objects, this member, if present, MUST equal the octet sequence file.
   *
   * If the Ion File Object exists as an element within a Collection Object’s
   * value array and the Collection Object has a etype member equal to the octet
   * sequence file, this member is OPTIONAL.
   *
   * Otherwise, the use of this member in an Ion File Object is REQUIRED.
   */
  type?: 'file';

  /**
   * The value member value is a base64Url-encoded octet sequence according to
   * RFC 4648, Section 5. The string MAY be the empty string to indicate a file
   * of zero length.
   *
   * The value member MUST NOT equal null.
   *
   * The value MAY equal the empty string to indicate a file of zero length.
   *
   * A non-empty value MUST NOT contain characters that are not in the base64Url
   * alphabet.
   *
   * The use of this member is REQUIRED.
   */
  value: string;
};

/**
 * If data can be submitted to a linked resource location, information about
 * that data must be made available to a hypermedia client so it can collect and
 * then submit the data.
 *
 * An Ion Form represents named data values that may be submitted to a linked
 * resource locations. A JSON object of members that describe each named data
 * value is called a Form Field. An Ion Form is then effectively a collection of
 * form fields with additional metadata that controls how the form fields are
 * submitted to a linked resource location.
 *
 * If an Ion Form is also an Ion Link, collected data associated with the form's
 * fields may be submitted to the Form's linked resource location.
 *
 * An Ion Form may not be an Ion Link if and only if that form is nested inside
 * another form or form field. Nesting forms allows for creation of complex
 * object graphs that may be submitted to the top-most form’s linked resource
 * location.
 *
 * An Ion Form MUST also be an Ion Link if it is not nested within another form.
 */
export interface IonFormObject {
  value: IonFormField[]
}

/**
 * A Form that is also a Link. Form data submitted will be sent to the form's
 * href resource location
 */
export interface IonLinkedForm extends IonFormObject, IonLink {}

export interface IonFormField<T = unknown> {
  /**
   * The description member is a string description of the field that may be
   * used to enhance usability, for example, as a tool tip.
   *
   * Use of this member is OPTIONAL.
   */
  desc?: string;

  /**
   * The eform member value is either a Form object or a Link to a Form object
   * that reflects the required object structure of each element in the field's
   * value array. The name "eform" is short for "element form".
   *
   * If the field's type member is not equal to array or set, an Ion parser MUST
   * ignore the eform member.
   *
   * If the eform member equals null, an Ion parser MUST ignore the eform
   * member.
   *
   * If the eform member is not a valid Ion Form object, an Ion parser MUST
   * ignore the eform member.
   *
   * If the eform member exists and is valid, and the etype member does not
   * exist or equals null, an Ion parser MUST assign the field an etype member
   * with a value of object.
   *
   * If the etype member does not equal object, an Ion parser MUST ignore the
   * eform member.
   *
   * If the eform member is a Link or a Linked Form, Ion parsers MUST NOT submit
   * data to the eform value's linked href location. The eform's href location
   * may only be used to read the associated form to determine the structur eof
   * the associated form object.
   *
   * If it has been determined that the eform member should be evaluated
   * according to these rules, a validating user agent MUST ensure each element
   * in the field's value array conforms to the specified eform form structure
   * before form submission.
   *
   * Use of this member is OPTIONAL.
   */
  eform?: IonFormObject | IonLinkedForm;

  /**
   * The etype member specifies the mandatory data type of each element in a
   * form field's value array. The name "etype" is short for "element type".
   *
   * If the field's type member is not equal to array or set, an Ion parser MUST
   * ignore the etype member.
   *
   * If the etype member equals null and the eform member exists and is a valid
   * Ion form, an Ion parser MUST assign the etype member a value of object.
   *
   * If the etype member does not equal one of the octet sequences Ion Value
   * Object Type Values, an Ion parser MUST ignore the etype member.
   *
   * If the etype member is ignored, an Ion parser MUST NOT perform type
   * validation on any value in the field’s value array before form submission.
   *
   * If it has been determined that the etype member should be evaluated, a
   * validating user agent MUST ensure each element in the fields values array
   * adheres to the specified etype (and any valid eform) before form
   * submission.
   *
   * Use of this member is OPTIONAL.
   */
  etype?: Array<unknown>;

  /**
   * The form member value is either a Form object or a Link to a Form object
   * that reflects the required object structure of the Field value. This allows
   * Ion content authors to define complex data/content graphs that may be
   * submitted to a single linked resource location.
   *
   * Ion parsers MUST ignore a discovered form member if the field type member
   * does not equal object.
   *
   * If the form member is a Link or a Linked Form, Ion parsers MUST NOT submit
   * data to the form value’s linked href location. The form’s href location may
   * only be used to read the associated form to determine the structure of the
   * associated value object.
   *
   * Where a Form contains nested Forms in this manner, the resulting collected
   * data will form an object graph. This data/graph may only be submitted to
   * the top-most Form’s linked resource location; Ion parsers MUST NOT submit
   * data to any nested/child Form linked resource location.
   */
  form?: IonFormObject | IonLink;

  /**
   * The label member is a human-readable string that may be used to enhance
   * usability.
   *
   * Use of this member is OPTIONAL.
   */
  label?: string;

  /**
   * The max member indicates that the field value must be less than or equal to
   * the specified max value.
   *
   * The max member value MUST conform to the data type defined by the type
   * member value; Ion parsers MUST ignore any max member where the max value
   * does not conform to the type data type.
   *
   * The max member value may only be defined when the type value is equal to
   * number, integer, decimal, date, datetime, datetimetz, time, or timetz as
   * defined in Ion Value Object Type Values. Ion parsers MUST ignore any max
   * member if the type member value does not match one of these values.
   *
   * If the min member is present, the max value must be greater than or equal
   * to the min value. Ion parsers MUST ignore both the min member and the max
   * member if the max value is less than the min value.
   *
   * Use of this member is OPTIONAL.
   */
  max?: number | Date;

  /**
   * The maxlength member is a non-negative integer that specifies the maximum
   * number of characters the field value may contain. Ion parsers MUST ignore
   * any maxlength member that has a negative integer value.
   *
   * Ion parsers MUST ignore any discovered maxlength member if the field type
   * equals object, array, or set.
   *
   * If a field has both minlength and maxlength members, the field’s minlength
   * member value MUST be less than or equal to the field’s maxlength member
   * value. Ion parsers MUST ignore both the minlength and maxlength members if
   * the maxlength value is less than the minlength value.
   *
   * Use of this member is OPTIONAL.
   */
  maxlength?: number;

  /**
   * The maxsize member value is a non-negative integer that specifies the
   * maximum number of field values that may be submitted when the field type
   * value equals array or set. Ion parsers MUST ignore any maxsize member that
   * has a negative integer value.
   *
   * If the field type value does not equal array or set, an Ion parser MUST
   * ignore any discovered maxsize member for that field.
   *
   * If a field has both minsize and maxsize members, the field’s maxsize member
   * value MUST be greater than or equal to the field’s minsize member value.
   * Ion parsers MUST ignore both the minsize and maxsize members if the maxsize
   * value is less than the minsize value.
   *
   * Use of this member is OPTIONAL.
   */
  maxsize?: number;

  /**
   * The min member indicates that the field value must be greater than or equal
   * to the specified min value.
   *
   * The min member value MUST conform to the data type defined by the type
   * member value; Ion parsers MUST ignore any min member where the min value
   * does not conform to the type data type.
   *
   * The min member value may only be defined when the type value is number,
   * integer, decimal, date, datetime, datetimetz, time, or timetz as defined in
   * Ion Value Object Type Values. Ion parsers MUST ignore any min member if the
   * type member value does not match one of these values.
   *
   * If the max member is present, the min value must be less than or equal to
   * the max value. Ion parsers MUST ignore both the min member and the max
   * member if the min value is greater than the max value.
   *
   * Use of this member is OPTIONAL.
   */
  min?: number;

  /**
   * The minlength member is a non-negative integer that specifies the minimum
   * number of characters the field value must contain. Ion parsers MUST ignore
   * any minlength member that has a negative integer value.
   *
   * Ion parsers MUST ignore any discovered minlength member if the field type
   * equals object, array, or set.
   *
   * If a field has both minlength and maxlength members, the field’s minlength
   * member value MUST be less than or equal to the field’s maxlength member
   * value. Ion parsers MUST ignore both the minlength and maxlength members if
   * the minlength value is greater than the maxlength value.
   *
   * Use of this member is OPTIONAL.
   */
  minlength?: number;

  /**
   * The minsize member value is a non-negative integer that specifies the
   * minimum number of field values that may be submitted when the field type
   * value equals array or set. Ion parsers MUST ignore any minsize member that
   * has a negative integer value.
   *
   * If the field type value does not equal array or set, an Ion parser MUST
   * ignore any discovered minsize member for that field.
   *
   * If a field has both minsize and maxsize members, the field’s minsize member
   * value MUST be less than or equal to the field’s maxsize member value. Ion
   * parsers MUST ignore both the minsize and maxsize members if the minsize
   * value is greater than the maxsize value.
   *
   * Use of this member is OPTIONAL.
   */
  minsize?: number;

  /**
   * The mutable member indicates whether or not the field value may be modified
   * before it is submitted to the form’s linked resource location.
   *
   * The mutable member is a boolean; it must equal either true or false. null
   * or any other JSON value MUST NOT be specified.
   *
   * A false value indicates that the field value MUST NOT be modified before it
   * is submitted to the form’s linked resource location.
   *
   * If the mutable member is not present, or if it present and equal to true,
   * the field value may be modified before it is submitted to the form’s linked
   * resource location.
   *
   * If a field should be considered mutable, it is RECOMMENDED to omit the
   * mutable member entirely to reduce verbosity.
   *
   * Use of this member is OPTIONAL.
   */
  mutable?: boolean;

  /**
   * The name member is a string name assigned to the field.
   *
   * The name value MUST NOT be null.
   *
   * The name value MUST NOT contain any whitespace.
   *
   * The name value MUST be unique compared to any other Form Field name value
   * in the containing Form's value array.
   *
   * Use of this member is REQUIRED.
   */
  name: string;

  /**
   * The options member is a Collection Object where the value array contains
   * Form Field Option objects. A Form Field Option object contains one or more
   * members defined in Form Field Option Members.
   *
   * When an options member is present and the form field type does not equal
   * set or array, any form field value specified MUST equal one of the values
   * found within the Option array.
   *
   * When an options member is present and the form field type equals set or
   * array, the form field value MUST be a JSON array, and the array MUST NOT
   * contain any value not found within the Option value array.
   *
   * If the field type is not set or array, Ion parsers MUST ignore any option
   * where the option value type is not the same as the field type.
   */
  options?: IonCollection<IonFormFieldOption<T>>;

  /**
   * The pattern member is a JSON string that defines a regular expression used
   * to validate the field value.
   *
   * If specified, the pattern member string value must conform to the Pattern
   * grammar defined in Ecma-262 Edition 5.1 Section 15.10.1.
   *
   * The pattern member MUST NOT be specified on fields with non-string or
   * non-date/non-time value types.
   *
   * Use of this member is OPTIONAL.
   */
  pattern?: string | RegExp;

  /**
    * The placeholder member is a short hint string that describes the expected
    * field value.
    *
    * Use of this member is OPTIONAL.
    */
  placeholder?: string;

  /**
    * The required member indicates whether or not the field value may equal null
    * before is submitted to the form’s linked resource location.
    *
    * The required member is a boolean; it must equal either true or false. null
    * or any other JSON value MUST NOT be specified.
    *
    * A true value indicates that the field value MUST NOT equal null before it
    * is submitted to the form’s linked resource location.
    *
    * If the required member is not present, or if it present and equal to false,
    * the field value MAY equal null before it is submitted to the form’s linked
    * resource location.
    *
    * If a field should not be considered required (i.e. optional), it is
    * RECOMMENDED to omit the required member entirely to reduce verbosity.
    *
    * Use of this member is OPTIONAL.
    */
  required?: boolean;

  /**
    * The secret member indicates whether or not the field value is considered
    * sensitive information and should be kept secret.
    *
    * The secret member is a boolean; it must equal either true or false. null or
    * any other JSON value MUST NOT be specified.
    *
    * A true value indicates that the field value is considered sensitive and
    * should be kept secret. If true, user agents MUST mask the value so it is
    * not directly visible to the user.
    *
    * If the secret member is not present, or if it present and equal to false,
    * the field value is not considered sensitive information and does not need
    * to be kept secret.
    *
    * If a field should not be considered secret, it is RECOMMENDED to omit the
    * secret member entirely to reduce verbosity.
    *
    * Use of this member is OPTIONAL.
    */
  secret?: boolean;

  /**
    * The type member specifies the mandatory data type that the value member
    * value must adhere to. The type value is a string and must equal to one of
    * the octet sequences defined in Ion data type.
    *
    * If the type member is not present, an Ion parser MUST assume a default type
    * of string for the field.
    *
    * Validating Ion parsers MUST validate the value member value to ensure it
    * adheres to the specified (or default) type before form submission.
    *
    * If the type member equals array or set, and the elements in the array or
    * set must conform to a particular type and structure, those type constraints
    * may be defined using the etype and eform members.
    *
    * Use of this member is OPTIONAL.
    */
  type?: IonValueObjectType;

  /**
    * The value member reflects the value assigned to the field.
    *
    * If the type member exists and does not equal array or set, a non-null field
    * value value MUST conform to the data type specified by the type member
    * value.
    *
    * If the type member exists and is equal to array or set, a non-null value
    * member value MUST be a JSON array. If the elements of the array must
    * conform to a particular type and structure, those type constraints may be
    * defined using the etype and eform members.
    *
    * Use of this member is OPTIONAL.
    */
  value?: T;

  /**
    * The visible member indicates whether or not the field should be made
    * visible by a user agent. Fields that are not visible are usually used to
    * retain a default value that must be submitted to the form’s linked resource
    * location.
    *
    * The visible member is a boolean; it must equal either true or false. null
    * or any other JSON value MUST NOT be specified.
    *
    * A false value indicates that the field MUST NOT be made visible by a user
    * agent.
    *
    * If the visible member is not present, or if it present and equal to true,
    * the field MUST be made visible by a user agent.
    *
    * If a field should be considered visible, it is RECOMMENDED to omit the
    * visible member entirely to reduce verbosity.
    *
    * Use of this member is OPTIONAL.
    */
  visible?: boolean;
}

/**
 * A Value Object with a value that may be applied to the containing Form
 * Field's value.
 */
export interface IonFormFieldOption<T = void> {
  name?: string;

  /**
   * The enabled member indicates whether or not the Option value may be applied
   * to the containing Form Field’s value.
   *
   * The enabled member is a boolean; it must equal either true or false. null
   * or any other JSON value MUST NOT be specified.
   *
   * A false value indicates that the Option value MUST NOT be applied to the
   * containing Form Field’s value.
   *
   * If the enabled member is not present, or if it present and equal to true,
   * the Option value may be applied to the containing Form Field’s value.
   *
   * If an Option should be considered enabled, it is RECOMMENDED to omit the
   * enabled member entirely to reduce verbosity.
   *
   * Use of this member is OPTIONAL.
   */
  enabled?: boolean;

  /**
   * The label member is a human-readable string that may be used to enhance
   * usability.
   *
   * Use of this member is OPTIONAL.
   */
  label?: string;

  /**
   * The value member reflects the value assigned to the Option. An enabled
   * Option that is selected will have its value applied to the containing Form
   * Field’s value member.
   *
   * Use of this member is REQUIRED.
   */
  value: T;

}

/**
 * A JSON object with an IRI member named href. This is Ion’s JSON serialization
 * of a Web Link that enables linking from one resource to another.
 */
export interface IonLink {
  href: string;
  name?: string;
  rel?: string[];
}

/**
 * Link Relations
 *
 * https://www.iana.org/assignments/link-relations/link-relations.xhtml
 */
export type IonRelation =
 | 'about'
 | 'alternate'
 | 'amphtml'
 | 'appendix'
 | 'apple-touch-icon'
 | 'apple-touch-startup-image'
 | 'archives'
 | 'author'
 | 'blocked-by'
 | 'bookmark'
 | 'canonical'
 | 'chapter'
 | 'cite-as'
 | 'collection'
 | 'contents'
 | 'convertedFrom'
 | 'copyright'
 | 'create-form'
 | 'current'
 | 'describedby'
 | 'describes'
 | 'disclosure'
 | 'dns-prefetch'
 | 'duplicate'
 | 'edit'
 | 'edit-form'
 | 'edit-media'
 | 'enclosure'
 | 'external'
 | 'first'
 | 'glossary'
 | 'help'
 | 'hosts'
 | 'hub'
 | 'icon'
 | 'index'
 | 'intervalAfter'
 | 'intervalBefore'
 | 'intervalContains'
 | 'intervalDisjoint'
 | 'intervalDuring'
 | 'intervalEquals'
 | 'intervalFinishedBy'
 | 'intervalFinishes'
 | 'intervalIn'
 | 'intervalMeets'
 | 'intervalMetBy'
 | 'intervalOverlappedBy'
 | 'intervalOverlaps'
 | 'intervalStartedBy'
 | 'intervalStarts'
 | 'item'
 | 'last'
 | 'latest-version'
 | 'license'
 | 'lrdd'
 | 'manifest'
 | 'mask-icon'
 | 'media-feed'
 | 'memento'
 | 'micropub'
 | 'modulepreload'
 | 'monitor'
 | 'monitor-group'
 | 'next'
 | 'next-archive'
 | 'nofollow'
 | 'noopener'
 | 'noreferrer'
 | 'opener'
 | 'openid2.local_id'
 | 'openid2.provider'
 | 'original'
 | 'P3Pv1'
 | 'payment'
 | 'pingback'
 | 'preconnect'
 | 'predecessor-version'
 | 'prefetch'
 | 'preload'
 | 'prerender'
 | 'prev'
 | 'preview'
 | 'previous'
 | 'prev-archive'
 | 'privacy-policy'
 | 'profile'
 | 'publication'
 | 'related'
 | 'restconf'
 | 'replies'
 | 'ruleinput'
 | 'search'
 | 'section'
 | 'self'
 | 'service'
 | 'service-desc'
 | 'service-doc'
 | 'service-meta'
 | 'sponsored'
 | 'start'
 | 'status'
 | 'stylesheet'
 | 'subsection'
 | 'successor-version'
 | 'sunset'
 | 'tag'
 | 'terms-of-service'
 | 'timegate'
 | 'timemap'
 | 'type'
 | 'ugc'
 | 'up'
 | 'version-history'
 | 'via'
 | 'webmention'
 | 'working-copy'
 | 'working-copy-of';

export type IonObjectMemberType =
  | 'eform'
  | 'etype'
  | 'form'
  | 'href'
  | 'method'
  | 'accepts'
  | 'produces'
  | 'rel'
  | 'type'
  | 'value';

export type IonValueObjectType =
  | 'array'
  | 'binary'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'decimal'
  | 'duration'
  | 'email'
  | 'file'
  | 'integer'
  | 'iri'
  | 'link'
  | 'number'
  | 'object'
  | 'pdatetime'
  | 'ptime'
  | 'set'
  | 'string'
  | 'time'
  | 'url';

export type IonObjectMemberNames =
  | 'eform'
  | 'etype'
  | 'form'
  | 'href'
  | 'method'
  | 'accepts'
  | 'produces'
  | 'rel'
  | 'type'
  | 'value';
