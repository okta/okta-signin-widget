/**
 * @jest-environment jsdom
 */

import createCache from '@emotion/cache';
import { createSerializer } from '@emotion/jest';
import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { render } from '@testing-library/preact';
import React from 'react';

import logicalRtl from '../..';
import { safeQuerySelector } from '../../testUtils';

expect.addSnapshotSerializer(createSerializer());

describe('with emotion environment', () => {
  it('generates styles for simple scenario', async () => {
    const { body } = document;
    body.innerHTML = `
      <div id="container" />
    `;

    const cache = createCache({
      key: 'test',
      stylisPlugins: [logicalRtl({ rootDirElement: '#container' })],
      container: safeQuerySelector(document, '#container'),
    });

    const Button = styled.div(() => ({
      color: 'red',
      paddingInlineEnd: '10px',
      paddingBlockEnd: '10px',
    }));

    render(
      <CacheProvider value={cache}>
        <Button />
      </CacheProvider>,
    );

    expect(document.getElementsByTagName('style')).toHaveLength(2);

    expect(body).toMatchSnapshot();
  });
});
