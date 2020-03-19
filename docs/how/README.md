# How it works
![](https://img.shields.io/github/v/release/tpg/attache?style=flat-square)

Attaché makes a number of assumtions around how your environment is set up. Attaché is not as flexible as other more generic deployment tools, but in turn makes configuration a lot easier and much quicker. Attaché deployments are zero-downtime, meaning you don't need to take your application offline at all when deploying a new release.

- You must be able to access your server via SSH using a private key. Attaché does not support password authentication.
- Your choice of web server muts be configured to serve symbolic links.

Once you have these items sorted, it's fairly simple to get Attaché running. See [Getting Started](/started/) if you're ready to jump right in.

## Zero Downtime
Attaché is a zero downtime deployment tool meaning that users don't experience any downtime between deployments. This is achieved through the use of symbolic links to serve different directories (releases). Each time you complete a deployment, the final step is to replace the symbolic link that the web server is configured to serve.

1. Build CSS and JS assets by running `yarn prod`.
2. Clone the application repository onto the server into a new directory.
3. Create a `storage` directory outside of the newly cloned repo.
4. Create a `.env` file outside of the newly cloned repo.
5. Symlink the `storage` directory into the new repo.
6. Symlink the `.env` file into the new repo.
7. Install Composer dependencies on the server with `composer install`.
8. Copy the compiled assets into the `public/js` and `public/css` directories on the server.
9. Create a symlink to the new repo.

The resulting directory structure on the server should look something like this:

```
/path/to/application
|
+- .env
|
+- storage
|
+- releases
|  |
|  +- cloned_repo
|     |
|     +- .env -> /path/to/application/.env
|     |
|     +- storage -> /path/to/application/storage
|     |
|     +- public
|
+- live -> /path/to/application/releases/cloned_repo
```

Your web server should be configured to serve `/path/to/application/live/public`.

Each time you deploy again, you Attaché will clone the repo into a new directory inside the `releases` directory and replacee the `live` symlink. The web server doesn't know any better.