[Live Demo][demo]

**Ember Lighter Table** is a fork of the excellent **[Ember Light Table][ember-light-table]**, but geared toward more flexibility and modularity. For example, as Ember Light Table manages the scroll bar for you, Ember Lighter Table allow you to deal with the scroll bar however you like. For example, it allows you to use the main body scroll bar, which gives better results on mobile devices.

The code base is not stable at the moment, and I don't recommend you use it in production just yet.

## Philosophy

The way Ember Light Table works is that you have a state (a table containing rows and columns) that you feed to the component. You can then tweak the way the component works using flags to enable or disable features. There is also a way to provide custom cells to display images, for example. This is all good and well, but it doesn't allow for more in-depth customization.

The tables, cells and columns object have states that allow to mark them as hidden, selected, focused, etc. In the first iteration, I will keep those flags where they are, but they will not be changed or read by Ember Lighter Table. Now, for example, if you want to be able to select rows, you will have to provide an object that can do that. I call those objects *behaviors*.

### Behaviors

Behaviors are components that receive inputs from the mouse and the keyboard and decide how those inputs should alter the state of the table. Those behaviors are members of exclusion groups, and there cannot be two behaviors in the same group that are active at the same time.

Current exclusion groups are:
- Row focus
- Row selection
- Row expansion

### Events

Ember follows an *actions up, data down* philosophy. Usually, a component has actions that can be routed through parent components, manually, and each component along the way has the possibility to act on the action. Here, instead of having to plug each action handled by the behavior manually, this is done automatically. When a keyboard or a mouse event is received, the behavior *engine* look for an active behavior that can handle the event and calls the specified behavior method.

A behavior specifies a list of events for which a given method should be called. The notation is inspired from **[Ember Keyboard][ember-keyboard]**. It is possible to specify combinations of mouse clicks and keys. Wildcards are supported.

This is a part of the project that might change as I am not completely satisfied with the behavior interface.

### Modularity

Right now, a lot of behaviors are included in the project. The goal is to have a different project for each one of the behaviors and have a different demo project to showcase them.

## Scrolling

The way scrolling is handled in Ember Lighter Table is also different than what is done in Ember Light Table. In Ember Light Table, there is a flag that allows you to specify if you want to use the native scroll bar or a *virtual* one. Scrolling is done *inside* the component.

Here, scrolling is done *outside* the component. If you want scrolling, you have to provide a component that can handle it. The scroll position is provided by *that* component to the table component. The table component, for its part, has an action that can be triggered by behaviors and that has to be connected to the scroll component so that the table can be scrolled automatically to a given row, for example.

The advantages of using scrolling outside the component are enormous. It makes it possible to use the main body scroll bar, which provides a much better scrolling experience on mobile devices (this way, the browser will hide and show the address bar automatically). The same scroll bar can be used to scroll the page and multiple tales embedded in the page, again resulting in a much better experience on mobile devices, etc.

## Features

- Custom component based column headers and cells
- Infinite scroll support
- Select & Multi-select with keyboard support (CMD/CTRL, SHIFT)
- Fixed header and footer
- Grouped columns
- Resizable columns
- Expandable rows
- Responsive
- Scroll Tracking
- Easy table manipulation
- Easy override to table header, body, and footer
- Contextual component for header, body, and footer, as well as loading, no data, and expanded row

[demo]: https://plcarmel.github.io/ember-lighter-table/#/rows/spreadsheet
[ember-light-table]: https://github.com/offirgolan/ember-light-table
[ember-keyboard]: https://github.com/adopted-ember-addons/ember-keyboard

