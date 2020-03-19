# Script Hooks
![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

Attaché's deployment process is fairly rigid and doesn't really allow for much customization. This is by design and follows a deployment method that has been tried and well tested. However, in some cases, you may need to add steps to the different deployment tasks. That's where **script hooks** come in. There's nothing all that complex about script hooks, but they do allow for a small amount of flexibility around your deployments.

There are a few script hooks available and they let you insert commands before or after any number of steps during deployment. There are four tasks that are run for each deployment, namely **build**, **deploy**, **assets** and **live**. The big one is the **deploy** task, which contains a number of steps. The others represent smaller, but no-less important task. You can hook into any one of these tasks, either before or after, by passing an array of commands to hooks specified in a `scripts` object per server.

```json{5-9}
{
    "servers": [
        {
            "name": "production",
            "scripts": {
                "before-deploy": [
                    "echo \"Deploying\""
                ]
            }
        }
    ]
}
```

## Task hooks
Each task has a `before` and `after` script hook. So there is a `before-build`, an `after-build`, a `before-deply` and an `after-deploy`. The same for `assets` and `live`.

For example, if you're using the `migrate` setting and allowing Attaché to migrate changes to your database, you might consider dumping your database just before deployment.

```json{6-8}
{
    "servers": [
        {
            "name": "production",
            "scripts": {
                "before-deploy": [
                    "mysqldump --databases my_app storage/backups/backup.sql"
                ]
            }
        }
    ]
}
```

## Deploy step hooks
In addition to the hooks around the for major tasks, you can also hook into the steps within the tasks. The following steps also have before and after script hooks:

| Step | Description |
|------|-------------|
| `clone` | Run scripts before or after the project is cloned from the Git repo. |
| `prep-composer` | Run scripts before or after Composer is downloaded or updated. |
| `composer` | Run scripts before or after the `composer install` command is run. |
| `install` | Run scripts before or after the `.env` and `storage` created during install. |
| `symlinks` | Run scripts before or after the `.env` and `storage` symbolic links are created. |
| `migrate` | Run scripts before or after the database is migrated. |

Some scripts are dependent on configuration or current process. The `install` scripts will only run during installation when running the `attache install` command, and the `migrate` scripts will only run if the `migrate` setting has been set to `true` in the configuration.

The previous example could then be updated by changing the `before-deploy` hook to a `before-migrate` hook ensuring that it only runs when migrations are done.

You can add as many commands per script hook as you like. Since they are arrays you can simply comma-separate script lines.

```json{5-8}
{
    "name": "server",
    //...
    "scripts": {
        "after-composer": [
            "echo \"Dependencies installed.\"",
            "@php @release/artisan custom-command"
        ]
    }
}
```

## Script tags
All scripts are run from the servers root path. This means that if you need to access files from your scripts that belong to the current release, you'll need to know the release ID. Since you won't actually have that information, Attaché provides a script tag that will insert the correct path to the release into your script. There are a few other tags as well which can be handy.

All tags are prefixed with a single `@`. If needed, you can also surround your tags using double-braces:

```json
{
    "after-composer": [
        "releases/{{ @release }}/artisan some-command"
    ]
}
```

### Available tags

| Tag | Description |
|-----|-------------|
| `@php` | The configured PHP binary. |
| `@composer` | The configured Composer binary. |
| `@release` | The ID of the current release. |

::: warning
Do not attempt to use the `@release` tag in a `before-build`, `after-build`, `before-deploy` or `before-clone` script hook as the ID will be that of the currently ACTIVE release. This is a result of the new release not actually existing on the server yet.
:::