# mi2b2

[![Join the chat at https://gitter.im/FNNDSC/mi2b2](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/FNNDSC/mi2b2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The Mi2b2 Viewer is a distributed collaborative neuroimage visualization application that is
delivered to the users over the web without requiring the installation of any additional software
or browser plugging. This not only enhances accessibility and usability for the end-users but
automatically provides them with the latest application updates without requiring any technological
skills or administrator-level access to their computing devices.

The viewer can read a directory tree (chrome) or multiple neuroimage files in the same
directory (other browsers) for their visualization and collaboration through the embedded
[viewerjs.Viewer](https://github.com/FNNDSC/viewerjs) visualization object (VObj).
Alternatively users can directly drag in and drop files/folders onto the viewer.
In addition a predefined library of neuroimage atlases is also provided.

Users can start a real-time collaboration session as the collaboration owner or alternatively
joint to an existing collaboration session by clicking the "Start collaboration" button. The
Google’s login and/or authorization windows will then pop up and after successful completion
they will be able to share visualization and collaborate in real-time.

Please take a look at the [viewerjs.Viewer's wiki](https://github.com/FNNDSC/viewerjs/wiki) to
learn how to interact with the embedded VObj through peripheral device controls.

A stable version of the web application is available here: <http://mi2b2.babymri.org>.

A dev version the web application is available here: <http://fnndsc.github.io/mi2b2/>.

Note that in some cases both of these versions might be identical; however the dev version
will typically change first before that is rolled out to stable.


## Build
This project uses grunt.

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

### Clone

Directly with ssh

````
git clone git@github.com:FNNDSC/mi2b2.git
````

or, with https

````
https://github.com/FNNDSC/mi2b2.git
````

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
