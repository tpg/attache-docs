# Base Configuration

![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

The Attaché configuration requires that at least two settings are present in the config file: the `repository` setting and an array `servers`, and there must also be at least one server block inside the `servers` object. A server configuration can have one of each `host`, `port`, `root`, `user` and `branch` attributes. A valid base configuration can look as follows:

```json
{
    "repository": "git@repository.git",
    "servers": {
        "production": {
            "host": "myhost.test",
            "port": 22,
            "user": "user",
            "root": "/path/to/application",
            "branch": "master"
        }
    }
}
```

To create a default base configuration you can run the `attache init` command inside a Git repository. This will attempt to automatically discover the Git remote URL and create a new base configuration.

You can add as many servers as you need as long as they each have a unique `name`. See the [servers](/reference/servers.md) referrence for more details.
