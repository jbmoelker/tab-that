# Tab That

Turn plain markup into an interactive tab component using just data-attributes or a JS API.

Based on [Tab component by João Carmona](https://bitbucket.org/voorhoede/tabthat) and [Tab component by Scott Jehl](http://filamentgroup.com/dwpe/code/tabs/index.html).
Written in format of [Expandible component](https://github.com/jbmoelker/expandible).

## Getting started

### Clone the repository

    $ git clone git@github.com:jbmoelker/tab-that.git
    
### Install dependencies

* [RequireJS](https://github.com/jrburke/requirejs-bower)
* [Airhooks](https://github.com/voorhoede/airhooks)

Install front-end dependencies using [Bower](https://github.com/bower/bower):

    $ bower install
    
Install dev dependencies using [Node NPM](http://nodejs.org/):

    $ npm install

## Usage

 ..

## To do

* Change button API to `[data-tab-select]` and support indices (`[data-tab-select="2"]`) & actions (`data-tab-select="next"]`)
* Add config & examples for `carousel` and `accordion` mode.
* Add support for animations?
* Add support for hover intent?
* Add auto rotate?
* Unbind event listeners on destroy.
