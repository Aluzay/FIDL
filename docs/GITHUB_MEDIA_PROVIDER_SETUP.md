# GitHub Media Provider Setup for FIDL

This guide only covers how to create the GitHub repository and token required by FIDL.

## 1. Create a dedicated public repository

Create a new GitHub repository, for example:

```text
fidl-media-temp
```

The repository should be public so Instagram can access the temporary media through `raw.githubusercontent.com`.

Create a repository:

https://github.com/new

## 2. Create a Fine-grained Personal Access Token

Open:

https://github.com/settings/personal-access-tokens/new

Or navigate manually:

```text
GitHub
→ Settings
→ Developer settings
→ Personal access tokens
→ Fine-grained tokens
→ Generate new token
```

## 3. Limit the token to the media repository

Under **Repository access**, choose:

```text
Only select repositories
```

Select your dedicated repository, for example:

```text
fidl-media-temp
```

## 4. Add the required permission

Under **Repository permissions**, add:

```text
Contents
→ Read and write
```

No other repository permission is required for FIDL's GitHub media provider.

GitHub API documentation:

https://docs.github.com/en/rest/repos/contents

## 5. Generate and copy the token

Generate the token and copy it immediately.

It will usually start with something similar to:

```text
github_pat_...
```

Do not share or commit this token.

## 6. Add the GitHub configuration to `.env`

Add:

```env
GITHUB_TOKEN=github_pat_...
GITHUB_OWNER=your_github_username
GITHUB_REPO=fidl-media-temp
GITHUB_BRANCH=main
```

Example:

```env
GITHUB_OWNER=Aluzay
GITHUB_REPO=fidl-media-temp
GITHUB_BRANCH=main
```

## 7. Keep secrets out of Git

Make sure your `.gitignore` contains:

```gitignore
.env
node_modules/
```

## Official links

Create a repository:
https://github.com/new

Fine-grained token:
https://github.com/settings/personal-access-tokens/new

Repository Contents API:
https://docs.github.com/en/rest/repos/contents

Fine-grained token permissions:
https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
