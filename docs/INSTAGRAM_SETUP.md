# Instagram Setup for FIDL

This guide only covers how to configure Instagram and get the values required by FIDL.

FIDL currently requires:

```env
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
```

FIDL uses **Instagram API with Instagram Login**.

A Facebook Page is not required for this setup.

## 1. Use an Instagram professional account

Your Instagram account must be one of these account types:

```text
Creator
Business
```

A personal Instagram account cannot use the publishing API.

Instagram professional account help:

https://help.instagram.com/138925576505882/

## 2. Create a Meta for Developers account

Open:

https://developers.facebook.com/

Sign in and complete the Meta for Developers registration if required.

## 3. Create a Meta app

Open:

https://developers.facebook.com/apps/

Click:

```text
Create App
```

When Meta asks for a use case, select the Instagram use case for managing Instagram content and messages.

In the current Meta interface this may appear as:

```text
Manage messages and content on Instagram
```

Complete the app creation process.

## 4. Open the Instagram API configuration

Inside your Meta app, open:

```text
Use cases
→ Instagram API
→ API setup with Instagram login
```

Use the **Instagram Login** configuration, not the Facebook Login configuration.

Official Meta Instagram API documentation:

https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login

## 5. Enable the permissions required by FIDL

FIDL needs these permissions:

```text
instagram_business_basic
instagram_business_content_publish
```

`instagram_business_basic` allows FIDL to access basic information about the connected Instagram professional account.

`instagram_business_content_publish` allows FIDL to publish Instagram content.

In Meta for Developers, open:

```text
Use cases
→ Instagram API
→ Permissions and features
```

Make sure both permissions are available for testing.

Official Meta permission names:

https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login

## 6. Add your Instagram account as a tester

While the Meta app is in Development mode, add the Instagram account that will be used with FIDL as an Instagram tester.

Open:

```text
App roles
→ Roles
→ Add people
```

Select:

```text
Instagram Tester
```

Add your Instagram account.

## 7. Accept the tester invitation

Sign in to the Instagram account that you added as a tester.

Open Instagram's connected apps / websites settings and accept the tester invitation for your Meta app.

If the account has not accepted the invitation, Meta may not allow it to generate an access token.

## 8. Add the Instagram account to the API setup

Return to Meta for Developers:

```text
Use cases
→ Instagram API
→ API setup with Instagram login
```

Find:

```text
Generate access tokens
```

Click:

```text
Add account
```

Connect the Instagram Creator or Business account that you want FIDL to use.

## 9. Generate the access token

After the account appears in the **Generate access tokens** section, click:

```text
Generate token
```

Authorize the requested Instagram permissions.

Copy the generated token.

Store it in your `.env`:

```env
INSTAGRAM_ACCESS_TOKEN=your_access_token
```

Do not share or commit this token.

## 10. Get the Instagram User ID

FIDL also needs the numeric Instagram User ID.

The easiest way to retrieve it is with the Instagram API.

Replace `YOUR_TOKEN` with the token generated in the previous step:

```text
https://graph.instagram.com/me?fields=id,username,account_type&access_token=YOUR_TOKEN
```

A successful response looks similar to:

```json
{
  "id": "27825619990450042",
  "username": "your_username",
  "account_type": "MEDIA_CREATOR"
}
```

Copy the value of `id` into `.env`:

```env
INSTAGRAM_USER_ID=27825619990450042
```

Do not use the Instagram App ID here. FIDL needs the **Instagram account/user ID** returned by `/me`.

## 11. Final `.env`

For Instagram, FIDL only needs:

```env
INSTAGRAM_ACCESS_TOKEN=your_access_token
INSTAGRAM_USER_ID=your_instagram_user_id
```

Your full `.env` can also contain credentials for the Media Provider you choose.

## 12. Keep the token out of Git

Make sure `.gitignore` contains:

```gitignore
.env
node_modules/
```

Never commit your Instagram access token.

## Optional: Instagram App ID and App Secret

Meta also shows:

```text
Instagram App ID
Instagram App Secret
```

in the Instagram API setup page.

They are not currently required for the basic FIDL configuration shown above, because FIDL uses the generated Instagram access token and Instagram User ID.

Keep the App Secret private if you use it later for OAuth or other authentication flows.

## Official links

Meta for Developers:

https://developers.facebook.com/

Meta Apps:

https://developers.facebook.com/apps/

Instagram API with Instagram Login:

https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login

Instagram API documentation:

https://www.postman.com/meta/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00
