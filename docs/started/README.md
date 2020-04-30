# Getting Started

![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

::: warning
Attaché requires **PHP 7.4**. Although there is no version requirement on the server except what is required by your application.
:::

## Global installation

You should install Attaché globally using composer:

```
composer global require thepublicgood/attache
```

Make sure that `~/.composer/vendor/bin` is in your path. Now you should have access to Attache from anywhere on your composer through the `attache` command.

## Git repository required

Attaché assumes that your project has already been imported into a Git repository. If not, then you'll need to do that first. Attaché will clone the repository during deployment.

Attaché will also run a `yarn prod` before doing the actual deployment to create compiled assets. You'll want to make sure you're not commiting those compiled assets to your repository. For most Laravel applications your `.gitignore` file should include:

```
public/js/
public/css/
public/mix-manifest.json
```

Or place a `.gitignore file in`public/js`and`public/css` with the following content:

```
!.gitignore
*
```

This will ensure that the `js` and `css` directories are at least created when cloing the repository.

## Initialize a project

Initialize Attaché in your Laravel project by running the following in your project root:

```
attache init
```

The `init` command is usually non-interactive and will create a basic config file named `.attache.json` in your project root. The command will attempt to discover the remote Git URL and add it to your config file automatically. If you have more than one Git remote, the `init` command will give you the option to choose before creating the config file.

The initial config file looks something like this:

```json
{
    "repository": "git@repository.git",
    "servers": [
        {
            "name": "production",
            "host": "example.test",
            "port": 22,
            "user": "user",
            "root": "/path/to/application",
            "paths": {
                "releases": "releases",
                "serve": "live",
                "storage": "storage",
                "env": ".env"
            },
            "php": {
                "bin": "php"
            },
            "composer": {
                "bin": "composer",
                "local": false
            },
            "assets": {
                "public/js": "public/js",
                "public/css": "public/css",
                "public/mix-manifest.json": "public/mix-manifest.json"
            },
            "branch": "master",
            "migrate": false
        }
    ]
}
```

If, for some reason you want to use a different filename, you can use the `--filename` option of the `init` command.

```
attache init --filename=attache-config.json
```

The other Attaché commands will not know how to find the renamed configuration file, you will need to supply a `--config` option with each one.

```
attache deploy production --config=attache-config.json
```

## Safety first

It's recommended that you add `.attache.json` to your .gitignore file unless there is very good reason to not do so. This will ensure you don't potentially commit sensitive details about your environment into a publicly accessible repository. Instead, you could keep a copy of your config locally. If you ever loose the config file, it's simple enough to recreate.

If committing the config file to your repository, ensure that it is private and that your server is properly secured.

## Configuration

Open the `.attache.json` file in your editor. You'll need update the server configuration to reflect your environment. You can configure as many servers as you need. Each server must have a `name`, a `host`, `port`, `user`, `root` and `brach` setting and must have a unique name.

| Setting  | Description                                                      |
| -------- | ---------------------------------------------------------------- |
| `name`   | The unique key that you can use to reference this server.        |
| `host`   | The hostname or IP address of the server.                        |
| `port`   | The SSH port. Usually 22.                                        |
| `user`   | The user that Attaché can log in as to deploy your application.  |
| `root`   | The path to the deployment root (see directory structure below). |
| `branch` | The Git branch to clone from.                                    |

Attaché does not support password authentication and you MUST be able to log in to the server as the specified user using a public-private key.

## Directory structure on the server

When your application is deployed for the first time, Attaché will create a new project in the root path you specify in the config file. A new directory named `releases` will be created to contain the application deployments. A `storage` directory will be created which will be a reflection of your applications `storage` directory. Lastly, a `.env` file will also be placed in the root directory which will be your applications `.env` file. To make your application live a symbolic link named `live` will be created that points to `releases/{release_id}`.

Once deployed, your application structure will look a bit like this:

```
/project/root
|
+- storage
|
+- .env
|
+- releases
|   |
|   +- release_id
|       |
|       +- public
|       |
|       +- storage -> /project/root/storage
|       |
|       +- .env -> /project/root/.env
|
+- live -> /project/root/releases/release_id
```

## Update your web server

In order for this to work, you'll need to update your web server to serve the `live` symbolic link. If you're using Nginx, you don't need to change anything. Just set `root` to point to the symlink. If you're using Apatache, you might need to use something like `+options FollowSymLinks` to get Apatche to actually serve the symbolic link.

## Server `.env` file

This step is optional, but it makes set up a little easier. Create a copy of your `.env` file as `attache.env`:

```
cp .env attache.env
```

Change the content of the new `attache.env` file to match how it would look on the server. If you don't do this, Attaché will use the content of the `.env.example` file but will automatically set `APP_ENV=production` and `EPP_DEBUG=false`.

## First deployment

Before running your first deployment, we'll assume that you have already created a database schema for your application and you've updated the `attache.env` file. If you want, you can also add the `migrate` option to your server config and set it to `true`. This will migrate your database for you.

```json
{
    "name": "production",
    "host": "example.test",
    //...
    "migrate": true
}
```

Once you have the set up tasks complete, you can deploy your application for the first time. Usually when deploying, you'll use the `attache deploy` command, but since this is the first one, you'll need to use the `attache install` command. This takes a few extra steps (like placing the `.env` file and the `storage` directory) that would not normally be done during a normal deployment. Pass the name of the server you configured as an attribute to the `install` command:

```
attache install production --env=attache.env
```

Deployment usually takes a few seconds to a few miinutes depending on the complexity if your application and build tasks.

## Conclusion

If all goes well, your application should now be deployed to the server and accessible via your websites URL. Attaché provides a number of useful configuration options which can help to solve more complex deployment scenarios. Take a look at the [configuration reference](/reference/) for more details.
