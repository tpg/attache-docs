# Script Hooks

![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

Attaché's deployment process is fairly rigid and doesn't really allow for much customization. This is by design and follows a deployment method that has been tried and well tested. However, in some cases, you may need to add steps to the different deployment tasks. That's where **script hooks** come in. There's nothing all that complex about script hooks, but they do allow for a small amount of flexibility around your deployments.

There are a few script hooks available and they let you insert commands before or after any number of steps during deployment. There are four tasks that are run for each deployment, namely **build**, **deploy**, **assets** and **live**. The big one is the **deploy** task, which contains a number of steps. The others represent smaller, but no-less important task. You can hook into any one of these tasks, either before or after, by passing an array of commands to hooks specified in a `scripts` object per server.

```json{4-6}
{
    "servers": {
        "production": {
            "scripts": {
                "before-deploy": ["echo \"Deploying\""]
            }
        }
    }
}
```

## Task hooks

Each task has a `before` and `after` script hook. So there is a `before-build`, an `after-build`, a `before-deply` and an `after-deploy`. The same for `assets` and `live`.

For example, if you're using the `migrate` setting and allowing Attaché to migrate changes to your database, you might consider dumping your database just before deployment.

```json{5-7}
{
    "servers": {
        "production": {
            "scripts": {
                "before-deploy": [
                    "mysqldump --databases my_app storage/backups/backup.sql"
                ]
            }
        }
    }
}
```

Some scripts are run locally and some are run on the server. Attaché currently doesn't provide a way to force a script to run locally or remotely. You'll need to select the correct depending on where and when it will be run:

| Hook     | Environment | Path             |
| -------- | ----------- | ---------------- |
| `build`  | local       | application root |
| `deploy` | remote      | project root     |
| `assets` | local       | application root |
| `live`   | remote      | project root     |

## Deploy step hooks

In addition to the hooks around the for major tasks, you can also hook into the steps within the tasks. The following steps also have before and after script hooks:

| Step           | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `clone`        | Run scripts before or after the project is cloned from the Git repo.                            |
| `prepcomposer` | Run scripts before or after Composer is downloaded or updated.                                  |
| `composer`     | Run scripts before or after the `composer install` command is run.                              |
| `install`      | Run scripts before or after the `.env` file and `storage` directory are created during install. |
| `symlinks`     | Run scripts before or after the `.env` and `storage` symbolic links are created.                |
| `migrate`      | Run scripts before or after the database is migrated.                                           |

::: tip NOTE
In previous versions, the `prepcomposer` step was named `prep-composer`. As of v0.6.4, the step is named `prepcomposer`.
:::

Bear in mind that all deploy steps are run on the server.

Some scripts are dependent on configuration or current process. The `install` scripts will only run during installation when running the `attache install` command, and the `migrate` scripts will only run if the `migrate` setting has been set to `true` in the configuration.

The previous example could then be updated by changing the `before-deploy` hook to a `before-migrate` hook ensuring that it only runs when migrations are done.

You can add as many commands per script hook as you like. Since they are arrays you can simply comma-separate script lines.

```json{4-7}
{
    //...
    "scripts": {
        "after-composer": [
            "echo \"Dependencies installed.\"",
            "@php @release/artisan custom-command"
        ]
    }
}
```

## The `build` script

Developers often have different approaches to building assets for their projects. For this reason, a `build` script hook was added so that the build task can be altered as you need. By default Attaché will simply run `yarn prod` in your project root and assume that will get your assets built. What if you're not using `yarn`? What if your using something completely different? The `build` script works the same was as any other script hook. Pass an array of commands you need to run:

```json{4}
{
    //...
    "scripts": {
        "build": ["npm run production"]
    }
}
```

::: warning Note
Note that if you provide a `build` script, even if it's an empty array, the default `yarn prod` script will not be executed. This is handy if you don't need the build step at all.
:::

```json{4}
{
    //...
    "scripts": {
        "build": []
    }
}
```

If you don't need to change the script that is used to build assets, but just need to run an extra command, rather use the `before-build` and `after-build` script hooks and leave the `build` script out.

## Script tags

All scripts are run from the servers root path. This means that if you need to access files from your scripts that belong to the current release, you'll need to know the release ID. Since you won't actually have that information, Attaché provides a script tag that will insert the correct path to the release into your script. There are a few other tags as well which can be handy.

All tags are prefixed with a single `@`. If needed, you can also surround your tags using double-braces:

```json
{
    "after-composer": ["releases/{{ @release }}/artisan some-command"]
}
```

### Available tags

| Tag            | Description                                   |
| -------------- | --------------------------------------------- |
| `@php`         | The configured PHP binary.                    |
| `@composer`    | The configured Composer binary.               |
| `@release`     | The ID of the current release.                |
| `@root`        | The remote project root path.                 |
| `@path:<path>` | Returns the full specified path on the server |
| `@artisan`     | Execute artisan commands.                     |

::: tip NOTE
The `@artisan` command will execute artisan from the current deployment. This means that it will run artisan from the previous deployment in except the `after-live` hook, which will run in the new deployment. This is handy if you want to run some clean up commands before the new deployment is installed.
:::
