/**
 * Use this function to mock out Math.random to be monotonically incrementing
 * integers, starting at 1. Each invocation will increment the value returned.
 *
 * This is particularly useful for stabilizing the value of the random
 * unique ID values that some Odyssey components generate internally using
 * the Math.random method in JavaScript.
 *
 * Place this in your test file's `beforeEach` hook:

  beforeEach(() => {
    mockMathRandom();
  });

 */
  export const mockMathRandom = () => {
    let count = 1;
    jest.spyOn(Math, 'random').mockImplementation(() => {
      return count++;
    });
  };
  