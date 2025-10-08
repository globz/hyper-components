# hyper-components

*Dynamically import & define web component in HTML*

## Raison d'être

hyper-components allows you to dynamically import and define your web components directly in HTML. 
This strange little script (3kb minified) will let you easily upgrade any class components so that you
can import or define them on demand.

Simply render your component tag and your component will be automatically imported and defined.

Dynamic component creation can help you avoid loading large modules that you don’t need for all use cases, 
for example in unused code path for certain type of users or authorization level.

Here's a neat trick if you are using server-side rendering, now you can simply return your component tag
as part of your HTML response to import and create your component on the fly.

## Requirements

In order for hyper-components to properly work with your web component, you should do the following:

0. Works with class component. ~ *Functional component are currently untested*

1. Unbundled web component, you will now serve them only when needed.

2. If you do not directly define your web component you must `export` it.

```js
export class MyElement extends HTMLElement {

}
// customElements.define('my-element', MyElement);
```

## HTML attributes

You may now use three brand new HTML attributes to do the following:

`hc-dir`||`data-hc-dir` 

Use this attribute to specify the root directory of your web components as the default
value for all of your components.

```html
<body hc-dir="/my/components/directory"></body>
```

You may also override this value per component:

```html
// import from /another/component/directory/header.js
<header-component hc-dir="/another/component/directory" hc-import="header"></header-component>
```

You may also specify sub folders of your root directory like this:

```html
// import from /my/components/directory/subfolder/header.js
<header-component hc-import="/subfolder/header"></header-component>
```

`hc-import`||`data-hc-import`

Use this attribute to dynamically import your component, please note this attribute
will not define your component.

*attribute value may use a leading slash*

```html
<header-component hc-import="header"></header-component>
<header-component hc-import="header.js"></header-component>
<header-component hc-import="header.mjs"></header-component>
<header-component hc-import="header.min.js"></header-component>
```

`hc-define`||`data-hc-define`

Use this attribute to dynamically import and define your component.

If the component is already imported, no network call will be made.

*attribute value may use a leading slash*

```html
<header-component hc-define="header"></header-component>
<header-component hc-define="header.js"></header-component>
<header-component hc-define="header.mjs"></header-component>
<header-component hc-define="header.min.js"></header-component>
```

You may use `hc-import`||`hc-define` once for each components then for subsequent use you may simply
render your component tag without those attributes, providing that no full page reload did occurred.

## TODO
+ catch async/await
+ Create a function for normalizePath to remove code duplicates
