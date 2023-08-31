/**
 * @jest-environment jsdom
 */

import React from 'react';
import { prefixer } from 'stylis';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createSerializer } from '@emotion/jest';
import styled from '@emotion/styled';
import { render } from '@testing-library/preact';

import logicalRtl from '../..';

expect.addSnapshotSerializer(createSerializer());

describe('with emotion environment', () => {
  it('generates styles for simple scenario', async () => {
    const body = document.body;
    body.innerHTML = `
      <div id="container" />
    `;

    const cache = createCache({
      key: 'test',
      stylisPlugins: [prefixer, logicalRtl],
      // @ts-expect-error
      container: document.querySelector('#container'),
    });

    const Button = styled.div(() => ({
      paddingInlineEnd: '10px',
    }));

    render(
      <CacheProvider value={cache}>
        <Button />
      </CacheProvider>
    );

    expect(document.getElementsByTagName('style')).toHaveLength(2);

    expect(body).toMatchSnapshot();
  })

});