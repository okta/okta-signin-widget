import { ClientFunction } from 'testcafe';

export const getCSPTrap = ClientFunction( () => { 
  return window.globalCSPTrap;
});
