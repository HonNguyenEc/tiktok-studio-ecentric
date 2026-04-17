# Architecture Rules (Mandatory)

This project follows a strict **pages ↔ modules mirror** architecture.

## 1) Folder structure rules

```txt
src/
  app/
    app.tsx

  pages/
    auth-page/
      index.tsx
    studio-page/
      index.tsx
    product-page/
      index.tsx
    comment-page/
      index.tsx
    index.ts

  modules/
    auth-page/
      component/
      hook/
      util/
      interface/
    studio-page/
      component/
      hook/
      util/
      interface/
    product-page/
      component/
      hook/
      util/
      interface/
    comment-page/
      component/
      hook/
      util/
      interface/

  common/
    route/
    util/
    type/
    constant/
    hook/

  service/
```

## 2) Page rules (strict)

- Each folder in `src/pages/*` must contain **only `index.tsx`**.
- `pages/*/index.tsx` must only compose/import from its corresponding `modules/*`.
- Do not place page-specific hooks/components/utils directly in `pages/*`.

## 3) Module rules

- `src/modules/<page-name>/` is the implementation area for that page.
- Keep page-owned artifacts inside module subfolders:
  - `component/`
  - `hook/`
  - `util/`
  - `interface/`

## 4) Common rules

- `src/common/*` is for shared cross-page logic only.
- Routes must live in `src/common/route/*` with one aggregate `index.route.tsx`.
- Shared constants/types/helpers belong in `common/constant`, `common/type`, `common/util`.

## 5) Naming conventions

- Main component file: `component.tsx`
- Sub component format: `<name>.<page>.tsx` when context is needed
- Hook format: `use-<feature>.hook.ts`
- Interface format: `<feature>.interface.ts`
- Route format: `<group>.route.tsx`

## 6) Do / Don't

### Do
- Keep `app/app.tsx` as thin composition root.
- Add new page by creating both:
  - `pages/<new-page>/index.tsx`
  - `modules/<new-page>/{component,hook,util,interface}`

### Don’t
- Don’t put business logic directly in `pages/*`.
- Don’t create extra files in `pages/*` besides `index.tsx`.
- Don’t place route files outside `common/route`.
