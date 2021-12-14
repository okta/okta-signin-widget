import {_, loc} from 'okta';

const fn = {};

// This timezone list could be updated in the future
const timeZone ={
  GMT: 'UTC',
  WET: 'WET',
  CET: 'CET',
  MET: 'MET',
  ECT: 'ECT',
  EET: 'EET',
  MIT: 'Pacific/Apia',
  HST: 'Pacific/Honolulu',
  AST: 'America/Anchorage',
  PST: 'America/Los_Angeles',
  MST: 'America/Denver',
  PNT: 'America/Phoenix',
  CST: 'America/Chicago',
  EST: 'America/New_York',
  IET: 'America/Indiana/Indianapolis',
  PRT: 'America/Puerto_Rico',
  CNT: 'America/St_Johns',
  AGT: 'America/Argentina/Buenos_Aires',
  BET: 'America/Sao_Paulo',
  ART: 'Africa/Cairo',
  CAT: 'Africa/Harare',
  EAT: 'Africa/Addis_Ababa',
  NET: 'Asia/Yerevan',
  PLT: 'Asia/Karachi',
  IST: 'Asia/Kolkata',
  BST: 'Asia/Dhaka',
  VST: 'Asia/Ho_Chi_Minh',
  CTT: 'Asia/Shanghai',
  JST: 'Asia/Tokyo',
  ACT: 'Australia/Darwin',
  AET: 'Australia/Sydney',
  SST: 'Pacific/Guadalcanal',
  NST: 'Pacific/Auckland',
};

fn.getTimeZone = function(){

  const translated = {};
  const keys = Object.keys(timeZone);

  _.each(keys, function(key) {
    translated[key] = loc('timezone.option.label', 'login', [timeZone[key]]);
  });

  return translated;
};

export default fn;