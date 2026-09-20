# Facebook Page Setup for FIDL

This guide only covers how to configure a Facebook Page and get the values required by FIDL.

FIDL currently requires:

```env
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
```

FIDL publishes to **Facebook Pages**, not personal Facebook profiles.

## 1. Create or choose a Facebook Page

You need a Facebook Page that your Facebook account can manage.

Facebook Pages:

https://www.facebook.com/pages/

Make sure the Facebook account you use with Meta for Developers has permission to manage the Page.

## 2. Open your Meta app

Open Meta for Developers:

https://developers.facebook.com/apps/

You can reuse the same Meta app that you already use for Instagram.

## 3. Add the Facebook Page use case

Inside your Meta app, open:

```text
Use cases
→ Add use cases
```

Add the use case for managing a Facebook Page.

In the current Meta interface this may appear as:

```text
Manage everything on your Page
```

or:

```text
Tout gérer sur votre Page
```

Then open:

```text
Use cases
→ Manage everything on your Page
→ Customize
```

## 4. Enable the permissions required by FIDL

FIDL needs these Facebook Page permissions:

```text
pages_show_list
pages_read_engagement
pages_manage_posts
```

These permissions are used to:

```text
pages_show_list
→ retrieve the Pages managed by your Facebook account

pages_read_engagement
→ access Page information required by the Pages API

pages_manage_posts
→ create and manage posts on the Page
```

Make sure these permissions are available in:

```text
Use cases
→ Manage everything on your Page
→ Permissions and features
```

## 5. Open Graph API Explorer

Open the Meta Graph API Explorer:

https://developers.facebook.com/tools/explorer/

Select your Meta app, for example:

```text
DietCokeDiete
```

## 6. Generate a User Access Token

In Graph API Explorer, generate a **User Access Token**.

Add these permissions:

```text
pages_show_list
pages_read_engagement
pages_manage_posts
```

Authorize the Facebook account that manages your Page.

> The User Access Token is only used here to retrieve the Page and its Page Access Token.

## 7. Retrieve your Page ID and Page Access Token

In Graph API Explorer, send:

```http
GET /me/accounts?fields=name,id,access_token,tasks
```

Meta returns the Pages that the Facebook account can manage.

Example response:

```json
{
  "data": [
    {
      "name": "My Page",
      "id": "123456789012345",
      "access_token": "EAA...",
      "tasks": [
        "PROFILE_PLUS_CREATE_CONTENT",
        "PROFILE_PLUS_MANAGE"
      ]
    }
  ]
}
```

The two values required by FIDL are:

```text
id
→ Facebook Page ID

access_token
→ Facebook Page Access Token
```

The token returned inside the Page object is a **Page Access Token** and acts on behalf of that Page.

Official Meta token documentation:

https://www.postman.com/meta/facebook/documentation/r56bjfd/facebook-api

## 8. Add the values to `.env`

Add:

```env
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
```

Example:

```env
FACEBOOK_PAGE_ID=123456789012345
FACEBOOK_PAGE_ACCESS_TOKEN=EAA...
```

Do not use the User Access Token here.

FIDL needs the **Page Access Token** returned by `/me/accounts`.

## 9. Test the Page Access Token

Before using FIDL, you can verify that the Page Access Token works.

In Graph API Explorer, switch to the Page Access Token and send:

```http
GET /YOUR_PAGE_ID?fields=id,name
```

Example:

```http
GET /123456789012345?fields=id,name
```

A successful response should look similar to:

```json
{
  "id": "123456789012345",
  "name": "My Page"
}
```

If this request succeeds, your Page ID and Page Access Token are ready for FIDL.

## 10. Final Facebook configuration

FIDL only needs:

```env
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
```

Your `.env` may also contain Instagram, Discord, and Media Provider credentials.

## 11. Keep the token out of Git

Make sure `.gitignore` contains:

```gitignore
.env
node_modules/
```

Never commit or share your Facebook Page Access Token.

If a Page Access Token is exposed publicly or appears in a screenshot, generate a new token before continuing.

## Development mode and App Review

For development and testing with accounts and Pages connected to your Meta app, Development mode may be enough.

If you later allow other people outside your app roles to connect their own Facebook Pages, Meta may require additional access levels and App Review for the requested permissions.

## Official links

Meta for Developers:

https://developers.facebook.com/

Meta Apps:

https://developers.facebook.com/apps/

Graph API Explorer:

https://developers.facebook.com/tools/explorer/

Official Meta Facebook API collection:

https://www.postman.com/meta/facebook/documentation/r56bjfd/facebook-api

Get Page Access Tokens:

https://www.postman.com/meta/facebook/request/bqfxwbp/get-access-tokens-of-pages-you-manage

Get a specific Page Access Token:

https://www.postman.com/meta/facebook/request/tass6hw/get-specific-page-access-token
