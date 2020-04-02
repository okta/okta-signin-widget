export default {
  title () {
    if(this.options.appState.getCurrentViewState().name === 'enroll-factor') {
      return 'Set up Email Authentication';
    } else {
      return 'Verify with Email Authentication';      
    }
  }
};
