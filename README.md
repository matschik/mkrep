# mkrep

> Create your local & Github repository instantly

## ✅ Requirements

- SSH Github key
- NodeJS
- Git

## ⚙️ Setup

```sh
npm i -g mkrep
```

## ✨ Usage

```sh
mkrep my-new-project
```

## 🤔 Why ?

`mkrep` automate the creation of a new Git project hosted on Github.

### Without mkrep

```sh
$ mkdir my-new-project
$ cd my-new-project
$ git init
$ npm init -y
$ git add . && git commit -m "Initial commit"

# Going to Github.com to create a new repository
# Copy new repository URL

$ git remote add origin git@github.com:username/my-new-project.git
$ git push -u origin main
```

### With mkrep

```sh
mkrep my-new-project
```

## ⚖️ License

MIT. Made with 💖
