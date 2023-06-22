# Base UI module

- Generic (business-logic agnostic) components:
  - Handling user input (forms and input fields)
  - Design system components

## Notes

- To avoid name conflicts in case of very generic components (like `Link` or `List`),
  we prefix them with `C` (as Custom), e.g `CLink` or `CList`.

## Best practices

- DON'T use `scoped` for generic (component library) components, so other components can override
  them when necessary.
  - But DO use it in opinionated (specific) components. Altho note that when you use `scoped` you also
    can't target the selectors of child components.
  - So all-in-all, it's better to use BEM rather than `scoped` keyword
