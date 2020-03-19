# Release Management
![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

Attaché provides a few tools for managing the releases on the server. You may have realized that during deployment, a new release is placed in the `releases` directory leaving any previous releases completely intact. You can interact with these releases using the `attache releases` commands.

## Getting a list of releases
The first thin you'll probably want to do is see a list of releases currently sitting on your server. You can do so using the `releases:list` command. Pass in a server name as the first argument if you need to, otherwise the default server config applies here too.

```bash
attache releases:list production
```

This will return a table of releases, their IDs, the date of release, and if the release is active. Output could look a little like:

```
---------------- --------------------- ------------
 ID               Release Date
---------------- --------------------- ------------
 20200317111232   17 March 2020 11:12
 20200317115727   17 March 2020 11:57   <-- active
---------------- --------------------- ------------
```

There are two releases here and the most recent one is currently active.

## Rollback
We all like to think we're amazing at our jobs, but we screw up all the time. And sometimes, those mistakes make their way into production. It's not great and it's usually a scramble to get the previous version back online. Attaché provides a simple `releases:rollback` command that will reactivate the previous release.

```
attache releases:rollback production

Rolled back to 20200317111232
```

If you had to run a `releases:list` command now you'll see that the previous release is now active.

```
---------------- --------------------- ------------
 ID               Release Date
---------------- --------------------- ------------
 20200317111232   17 March 2020 11:12   <-- active
 20200317115727   17 March 2020 11:57
---------------- --------------------- ------------
```

## Activate a specific release
Similar to the `rollback` command, you can specify a release ID to activate. Simply provide the ID of the release followed by the name of the server, or just the release ID if you have a default server set.

```
attache releases:activate 20200317115727 production
```

In addition, if you ever need to simply activate the most recent release again, you can replace the release ID with the keyword `release`.

```
attache releases:activate latest production
```

## Pruning old releases
Leaving releases to sit on the server indefinitely will quickly eat up valuable disk space. Each release could be massive. It's a good idea to keep the number of releases on the server to a bare minimum. Attaché's bare minimum is 2. You can quickly remove old releases from the server using the `releases:prune` command. This will remove all the old releases except the most recent 2.

```
attache releases:prune
```

Pruning is a desctructive action, so Attaché will confirm with you before deleting anything from the server. You can also specify the number of releases to prune by using the `--count` option and giving it a number to remove. If you give a higher number than there are releases, Attaché will always leave the most recent two.

```
attache releases:prune production --count=5
```

You can also prune releases automatically during deployment by using the `--prune` option of the `deploy` command.

```
attache deploy production --prune
```

## Up and Down
Laravel's Artisan command line tool provides plenty of power and is an essential part of any Laravel application. Attaché provides access to just two of artisan's commands: `up` and `down`. This is just for convenience sake and allows you to take the currently active release offline or online.

```bash
# Offline
attache releases:down production

# Online
attache releases:up production
```
