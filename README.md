# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Data

### Adding a new style

`INSERT INTO styles (id, name, weight, thickness) VALUES (gen_random_uuid (), 'Bob', 2.2, 0.08);`

### Adding a new colour

`INSERT INTO colours (id, name) VALUES (gen_random_uuid (), 'Hepzibah');`

### Adding a new style colour

* Get the colour ID from the `colours` table
* Get the style ID from the `styles` table

`INSERT INTO stylescolours (id, "colourId", "styleId", "swatchUrl", "glenRavenName", sku) VALUES (gen_random_uuid (),'05645d5e-af1f-4b57-bc28-a3767c7a0495', '6a90774c-f3bd-427a-962a-fb27680db799', 'https://sienandco.space/assets/pocustone.jpg', null, 'POCSTOFAB' );`



