# mi2b2

[![Join the chat at https://gitter.im/FNNDSC/mi2b2](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/FNNDSC/mi2b2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Medical image viewer for  mi2b2

## Clone

Directly with ssh

````
git clone git@github.com:FNNDSC/mi2b2.git
````

or, with https

````
https://github.com/FNNDSC/mi2b2.git
````

## Build
This project uses grunt.

### Pre-requisites:
* NodeJs - http://nodejs.org/

* Ensure that your npm is up-to-date: 

````
sudo npm update -g npm
````

* Install grunt's command line interface (CLI) globally: 

````
sudo npm install -g grunt-cli
````

* Install bower: 

````
sudo npm install -g bower
````

### Install components (<tt>viewerjs</tt>)

The following are run from the checked out <tt>mi2b2</tt> directory.

* Install grunt and gruntplugins packages that are needed for development and building. These are defined in <tt>package.json</tt>:

````
npm install
````

* Now install the mi2b2 source dependencies listed in bower.json: 

````
bower install
````

* Run grunt to test and build the project: 

````
grunt
````

The production web app is built within the directory <tt>dist</tt>.



