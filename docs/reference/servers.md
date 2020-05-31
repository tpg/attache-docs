# Server Configuration

![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

## Multiple servers

You can set up as many servers are you like in the Attaché configuration file. The `servers` configuration is just a JSON array of objects, each object representing another server. The only requirement is that each server must have a unique `name` attribute.

This can be handy if you want to have your testing, staging and production environments all set up in the same configuration. Or if your application is actually a number of different microservices that get deployed at the same time.

```json
{
    "servers": [
        {
            "name": "production"
            //...
        },
        {
            "name": "staging"
            //...
        },
        {
            "name": "testing"
            //...
        }
    ]
}
```

When deploying, you can simply specify the server you want to deploy to as the only argument of the `deploy` command.

```bash
attache deploy staging
```

If you only have a single server configured, you can omit the server name on the command line.

## Common server configuration

If your configuration includes multiple servers that all share some common configuration, then instead of configuration each server with exactly the same details each time, you can set a `common` server configuration object. Any attributes you set in the `common` object will be set as the default across all your server configurations. You can override the common config by adding the custom attributes to the servers that need them.

```json{2-7}
{
    "common": {
        "host": "myhost.test",
        "port": 22,
        "root": "/root/to/application",
        "user": "user"
    },
    "servers": [
        {
            "name": "staging",
            "branch": "master"
        },
        {
            "name": "testing",
            "branch": "testing"
        },
        {
            "name": "production",
            "branch": "master",
            "host": "myproductionhost.test"
        }
    ]
}
```

The `deploy` script still works in the same way, however, the config from the `common` object will now be applied first and overridden by the attributes in each server block.

```bash
attache deploy staging
# or
attache deploy testing
# or
attache deploy production
```

Each of these deploy commands will share the config from the `common` configuration, but override the name, branch and host settings per server.

## Default server

When you have multiple servers set up, it can be useful to have one of them as the server you deploy to most often. For example, you'll likely deploy to a testing environment more often than to your production environment. Attaché provides a useful feature to set one of your servers as the default by setting the `default` attribute to the name of a server.

```json{3}
{
    "repository": "git@repository.git",
    "default": "staging",
    "servers": [
        {
            "name": "staging"
            //...
        },
        {
            "name": "production"
            //...
        }
    ]
}
```

Now when running any command that requires a server name, Attaché will assume you mean the default one if you don't specify a server name on the command line. So in the example above, `attache deploy` will automatically deploy to the staging server. You can still deploy to your other servers by making sure you specify the name on the command line.

```bash
attache deploy #staging

attache deploy production #production
```

If you only have a single server configuration, then that server will automatically be set as the default. You don't need to specify the `default` in your config file, and you don't need to specify the server name on the command line.

```json
{
    "repository": "git@repository.git",
    "default": "staging",
    "servers": [
        {
            "name": "production"
            //...
        }
    ]
}
```

To deploy to the single server, simply run `attache deploy`:

```bash
# With the example above, these two are identical:

attache deploy

attache deploy production
```

## Custom paths

Attaché is quite opinionated about how the directory structure on the server should appear. However, there is some flexibility in how the directories and files are named. You can configure this on a per-server basis by adding a `paths` object. The `attache init` command already does this when creating a new configuration file. The `paths` object is not required and a the defaults will be used.

```json{6-11}
{
    "servers": [
        {
            "name": "server",
            //...
            "paths": {
                "releases": "releases",
                "serve": "live",
                "storage": "storage",
                "env": ".env"
            }
        }
    ]
}
```

| Path       | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| `releases` | Where your deployments are stored.                                                     |
| `serve`    | The symbolic link that is created to point to the latest release.                      |
| `storage`  | The storage directory. This will be symlinked as `storage` into the latest release.    |
| `env`      | The name of the `.env` file. This will be symlinked as `.env` into the latest release. |

You don't need to provide all of the path overrides. Only the ones you wish to change. So it would be perfectly acceptable if you wanted to change just the `serve` symlink.

```json{7}
{
    "servers": [
        {
            "name": "server",
            //..
            "paths": {
                "serve": "www"
            }
        }
    ]
}
```

The above configuration will create a symbolic link named "www" which will point to the latest release inside the `releases` directory.

## Asset configuration

During deployment Attaché will copy any compiled assets to the server using `scp`. By default Attaché will always copy the entire contents of the `public/js`, `public/css` directories and the `public/mix-manifest.json` file. However, sometimes you may need to copy additional assets that aren't normally a part of your repository. For example, you may have an additional resource that needs to be in the public directory that is created during the build stage. You can specify these assets by added an `assets` config and specifying the local asset filename as the key and the remote asset as the value:

```json{4-7}
{
    "servers": [
        {
            "assets": {
                "public/vendors~js": "public/vendors~js",
                "public/local-asset": "public/remote-asset"
            }
        }
    ]
}
```

Since assets are copied AFTER the symbolic links are created, you can also use this feature to copy assets in your storage directory:

```json{5}
{
    "servers": [
        {
            "assets": {
                "storage/app/public/demo": "storage/app/public/demo"
            }
        }
    ]
}
```

## PHP configuration

Attaché assumes that the command to run PHP on the server is simply: `php`. However, in some cases you may find that you need to configure this. For example, if you don't have control over how PHP is installed, and there are multiple versions available, to use PHP 7.4, you might need to use the command `php74` or perhaps `php-7.4`. Maybe you need to specify the full path to the PHP binary.

Attaché provides a simple configuration solution for this scenario. You can add a `php` configuration and provide the path to the PHP binary, or just the command that needs to be run to the `bin` attribute.

```json{6-10}
{
    "servers": [
        {
            "name": "server",
            //...
            "php": {
                "bin": "php74",
                // or...
                "bin": "/usr/local/bin/php7.4"
            }
        }
    ]
}
```

## Composer configuration

Like like the PHP binary configuration, you can customize the Composer configuration. Attaché assumes that Composer is already installed and on the path and can be run from the command line with a simple `composer`. However, in some cases, you might not have that much control over where Composer installed, how it's named of if you can install it on the path at all.

If the name of the composer binary is something other than `composer`, you can use the same structure as the `php` object.

```json{6-8}
{
    "servers": [
        {
            "name": "server",
            //...
            "composer": {
                "bin": "composer.phar"
            }
        }
    ]
}
```

It's also very possible that you'll need to download composer manually in order to use it. Attaché will do this for you as well. Simply set the `local` attribute to true.

```json{6}
{
    "name": "server",
    //...
    "composer": {
        "bin": "composer.phar",
        "local": true
    }
}
```

This will ensure that a `composer.phar` binary is downloaded and placed at the project root. Attaché will also run a `selfupdate` each time you run the `deploy` command and `local` is set to `true.

Lastly, in some cases you may want to install dev dependencies. This is sometimes true if your demoing a project and you're seeding your database with Faker. In that case you may want to install your dev dependencies. You can do this by setting the `dev` option to `true:

```json{6}
{
    "name": "server",
    "composer": {
        "bin": "composer.phar",
        "local": true,
        "dev": true
    }
}
```

## Migrating a database

Attaché provides a simple solution to help keep your database up-to-date. If you add a `migrate` attribute to your server configuration and set it to `true`, Attaché will also run `php artisan migrate` for you inside your project. However, take note that you should be careful when doing this. Migrating a database can be destructive and since Attaché will force the migration you could potentially do damange to your database if you're not careful. For this reason, the `migrate` attribute defaults to `false` meaning you conciously need to change it to `true`.

```json{4}
{
    "name": "server",
    //...
    "migrate": true
    //...
}
```

If you need to use this feature, it's strongly recommended that you also include a database backup script. A simple way to do this is to use the `mysqldump` command and create a `before-migrate` script hook. See [Script Hooks](/reference/scripts.md) for more detail on running scripts.
