# Front End Component Library for Fractal

## Manual Installation
To get the project up and running, and view components in the browser, complete the following steps:

1. Download and install Node: <https://nodejs.org/> (v10.12.x)
2. Install Gulp globally `npm install gulp -g`
3. Install project dependencies `npm install`
4. Start the development environment `npn run dev` 
5. Open your browser and visit <https://localhost:3000>

## Development
When developing components, you may want assets automatically compiled and the browser to refresh automatically. To do this, run the following task:

* `npm run dev`

## Creating a static build
To create a static instance of this project, run the following task:

* `npm run build`

This will create a folder called `build`, into which the required files will be created.

## Build Assets

* `npm run buildAssets`

This will build assets (images, sprites, script, css, etc) into build folder.
It's usefull for working with Drupal Local Environment.

## JS/SCSS lint

* `npm run lint` (outdated, need to change lint's rules!).

## Repo structure
Sometimes it’s helpful to know what all these different files are for…

```
/
├─ src/
│  ├─ assets/                 # Assets
│  │  ├─ fonts/               # Font files
│  │  ├─ icons/               # Favicon, Fractal UI icons
│  │  ├─ images/              # Raster images, Sprite images 
│  │  ├─ scripts/             # JavaScript files
│  │  |  ├─ scriptsinit.js    # nit
│  │  |  ├─ utils             # Plugins, Global Classes(classes.js), Global Variables(variables.js), Polyfills
│  │  |  └─ layout.js         # Fractal Custom Scripts
│  │  ├─ sprite-png/          # PNG Sprite Icons
│  │  ├─ sprite-svg/          # SVG Sprite Icons
│  │  └─ styles/              # CSS files
│  │     ├─ components.scss   # File for including Screen Styles of Components
│  │     └─ theme.scss        # Fractal UI Styles
│  └─ components/                     # Components
│       ├─ components.config.yaml     # Global Config
│       ├─ _layout/                   # Render Component Previews
│       └─ theme/                  # Fractal Main Theme
│          ├─ layouts/                # Drupal Page Templates
│          └─ components/             # Fractal Components
├─ tmp/              # Files required for dynamic builds (ignored by Git)
│
├─ .gitignore        # List of files and folders not tracked by Git
├─ .jshintrc         # Linting preferences for JavaScript
├─ .scss-lint.yml    # Linting preferences for CSS
├─ fractal.js        # Configuration for Fractal
├─ gulpfile.js       # Configuration for Gulp tasks
├─ LICENSE           # License information for this project
├─ package.json      # Project manifest
└─ README.md         # This file
```

## Component in Fractal
"Component" is a generic term used by Fractal to describe individual pieces of your website’s UI.

Fractal considers every piece of your markup to be a component. A component could be a tiny chunk of HTML for a text input, it could be a whole page or it could be something in between.

### Simple folder structure of component

`NOTE!!! The choice of the name of the component is very important. It uses everywhere like ID of the component.`

1. `media-image.ckeditor.scss`
Styles of the component in drupal ckeditor (optional)

2. `media-image.styles.scss`
Styles of the component (optional)

3. `media-image.scss`
Screen Styles of the component (optional)

4. `media-image.admin.scss`
Screen Styles of the component for Drupal Admin (optional)

5. `media-image.print.scss`
Printer Styles of the component (optional)

6. `media-image.config.yaml` 
Context Data of the components (mandatory)

7. `media-image.twig`
Twig template of the component (mandatory)

8. `media-image--some-variant.twig`
Variant of display your Component (optional)

9. `media-image.js`
JS code of the component (optional)

10. `media-image.module.js`
JS code of the component(module integration)

## Context Data in Fractal
Context data can consist of simple data types such strings, booleans, numbers, arrays, objects and special fractal handles.

### Default Structure 
```
label: 'Media image'
hidden: false (false by default, optional)
context:
  width: 'standard'
  align: 'left'
variants:
- name: 'Align right'
  context:
    align: 'right'
- name: 'Half width'
  hidden: true (hide this variant from Fractal UI)
  context:
    width: 'half'
```

### Existing Fields of context
1. label
Name of your component in Fractal UI (the best practice to use name of the component without hyphens)
2. hidden 
Hide your component in Fractal UI (false by default). Also you can hide component or variant of component by adding "_" to file or folder name.
`_media-image--align-right.twig`
`_media-image`
3. Any fields like width and align
4. Special Handle `$` + ID of component (`$media-image` or `media-image--variant`)
Return rendered component with ID
5. Special Handle `@` + ID of component
Return context of component with ID
6. `$create_attributes()`
Return empty drupal attribute object with methods and fields

### Using Drupal Settings in Context Data
Generate Script with JSON Object that passed to window.drupalSettings object.
#### How to use
1. Context Data
```
drupal_settings:
   media:
      fractal_id: 'custom_id' (reserved key (optional), if the setting(for example media) uses more than one time)
      some_field: 'custom_value' // output: { "media" : { "custom_id" : { "some_value" : "some_field" } } }
   (or)
   media:
      some_field: 'custom_value'
      some_field2: 'custom_value2' // output: { "media" : { "some_field" : "custom_value", "some_field2" : "custom_value2"  } }
   (or)
   media: 'some_data' // output: { "media" : "some_data" }
```
2. Twig
Include variable `drupal_settings_global` to the preview layout in Fractal
```
{{ drupal_settings_global }} // output: 
```

### Using Attributes in Context Data
```
attributes:
   classes: 'class1 class2 class3'
   (or)
   classes: 
   - 'class1'
   - 'class2'
   - 'class3'
   id: 'custom_id'
   name: 'custom_name'
```

### Variants in Fractal
Fractal UI provides ability to create variants of view for your components
That means you can override default variables or add new to another variant of display.

Variants can be created by context or twig templates.
By context:
```
variants:
- name: 'Name of variant'
  context:
    field: 'new value'
    new_field: 'value'
```
By twig template:
Create new template, for example `media-image--align-right` where `align-right` is name of variant.

### Including static IMGs, Svgs inside templates
1. IMGs 
`{{ theme_path }}/assets/images/...`
2. SVGs 
`{{ theme_path }}/assets/sprite-svg/sprite.svg?v={{ default_query_string }}#download-arrow`

### Including static IMGs inside context
`../../assets/images/...`
