# Pages

[Stub] This directory houses our page-specific CSS.

In order to keep our CSS appropriate scoped, please adhere to the following format:

```
// pages/_home.scss

.page--home {
  .home--title {
    position: relative;
  }

  button {
    width: 100%;
  }
}
```

The `.page--home` selector, applied to a high-level container element *only in the "Home" view* will keep these styles safely scoped to that page.
