# nx-deploy
Deployment tool for services of ssh

## Install PM2

```
$ npm install pm2 -g
```

## Initializing

```bash
$ deploy init --host my-ssh-host
```

This will create a default `.deploy.yml` file.
The deployment file is used to configure the deployment scripts.

## Deploying

```bash
$ deploy deploy
```

This will deploy the application with the `.deploy.yml` configuration.

## Deployment Configuration

The configuration is kept in the `.deploy.yml`.

A deployment is splitted into multiple steps and every step can be individually changes through the configuration.

The default steps are `[INITIALIZE, ENSURE, INITIALIZED, APP_UPLOAD, BEFORE_START, START_APP, AFTER_START, BLUEGREEN, BEFORE_STOP, STOP_APP, AFTER_STOP, APP_READY]`

Each step can be customized with any commands. An plugin interface to add more commands is planned for the next release. Currently there are just 3 commands: `ssh, scp, ensure`

##### INITIALIZE
This will copy all deployment scripts from `nx-deploy` onto the server.
It will check if the log & config directory for `nginx` exists.

##### ENSURE
This step will ensure that nodejs is installed, `:nodeVersion` is v7.10.0 by default. Afterwards it will install [`pm2`](https://github.com/Unitech/pm2) globally to use it as the process manager. Then it will run `npm install` for the `nx-deploy` scripts.

##### INITIALIZED
This will strip the extensions of the scripts in the scripts folder. This is just as an example to show how scripts can be transferred to the host and be used to enhance the service and/or deployment process.

##### APP_UPLOAD
This step ensures that a versioned [Capistrano-like](http://pm2.keymetrics.io/docs/tutorials/capistrano-like-deployments) structure will be created. It will first ensure that a directory exists. Then will find an empty port and get a timestamp, using the ssh-save feature to save it to the env.
Afterwards using the timestamp to copy the application into the versioned directory.

##### BEFORE_START
Currently not in use...

##### START_APP
Telling `pm2` to start the application on the free port.

##### AFTER_START
Currently not in use...

##### BLUEGREEN
Using the standard nginx configuration, replace the port with the found free port. Stop nginx... This will cause a short downtime... and start it with the newly created configuration.

##### BEFORE_STOP
Currently not in use...

##### STOP_APP
Use an nodejs script to kill all other processes

##### AFTER_STOP
Currently not in use...

##### APP_READY
And we are done with the basic deployment
