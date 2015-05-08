# mi2b2

[![Join the chat at https://gitter.im/FNNDSC/mi2b2](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/FNNDSC/mi2b2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Medical image viewer for  mi2b2

### Pre-requisites:
* NodeJs - http://nodejs.org/

#### Ubuntu / Debian

On Ubuntu type systems, you might need to also install legacy node support:

````
sudo apt-get install nodejs-legacy
````

#### Install npm support

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

#### Post npm issues

If you encounter issues with permissions (unable to mkdir for example) when you run npm as yourself, make sure that in your home dir that the npm tree is owned by you:

````
cd ~
sudo chown -R $(whoami) ~/.npm
````

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

Once you've cloned the repo, you'll need to build the subcomponents.

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



