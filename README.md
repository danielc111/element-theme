# element-theme

> Dynamic Theme generator cli tool for Element. This is a fork of [element-theme](https://github.com/ElementUI/element-theme). The main goal of this fork is to provide the tooling to implement runtime theme changes for your application. The tool has been updated to build multiple themes in one pass and provide access to theme variables in your application.

> The current version is compatible with element-ui@2.x.

## Deviations from Original

* The `--config` option now accepts multiple paths for your variables files.

* The build process now has 3 goals:
  * Generate static css for each provided variables file.
  * Generate a copy of the variables file, `_variables.scss` with `:export` so that the theme's variables can be accessed in javascript.
  * Generate a consolidated variables file named `_theme-variables.scss` with each variable prefixed by the theme name to avoid collisions.
      * ie: `$--color-primary` becomes `$--[themeName]-color-primary`
      * Exception - If theme name is `default`, then the variable name will not be modified.

* New generated folder structure:
  ```
  theme
  │   _theme-variables.scss
  │
  └───fonts
  │   │   element-icons.ttf
  │   │   element-icons.woff
  │
  └───themeName
  │   │   _variables.scss
  │   │   index.css
  │   │   ...
  │
  └───themeName
      │   _variables.scss
      │   index.css
      │   ...
  ```

## Theme Name
  The theme name will be derived by the name of your variable files. So if you provide, `gotham.scss`, the theme name will be `gotham`. Use the name `default.scss` if you do not want its variables to be prefixed in `_theme-variables.scss`.

## Installation
install local or global
```shell
npm i element-theme -D
```

install `theme-chalk`
```shell
npm i element-theme-chalk -D
# or from github
npm i https://github.com/ElementUI/theme-chalk -D
```

## CLI
```shell
# init variables file
et --init [file path]

# watch then build - actually I probably broke this, good luck :)
et --watch [--config variable file path] [--out theme path]

# build - can receive multiple theme files
et [--config variable file paths] [--out theme path] [--minimize]
```

## Options
### config
Variable file path, default `./element-variables.css`.

### out
Theme output path, default `./theme`.

### minimize
Compressed file.

### browsers
set browsers, default `['ie > 9', 'last 2 versions']`.

### watch
watch variable file changes then build.

### components
A lists of components that you want to generate themes for.  All by default.

## Config
You can configure some options in `element-theme` by putting it in package.json:
```json
{
  "element-theme": {
    "browsers": ["ie > 9", "last 2 versions"],
    "out": "./theme",
    "config": "./element-variables.css",
    "theme": "element-theme-chalk",
    "minimize": false,
    "components": ["button", "input"]
  }
}
```

## Using themes in your application

  1. In HTML header, include all theme index.css files. Use javascript to enable only the active theme.
      ```html
      <head>
        <!-- To set the active theme, use document.styleSheets[n].disabled = true|false; -->
        <link rel="stylesheet" href="/theme/[themeName]/index.css">
        <link rel="stylesheet" href="/theme/[themeName]/index.css">
      </head>
      ```
  2. Access theme variables in javascript, import `/[themeName]/_variables.scss` to access the theme variables.
      ```js
        import defaultThemeVariables from '/theme/default/_variables.scss';

        console.log(defaultThemeVariables.colorWhite); // prints #fff
      ```
  3. Access theme variables in SCSS, import `/_theme-variables` to get access to variables.
      ```scss
        @import '/theme/_theme-variables.scss';

        #app {
          background: $--background-color-base; // generated from default.scss config

          // when this theme is active, give a parent element this class, such as <html>
          .gotham & {
            background: $--gotham-color-base; // generated from gotham.scss config
          }
        }
      ```




## License
MIT
